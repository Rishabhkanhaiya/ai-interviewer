"""
Affiliates router — full partner portal API.
Handles: affiliate profile, stats, referrals, payouts, sub-links, leaderboard, apply.
"""

import re
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional
from db.supabase_client import get_supabase
from models.schemas import UpdateUpiRequest
from config import get_settings
from routers.sessions import get_user_id_from_jwt

router = APIRouter(prefix="/api/affiliates", tags=["affiliates"])
settings = get_settings()


def generate_affiliate_code(name: str, affiliate_type: str = "campus") -> str:
    """Generate unique affiliate code. FL- prefix for freelancers, CA- for campus."""
    clean = re.sub(r"[^a-zA-Z]", "", name).upper()[:6]
    prefix = "FL" if affiliate_type == "freelancer" else "CA"
    import random, string
    suffix = ''.join(random.choices(string.digits, k=2))
    return f"{prefix}-{clean}{suffix}"


def get_tier(monthly_sales: int, affiliate_type: str) -> dict:
    if affiliate_type == "campus":
        return {"name": "Campus Partner", "commission_bps": 2000, "commission_paise": 10000}
    if monthly_sales >= 50:
        return {"name": "Freelancer Elite", "commission_bps": 3000, "commission_paise": 15000}
    if monthly_sales >= 25:
        return {"name": "Freelancer Pro", "commission_bps": 2800, "commission_paise": 14000}
    if monthly_sales >= 1:
        return {"name": "Freelancer Standard", "commission_bps": 2500, "commission_paise": 12500}
    return {"name": "Freelancer Standard", "commission_bps": 2500, "commission_paise": 12500}


# ── Registration (campus auto-approve) ────────────────────────────────────────

@router.post("/register")
async def register_affiliate(authorization: str = Header(...)):
    """Register user as campus affiliate and generate their unique code."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    existing = supabase.table("affiliates").select("*").eq("user_id", user_id).execute()
    if existing.data:
        a = existing.data[0]
        return {"code": a["code"], "referral_url": f"{settings.public_app_url}/?ref={a['code']}"}

    user_res = supabase.table("users").select("name, email, graduation_year").eq("id", user_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=400, detail="User not found")
        
    user_data = user_res.data[0]
    name = user_data.get("name")
    
    if not name or not str(name).strip():
        # Fallback to email prefix or generic user
        email = user_data.get("email", "USER")
        name = email.split("@")[0]

    base_code = generate_affiliate_code(name, "campus")
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
        "code": code
    }).execute()

    return {"code": code, "referral_url": f"{settings.public_app_url}/?ref={code}"}


# ── GET /me ─────────────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(authorization: str = Header(...)):
    """Returns affiliate profile: code, tier, commission rate, earnings summary."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    res = supabase.table("affiliates").select("*").eq("user_id", user_id).execute()
    if not res.data:
        return {"has_affiliate": False}

    a = res.data[0]
    monthly_sales = a.get("monthly_sales", 0)
    tier = get_tier(monthly_sales, a.get("affiliate_type", "campus"))
    pending_paise = a["total_earned_paise"] - a["total_paid_paise"]

    return {
        "has_affiliate": True,
        "id": a["id"],
        "code": a["code"],
        "affiliate_type": a.get("affiliate_type", "campus"),
        "status": a.get("status", "approved"),
        "tier": tier["name"],
        "commission_bps": tier["commission_bps"],
        "commission_paise": tier["commission_paise"],
        "total_earned_paise": a["total_earned_paise"],
        "total_paid_paise": a["total_paid_paise"],
        "pending_payout_paise": pending_paise,
        "upi_id": a.get("upi_id"),
        "monthly_sales": monthly_sales,
        "leaderboard_optin": a.get("leaderboard_optin", False),
        "referral_url": f"{settings.public_app_url}/?ref={a['code']}",
    }


