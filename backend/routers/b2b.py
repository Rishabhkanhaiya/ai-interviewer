from fastapi import APIRouter, HTTPException, Header, Depends
from db.supabase_client import get_supabase
from routers.sessions import get_user_id_from_jwt
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/b2b", tags=["b2b"])

class BulkInviteRequest(BaseModel):
    emails: List[str]

@router.get("/colleges/me")
async def get_my_college(authorization: str = Header(...)):
    """Get the college details for the admin."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    
    # Simple check: the admin user has a college_id
    user_res = supabase.table("users").select("college_id, name").eq("id", user_id).single().execute()
    if not user_res.data or not user_res.data.get("college_id"):
        raise HTTPException(status_code=403, detail="User is not associated with a college")
        
    college_id = user_res.data["college_id"]
    college_res = supabase.table("colleges").select("*").eq("id", college_id).single().execute()
    
    return {"college": college_res.data}

@router.post("/colleges/bulk-invite")
async def bulk_invite(body: BulkInviteRequest, authorization: str = Header(...)):
    """Invite students to the college."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    
    user_res = supabase.table("users").select("college_id").eq("id", user_id).single().execute()
    if not user_res.data or not user_res.data.get("college_id"):
        raise HTTPException(status_code=403, detail="User is not associated with a college")
        
    college_id = user_res.data["college_id"]
    
    # In a real app, this would send emails using SendGrid/Resend
    # For now, we return success and the list of emails
    
    return {"status": "ok", "invited": len(body.emails)}

@router.get("/colleges/analytics")
async def get_analytics(authorization: str = Header(...)):
    """Aggregate analytics for all students in the college."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    
    user_res = supabase.table("users").select("college_id").eq("id", user_id).single().execute()
    if not user_res.data or not user_res.data.get("college_id"):
        raise HTTPException(status_code=403, detail="User is not associated with a college")
        
    college_id = user_res.data["college_id"]
    
    # Get all students
    students_res = supabase.table("users").select("id, best_score, current_streak").eq("college_id", college_id).execute()
    students = students_res.data or []
    
    if not students:
        return {
            "total_students": 0,
            "average_score": 0,
            "active_students": 0
        }
        
    student_ids = [s["id"] for s in students]
    
    # Average score
    total_score = sum(s.get("best_score", 0) or 0 for s in students)
    avg_score = total_score / len(students) if students else 0
    
    # Active students (those with streaks)
    active = sum(1 for s in students if (s.get("current_streak") or 0) > 0)
    
    # Total sessions
    sessions_res = supabase.table("sessions").select("id").in_("user_id", student_ids).execute()
    total_sessions = len(sessions_res.data or [])
    
    return {
        "total_students": len(students),
        "average_score": round(avg_score, 1),
        "active_students": active,
        "total_sessions_conducted": total_sessions
    }
