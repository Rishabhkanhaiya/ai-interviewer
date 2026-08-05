"""
Affiliates router — referral code management, dashboard, payouts.
"""

import re
from fastapi import APIRouter, HTTPException, Header
from db.supabase_client import get_supabase
from models.schemas import UpdateUpiRequest
from routers.sessions import get_user_id_from_jwt

router = APIRouter(prefix="/api/affiliates", tags=["affiliates"])


def generate_affiliate_code(name: str, year: int) -> str:
    """Generate a unique affiliate code like RAHUL2025."""
    clean_name = re.sub(r"[^a-zA-Z]", "", name).upper()[:6]
    return f"{clean_name}{year}"


@router.post("/register")
async def register_affiliate(authorization: str = Header(...)):
    """Register user as an affiliate and generate their unique code."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    # Check if already registered
    existing = supabase.table("affiliates").select("*").eq("user_id", user_id).execute()
    if existing.data:
        code = existing.data[0]["code"]
        return {"code": code, "referral_url": f"http://localhost:3000/?ref={code}"}

    # Get user data to generate code
    user_res = supabase.table("users").select("name, graduation_year").eq("id", user_id).execute()
    if not user_res.data or not user_res.data[0].get("name"):
        raise HTTPException(status_code=400, detail="Complete your profile before registering as affiliate")

    user_data = user_res.data[0]
    name = user_data["name"]
    year = user_data.get("graduation_year", 2025)
    base_code = generate_affiliate_code(name, year)

    # Ensure uniqueness
    code = base_code
    suffix = 1
    while True:
        check = supabase.table("affiliates").select("id").eq("code", code).execute()
        if not check.data:
            break
        code = f"{base_code}{suffix}"
        suffix += 1

    supabase.table("affiliates").insert({
        "user_id": user_id,
        "code": code,
    }).execute()

    return {"code": code, "referral_url": f"http://localhost:3000/?ref={code}"}


@router.get("/dashboard")
async def get_dashboard(authorization: str = Header(...)):
    """Get affiliate dashboard — earnings, referrals, pending payout."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    affiliate_res = supabase.table("affiliates").select("*").eq("user_id", user_id).execute()
    if not affiliate_res.data:
        raise HTTPException(status_code=404, detail="Not registered as affiliate")

    a = affiliate_res.data[0]
    pending = a["total_earned_paise"] - a["total_paid_paise"]

    # Get recent referrals
    payouts = (
        supabase.table("affiliate_payouts")
        .select("*, payments(user_id, created_at)")
        .eq("affiliate_id", a["id"])
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return {
        "code": a["code"],
        "referral_url": f"http://localhost:3000/?ref={a['code']}",
        "total_referrals": a["total_referrals"],
        "total_earned_paise": a["total_earned_paise"],
        "pending_payout_paise": pending,
        "upi_id": a.get("upi_id"),
        "payouts": payouts.data or [],
    }


@router.put("/upi")
async def update_upi(body: UpdateUpiRequest, authorization: str = Header(...)):
    """Update affiliate's UPI ID for payouts."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    supabase.table("affiliates").update({"upi_id": body.upi_id}).eq("user_id", user_id).execute()
    return {"status": "ok"}