# ── GET /stats ─────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(authorization: str = Header(...), period: str = "this_month"):
    """Returns: this_month_earnings, referrals, conversion_rate, all_time_earnings."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    res = supabase.table("affiliates").select("*").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    a = res.data[0]

    # Fetch payout data for monthly stats
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    monthly_payouts = (
        supabase.table("affiliate_payouts")
        .select("amount_paise, created_at, status")
        .eq("affiliate_id", a["id"])
        .gte("created_at", month_start)
        .execute()
    )
    monthly_rows = monthly_payouts.data or []
    this_month_earnings = sum(r["amount_paise"] for r in monthly_rows)
    this_month_referrals = len(monthly_rows)

    # Rough conversion rate: referrals / total_referrals (simple estimate)
    total_refs = a.get("total_referrals", 0)
    conversion_rate = round((total_refs / max(total_refs * 10, 1)) * 100, 1) if total_refs else 0

    return {
        "this_month_earnings_paise": this_month_earnings,
        "this_month_referrals": this_month_referrals,
        "conversion_rate": conversion_rate,
        "all_time_earnings_paise": a["total_earned_paise"],
        "all_time_paid_paise": a["total_paid_paise"],
        "pending_payout_paise": a["total_earned_paise"] - a["total_paid_paise"],
    }


# ── GET /referrals ──────────────────────────────────────────────────────────

@router.get("/referrals")
async def get_referrals(
    authorization: str = Header(...),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query("all"),
):
    """Paginated referrals list."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    res = supabase.table("affiliates").select("id").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    affiliate_id = res.data[0]["id"]

    query = (
        supabase.table("affiliate_payouts")
        .select("id, amount_paise, status, created_at, payout_date, payments(pack_type, created_at)")
        .eq("affiliate_id", affiliate_id)
        .order("created_at", desc=True)
        .range((page - 1) * limit, page * limit - 1)
    )
    if status != "all":
        query = query.eq("status", status)

    result = query.execute()
    return {"referrals": result.data or [], "page": page, "limit": limit}


# ── GET /payouts ─────────────────────────────────────────────────────────────

@router.get("/payouts")
async def get_payouts(authorization: str = Header(...)):
    """All past batch payouts to affiliate."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    res = supabase.table("affiliates").select("id").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    affiliate_id = res.data[0]["id"]

    result = (
        supabase.table("affiliate_payouts")
        .select("*")
        .eq("affiliate_id", affiliate_id)
        .eq("payout_batch", True)
        .order("created_at", desc=True)
        .execute()
    )
    return {"payouts": result.data or []}


# ── PUT /payout-details ───────────────────────────────────────────────────────

@router.put("/payout-details")
async def update_payout_details(body: UpdateUpiRequest, authorization: str = Header(...)):
    """Update UPI ID for payouts."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    supabase.table("affiliates").update({"upi_id": body.upi_id}).eq("user_id", user_id).execute()
    return {"status": "ok"}


# ── PUT /upi (legacy alias) ───────────────────────────────────────────────────

@router.put("/upi")
async def update_upi(body: UpdateUpiRequest, authorization: str = Header(...)):
    return await update_payout_details(body, authorization)


# ── GET + POST /links ─────────────────────────────────────────────────────────

@router.get("/links")
async def get_links(authorization: str = Header(...)):
    """Get all sub-links with click and conversion stats."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    res = supabase.table("affiliates").select("id, code").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    a = res.data[0]

    result = (
        supabase.table("affiliate_sub_links")
        .select("*")
        .eq("affiliate_id", a["id"])
        .order("created_at")
        .execute()
    )
    links = result.data or []

    # Enrich with full URLs
    for link in links:
        link["full_url"] = f"{settings.public_app_url}/?ref={a['code']}&src={link['source_name']}"

    return {"links": links, "code": a["code"]}


@router.post("/links")
async def create_link(body: dict, authorization: str = Header(...)):
    """Create a new trackable sub-link."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    source_name = body.get("source_name", "").lower().strip()
    if not source_name:
        raise HTTPException(status_code=400, detail="source_name is required")

    res = supabase.table("affiliates").select("id, code").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    a = res.data[0]

    result = supabase.table("affiliate_sub_links").insert({
        "affiliate_id": a["id"],
        "source_name": source_name,
        "clicks": 0,
        "conversions": 0,
    }).execute()

    link = result.data[0]
    link["full_url"] = f"{settings.public_app_url}/?ref={a['code']}&src={source_name}"
    return link


# ── GET /leaderboard ──────────────────────────────────────────────────────────

