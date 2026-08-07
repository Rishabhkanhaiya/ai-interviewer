"""
Email trigger router — triggers email sequences based on platform events.
FastAPI calls these endpoints internally; they proxy to the Next.js email API.
"""
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from .sessions import get_user_jwt_payload
from services.email import (
    on_signup, on_session_completed, on_pack_80_percent_used,
    on_pack_fully_used, on_7_days_no_session, on_14_days_no_session,
    on_drive_alert, on_affiliate_approved, on_affiliate_day3,
    on_affiliate_week1_stats,
)
import os
from db.supabase_client import get_supabase

router = APIRouter(prefix="/api/email", tags=["email"])
INTERNAL_SECRET = os.getenv("INTERNAL_API_SECRET", "")


class NpsRequest(BaseModel):
    score: int
    comment: Optional[str] = None


@router.post("/nps")
async def submit_nps(data: NpsRequest, authorization: str = Header(...)):
    """Save NPS score. Trigger thank-you follow-up if needed."""
    payload = get_user_jwt_payload(authorization)
    user_id = payload.get("sub")
    email = payload.get("email", "")

    # Store in DB
    supabase = get_supabase()
    supabase.table("nps_responses").insert({
        "user_id": user_id,
        "score": data.score,
        "comment": data.comment,
    }).execute()

    # Alert team if score is bad (0-6)
    if data.score <= 6:
        print(f"[NPS] BAD SCORE {data.score} from {email}: {data.comment}")
        # Could send Slack/WhatsApp alert here

    return {"ok": True}


class DriveAlertRequest(BaseModel):
    """Internal — called by admin to trigger drive panic emails"""
    company: str
    college: str
    days_until_drive: int
    target_emails: list[str]
    internal_secret: str


@router.post("/drive-alert")
async def send_drive_alert(data: DriveAlertRequest):
    if data.internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    for email in data.target_emails:
        await on_drive_alert(email, "there", data.company, data.college, data.days_until_drive)
    return {"sent": len(data.target_emails)}
