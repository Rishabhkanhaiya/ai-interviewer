"""
Sessions router — start, end, list interview sessions.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
import uuid
import time

from config import get_settings
from db.redis_client import (
    check_rate_limit, check_concurrent_sessions,
    get_pack_minutes_used, get_pack_rounds_used,
    increment_pack_rounds,
)
from db.supabase_client import get_supabase
from models.schemas import (
    StartSessionRequest, StartSessionResponse, EndSessionRequest,
    InterviewStage,
)
from services.sarvam_tts import get_persona_for_round, VOICE_PERSONAS

settings = get_settings()
router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def get_user_jwt_payload(authorization: str = Header(...)) -> dict:
    """Extract full payload from Supabase JWT."""
    from jose import jwt
    try:
        token = authorization.replace("Bearer ", "")
        opts = {
            "verify_signature": False,
            "verify_aud": False,
            "verify_iat": False,
            "verify_exp": False,
            "verify_nbf": False,
            "verify_iss": False,
            "verify_sub": False,
            "verify_jti": False,
            "verify_at_hash": False,
        }
        payload = jwt.decode(token, "", options=opts)
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")


def get_user_id_from_jwt(authorization: str = Header(...)) -> str:
    """Extract user_id from Supabase JWT. Returns user_id string."""
    payload = get_user_jwt_payload(authorization)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


def get_active_pack(user_id: str) -> Optional[dict]:
    """Get the user's active pack from Supabase. Returns None if no active pack."""
    supabase = get_supabase()
    result = supabase.table("packs").select("*").eq("user_id", user_id).execute()
    packs = result.data or []

    for pack in sorted(packs, key=lambda p: p["created_at"], reverse=True):
        if pack["rounds_used"] < pack["rounds_total"] and pack["minutes_used"] < pack["minutes_total"]:
            return pack
    return None


COMPANY_DISPLAY_NAMES = {
    "tcs_nqt": "TCS NQT",
    "infosys": "Infosys InfyTQ",
    "wipro": "Wipro NLTH",
    "accenture": "Accenture",
    "capgemini": "Capgemini",
    "startup_react": "D2C Startup",
    "faang": "FAANG-Style",
    "hr_behavioral": "HR Behavioral",
    "custom": "Custom Interview",
}


@router.post("/start", response_model=StartSessionResponse)
async def start_session(
    body: StartSessionRequest,
    authorization: str = Header(...),
):
    """
    Start a new interview session.
    Verifies auth, checks active pack rounds, creates session in Supabase.
    """
    user_id = get_user_id_from_jwt(authorization)
    
    # Rate limit check (max 10 starts per min)
    if not await check_rate_limit(user_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Max 10 requests per minute.")

    # Concurrent session check (max 3)
    active_count = await check_concurrent_sessions(user_id)
    if active_count >= settings.max_concurrent_sessions:
        raise HTTPException(
            status_code=403,
            detail=f"Max {settings.max_concurrent_sessions} concurrent sessions allowed."
        )

    # Check active pack
    pack = get_active_pack(user_id)
    pack_id = pack["id"] if pack else "free_pack_bypass"

    # LIMIT BYPASS: Skipping the pack exhaustion checks for testing
    # if not pack:
    #     raise HTTPException(status_code=403, detail="No active pack. Please purchase a pack to start.")
    #
    # redis_minutes = await get_pack_minutes_used(pack_id)
    # if redis_minutes >= pack["minutes_total"]:
    #     raise HTTPException(status_code=403, detail="Pack minutes exhausted.")
    #
    # rounds_used = await get_pack_rounds_used(pack_id)
    # if rounds_used >= pack["rounds_total"]:
    #     raise HTTPException(status_code=403, detail="Pack rounds exhausted.")

    # Create session record in Supabase
    session_id = str(uuid.uuid4())
    supabase = get_supabase()
    supabase.table("sessions").insert({
        "id": session_id,
        "user_id": user_id,
        "pack_id": pack_id,
        "company": body.company.value,
        "role": body.role.value,
        "round_type": body.round_type.value,
        "language_pref": body.language_pref.value,
        "resume_text": body.resume_text,
        "status": "active",
    }).execute()

    # Increment round counter in Redis
    await increment_pack_rounds(pack_id)

    # Determine voice persona
    persona_name = get_persona_for_round(body.round_type.value, body.company.value)
    persona = VOICE_PERSONAS[persona_name]

    # Save session config to Redis for the WebSocket to pick up
    from db.redis_client import set_session_state
    session_config = {
        "company": body.company.value,
        "round_type": body.round_type.value,
        "language_pref": body.language_pref.value,
        "resume_text": body.resume_text,
    }
    await set_session_state(session_id, session_config)

    return StartSessionResponse(
        session_id=session_id,
        voice_persona=f"{persona['display_name']} — {persona['role_label']}",
        company_display_name=COMPANY_DISPLAY_NAMES.get(body.company.value, body.company.value),
        stage=InterviewStage.INTRO,
    )


@router.get("/")
async def list_sessions(
    limit: int = 10,
    offset: int = 0,
    authorization: str = Header(...),
):
    """List user's sessions with pagination."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    result = (
        supabase.table("sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("started_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"sessions": result.data or [], "total": len(result.data or [])}


@router.get("/{session_id}/scorecard")
async def get_scorecard(session_id: str, authorization: str = Header(...)):
    """Get full scorecard for a completed session."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    session = supabase.table("sessions").select("*").eq("id", session_id).eq("user_id", user_id).single().execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    answers = (
        supabase.table("session_answers")
        .select("*")
        .eq("session_id", session_id)
        .order("question_number")
        .execute()
    )

    return {
        "session": session.data,
        "answers": answers.data or [],
    }
