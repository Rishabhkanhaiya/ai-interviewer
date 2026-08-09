"""
Admin router — internal dashboard metrics. Restricted to team emails only.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from db.supabase_client import get_supabase
from db.redis_client import get_redis
from config import get_settings
from routers.sessions import get_user_id_from_jwt
from routers.affiliates import get_tier
import re

settings = get_settings()
router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_EMAILS = [e.strip() for e in settings.admin_emails.split(",")]


async def require_admin(authorization: str) -> str:
    """Verify caller is an admin."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    user = supabase.table("users").select("is_admin").eq("id", user_id).single().execute()
    if not user.data or not user.data.get("is_admin"):
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

    # Session count and duration
    sessions = supabase.table("sessions").select("id, started_at, duration_seconds").execute()
    total_sessions = len(sessions.data or [])
    
    # Calculate API cost based on time (duration) rather than a flat fee per session
    # Assume 100 paise (₹1.00) per minute of usage (1.66 paise per second)
    total_duration_seconds = sum(s.get("duration_seconds") or 0 for s in (sessions.data or []))
    
    # For sessions without a recorded duration (e.g. still active), assume 5 minutes (300 seconds) average
    sessions_without_duration = sum(1 for s in (sessions.data or []) if not s.get("duration_seconds"))
    estimated_total_seconds = total_duration_seconds + (sessions_without_duration * 300)
    
    # Cost = 100 paise per 60 seconds
    api_cost_paise = int((estimated_total_seconds / 60) * 100)

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


class MaintenanceRequest(BaseModel):
    enabled: bool

@router.post("/maintenance")
async def toggle_maintenance(req: MaintenanceRequest, authorization: str = Header(...)):
    """Toggle maintenance mode (kill switch)."""
    await require_admin(authorization)
    r = await get_redis()
    if req.enabled:
        await r.set("system:maintenance_mode", "1")
    else:
        await r.set("system:maintenance_mode", "0")
    return {"status": "success", "maintenance_mode": req.enabled}


@router.get("/affiliate-applications")
async def list_affiliate_applications(status: str = "pending", authorization: str = Header(...)):
    await require_admin(authorization)
    return get_supabase().table("affiliate_applications").select("*, users(name,email)").eq("status", status).order("created_at").execute().data or []


@router.post("/affiliate-applications/{application_id}/approve")
async def approve_affiliate_application(application_id: str, authorization: str = Header(...)):
    await require_admin(authorization)
    supabase = get_supabase()
    application = supabase.table("affiliate_applications").select("*, users(name)").eq("id", application_id).single().execute()
    if not application.data or application.data["status"] != "pending":
        raise HTTPException(status_code=404, detail="Pending application not found")
    a = application.data
    base = "FL-" + re.sub(r"[^A-Za-z]", "", a["users"]["name"] or "PARTNER").upper()[:8]
    code, suffix = base, 1
    while supabase.table("affiliates").select("id").eq("code", code).execute().data:
        code, suffix = f"{base}{suffix}", suffix + 1
    existing = supabase.table("affiliates").select("id").eq("user_id", a["user_id"]).execute()
    if not existing.data:
        supabase.table("affiliates").insert({"user_id": a["user_id"], "code": code, "affiliate_type": "freelancer", "status": "approved"}).execute()
    supabase.table("affiliate_applications").update({"status": "approved", "reviewed_at": "now()"}).eq("id", application_id).execute()
    return {"status": "approved", "code": code}
