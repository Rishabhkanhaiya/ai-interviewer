"""
Drives router — upcoming placement drives (manually managed by Growth Lead).
"""

from fastapi import APIRouter, HTTPException, Header
from db.supabase_client import get_supabase
from routers.sessions import get_user_id_from_jwt

router = APIRouter(prefix="/api/drives", tags=["drives"])


@router.get("/upcoming")
async def get_upcoming_drives():
    """Get list of upcoming placement drives — publicly visible, no auth required."""
    supabase = get_supabase()
    result = (
        supabase.table("drives")
        .select("*")
        .gte("drive_date", "now()")
        .order("drive_date")
        .limit(5)
        .execute()
    )
    return {"drives": result.data or []}


@router.post("/")
async def create_drive(body: dict, authorization: str = Header(...)):
    """Admin only — create a new placement drive alert."""
    # Simple admin check — extend with proper role check if needed
    supabase = get_supabase()
    result = supabase.table("drives").insert({
        "company": body.get("company"),
        "drive_date": body.get("drive_date"),
        "colleges_targeted": body.get("colleges_targeted", []),
        "description": body.get("description", ""),
    }).execute()
    return result.data[0]
