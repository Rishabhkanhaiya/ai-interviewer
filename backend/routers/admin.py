"""
Admin router — internal dashboard metrics. Restricted to team emails only.
"""

from fastapi import APIRouter, HTTPException, Header
from db.supabase_client import get_supabase
from db.redis_client import get_redis
from config import get_settings
from routers.sessions import get_user_id_from_jwt

settings = get_settings()
router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_EMAILS = [e.strip() for e in settings.admin_emails.split(",")]


async def require_admin(authorization: str) -> str:
    """Verify caller is a team member."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    user = supabase.table("users").select("email").eq("id", user_id).single().execute()
    if not user.data or user.data.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user_id


@router.get("/metrics")
async def get_metrics(authorization: str = Header(...)):
    """Return core business metrics for admin dashboard."""
    await require_admin(authorization)
    supabase = get_supabase()

    # User counts
    users = supabase.table("users").select("id, created_at").execute()
    total_users = len(users.data or [])

    # Revenue (completed payments)
    payments = supabase.table("payments").select("amount_paise, created_at").eq("status", "completed").execute()
    total_revenue_paise = sum(p["amount_paise"] for p in (payments.data or []))

    # Session count
    sessions = supabase.table("sessions").select("id, started_at").execute()
    total_sessions = len(sessions.data or [])

    # API cost estimate (sessions × ₹15.80 = 1580 paise)
    api_cost_paise = total_sessions * 1580

    # Net margin estimate
    net_paise = total_revenue_paise - api_cost_paise

    # Active sessions from Redis
    r = await get_redis()
    # Count keys matching session:*:state
    active_sessions = 0
    async for key in r.scan_iter("session:*:state"):
        active_sessions += 1

    # Pending affiliate payouts
    pending_payouts = (
        supabase.table("affiliate_payouts")
        .select("amount_paise, affiliate_id")
        .eq("status", "pending")
        .execute()
    )
    pending_payout_total = sum(p["amount_paise"] for p in (pending_payouts.data or []))

    # Anti-gaming flags
    flagged = supabase.table("sessions").select("id").eq("is_gaming_flagged", True).execute()

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_revenue_paise": total_revenue_paise,
        "api_cost_estimate_paise": api_cost_paise,
        "net_margin_paise": net_paise,
        "active_sessions_now": active_sessions,
        "pending_affiliate_payouts_paise": pending_payout_total,
        "gaming_flagged_sessions": len(flagged.data or []),
    }


@router.post("/payouts/{payout_id}/approve")
async def approve_payout(payout_id: str, authorization: str = Header(...)):
    """Mark an affiliate payout as paid."""
    await require_admin(authorization)
    supabase = get_supabase()
    supabase.table("affiliate_payouts").update({
        "status": "paid",
        "paid_at": "now()",
    }).eq("id", payout_id).execute()

    # Update affiliate total_paid
    payout = supabase.table("affiliate_payouts").select("affiliate_id, amount_paise").eq("id", payout_id).single().execute()
    if payout.data:
        affiliate = supabase.table("affiliates").select("total_paid_paise").eq("id", payout.data["affiliate_id"]).single().execute()
        if affiliate.data:
            new_paid = affiliate.data["total_paid_paise"] + payout.data["amount_paise"]
            supabase.table("affiliates").update({"total_paid_paise": new_paid}).eq("id", payout.data["affiliate_id"]).execute()

    return {"status": "paid"}