@router.get("/leaderboard")
async def get_leaderboard(authorization: str = Header(...)):
    """Top 20 opted-in affiliates by monthly sales."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    result = (
        supabase.table("affiliates")
        .select("code, affiliate_type, monthly_sales, total_earned_paise, users(name)")
        .eq("leaderboard_optin", True)
        .eq("status", "approved")
        .order("monthly_sales", desc=True)
        .limit(20)
        .execute()
    )
    rows = result.data or []

    # Mask names for privacy: "Rishabh J."
    leaderboard = []
    for i, row in enumerate(rows):
        user_data = row.get("users") or {}
        full_name = user_data.get("name", "Anonymous")
        parts = full_name.split()
        masked = f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else parts[0]
        leaderboard.append({
            "rank": i + 1,
            "name": masked,
            "monthly_sales": row["monthly_sales"],
            "monthly_earnings_paise": row["monthly_sales"] * 10000,
        })

    # Get current user's rank
    my_res = supabase.table("affiliates").select("monthly_sales").eq("user_id", user_id).execute()
    my_sales = my_res.data[0]["monthly_sales"] if my_res.data else 0
    my_rank = None
    for i, row in enumerate(rows):
        if row["monthly_sales"] <= my_sales:
            my_rank = i + 1
            break

    return {"leaderboard": leaderboard, "my_rank": my_rank, "my_monthly_sales": my_sales}


# ── PUT /leaderboard-optin ────────────────────────────────────────────────────

@router.put("/leaderboard-optin")
async def toggle_leaderboard(body: dict, authorization: str = Header(...)):
    """Toggle leaderboard visibility."""
    user_id = get_user_id_from_jwt(authorization)
    opted_in = body.get("opted_in", False)
    supabase = get_supabase()
    supabase.table("affiliates").update({"leaderboard_optin": opted_in}).eq("user_id", user_id).execute()
    return {"status": "ok", "opted_in": opted_in}


# ── GET /dashboard (legacy) ────────────────────────────────────────────────────

@router.get("/dashboard")
async def get_dashboard(authorization: str = Header(...)):
    """Legacy dashboard endpoint — returns combined affiliate data."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    res = supabase.table("affiliates").select("*").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Not registered as affiliate")

    a = res.data[0]
    tier = get_tier(a.get("monthly_sales", 0), a.get("affiliate_type", "campus"))
    pending = a["total_earned_paise"] - a["total_paid_paise"]

    payouts = (
        supabase.table("affiliate_payouts")
        .select("*")
        .eq("affiliate_id", a["id"])
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )
    
    # Calculate real weekly earnings for the last 4 weeks
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    weekly_earnings = []
    
    for i in range(4):
        # Week 4 is the current week, Week 1 is 3 weeks ago
        week_end = now - timedelta(days=7 * (3 - i))
        week_start = week_end - timedelta(days=7)
        
        # Sum amount_paise for payouts in this week window
        week_sum_paise = 0
        if payouts.data:
            for p in payouts.data:
                # parse created_at (e.g. 2026-08-04T21:27:13.715393+00:00)
                try:
                    p_date = datetime.fromisoformat(p["created_at"].replace("Z", "+00:00"))
                    if week_start <= p_date <= week_end:
                        week_sum_paise += p["amount_paise"]
                except ValueError:
                    pass
        
        weekly_earnings.append({
            "name": f"Week {i+1}",
            "earnings": round(week_sum_paise / 100)
        })

    return {
        "code": a["code"],
        "referral_url": f"{settings.public_app_url}/?ref={a['code']}",
        "total_referrals": a["total_referrals"],
        "total_earned_paise": a["total_earned_paise"],
        "pending_payout_paise": pending,
        "upi_id": a.get("upi_id"),
        "payouts": payouts.data[:20] if payouts.data else [],
        "weekly_earnings": weekly_earnings,
        "affiliate_type": a.get("affiliate_type", "campus"),
        "tier": tier["name"],
        "commission_bps": tier["commission_bps"],
        "monthly_sales": a.get("monthly_sales", 0),
        "marketing_kit_url": settings.affiliate_marketing_kit_url or None,
    }


# ── POST /apply (Public) ──────────────────────────────────────────────────────

@router.post("/apply")
async def apply_as_affiliate(body: dict):
    """Public endpoint — submit freelancer application. No auth required."""
    required = ["name", "email", "city", "marketer_type", "promotion_plan"]
    for field in required:
        if not body.get(field):
            raise HTTPException(status_code=400, detail=f"{field} is required")

    if len(body.get("promotion_plan", "")) < 100:
        raise HTTPException(status_code=400, detail="Promotion plan must be at least 100 characters")

    supabase = get_supabase()
    supabase.table("affiliate_applications").insert({
        "name": body["name"],
        "email": body["email"],
        "city": body.get("city", ""),
        "state": body.get("state", ""),
        "marketer_type": body["marketer_type"],
        "platform_links": body.get("platform_links", []),
        "audience_size": body.get("audience_size", 0),
        "promotion_plan": body["promotion_plan"],
        "expected_monthly_sales": body.get("expected_monthly_sales", 0),
        "previous_experience": body.get("previous_experience", ""),
        "status": "pending",
    }).execute()

    return {"status": "submitted"}


# ── GET + POST /applications ───────────────────────────────────────────────────

@router.get("/application")
async def get_application(authorization: str = Header(...)):
    user_id = get_user_id_from_jwt(authorization)
    result = get_supabase().table("affiliate_applications").select("id, status, rejection_reason, created_at").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
    return result.data[0] if result.data else {"status": "none"}
