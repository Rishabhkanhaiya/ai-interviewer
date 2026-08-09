"""
Users router — profile management, onboarding, pack status.
"""

from fastapi import APIRouter, HTTPException, Header, File, UploadFile
import io
import PyPDF2
import docx
from db.supabase_client import get_supabase
from models.schemas import UserOnboarding, UpdateProfileRequest, PackStatusResponse, PackStatus, PackType, TopicSuggestionRequest
from routers.sessions import get_user_id_from_jwt, get_user_jwt_payload
from db.redis_client import get_pack_minutes_used, get_pack_rounds_used

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/onboarding")
async def complete_onboarding(body: UserOnboarding, authorization: str = Header(...)):
    """Save first-time onboarding data (name, college, year, targets)."""
    payload = get_user_jwt_payload(authorization)
    user_id = payload.get("sub")
    email = payload.get("email", "")
    supabase = get_supabase()
    supabase.table("users").upsert({
        "id": user_id,
        "email": email,
        "name": body.name,
        "college": body.college,
        "graduation_year": body.graduation_year,
        "target_companies": body.target_companies,
    }).execute()
    return {"status": "ok"}


@router.get("/me")
async def get_profile(authorization: str = Header(...)):
    """Get the current user's profile."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data


@router.put("/profile")
async def update_profile(body: UpdateProfileRequest, authorization: str = Header(...)):
    """Update user profile fields."""
    payload = get_user_jwt_payload(authorization)
    user_id = payload.get("sub")
    email = payload.get("email", "")
    
    supabase = get_supabase()
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    update_data["id"] = user_id
    update_data["email"] = email
    
    supabase.table("users").upsert(update_data).execute()
    return {"status": "ok"}


@router.post("/profile/parse-resume")
async def parse_resume(file: UploadFile = File(...), authorization: str = Header(...)):
    """Parse resume from PDF/DOCX and return extracted text."""
    get_user_jwt_payload(authorization) # verify auth
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 2MB allowed.")

    text = ""
    try:
        if file.filename.lower().endswith('.pdf'):
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif file.filename.lower().endswith('.docx'):
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif file.filename.lower().endswith('.txt'):
            text = content.decode('utf-8')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
        
    text = text.strip()
    # Truncate to 3000 chars to save AI processing cost
    if len(text) > 3000:
        text = text[:3000]
        
    return {"text": text}


@router.delete("/me")
async def delete_account(authorization: str = Header(...)):
    """Delete user account and all associated data."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    # Supabase cascades via FK: sessions, packs, payments, affiliates
    supabase.auth.admin.delete_user(user_id)
    supabase.table("users").delete().eq("id", user_id).execute()
    return {"status": "deleted"}


@router.get("/pack-status", response_model=PackStatusResponse)
async def get_pack_status(authorization: str = Header(...)):
    """Get current pack status — rounds and minutes remaining."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    result = (
        supabase.table("packs")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    packs = result.data or []

    # Find active pack
    active_pack = None
    for pack in packs:
        if pack["rounds_used"] < pack["rounds_total"] and pack["minutes_used"] < pack["minutes_total"]:
            active_pack = pack
            break

    if not active_pack:
        return PackStatusResponse(has_active_pack=False)

    # Get actual rounds used by counting non-abandoned sessions in Supabase
    sessions_res = supabase.table("sessions").select("id", count="exact").eq("pack_id", active_pack["id"]).neq("status", "abandoned").execute()
    rounds_used = sessions_res.count or 0

    # Get Redis values for freshest minutes
    redis_minutes = 0.0
    try:
        redis_minutes = await get_pack_minutes_used(active_pack["id"])
    except Exception as e:
        print(f"[Pack Status] Redis connection error, falling back to Supabase counts: {e}")

    minutes_used = max(float(active_pack["minutes_used"]), redis_minutes)

    return PackStatusResponse(
        has_active_pack=True,
        pack=PackStatus(
            pack_id=active_pack["id"],
            pack_type=PackType(active_pack["pack_type"]),
            rounds_total=active_pack["rounds_total"],
            rounds_used=rounds_used,
            rounds_remaining=max(0, active_pack["rounds_total"] - rounds_used),
            minutes_total=active_pack["minutes_total"],
            minutes_used=minutes_used,
            minutes_remaining=max(0.0, active_pack["minutes_total"] - minutes_used),
            has_active_pack=True,
        ),
    )

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10, authorization: str = Header(...)):
    """Get top users by best_score."""
    # verify user
    get_user_id_from_jwt(authorization)
    
    supabase = get_supabase()
    result = (
        supabase.table("users")
        .select("id, name, college, best_score, current_streak")
        .gt("best_score", 0)
        .order("best_score", desc=True)
        .limit(limit)
        .execute()
    )
    return {"leaderboard": result.data or []}

@router.post("/suggestions")
async def submit_suggestion(body: TopicSuggestionRequest, authorization: str = Header(...)):
    """Submit a topic suggestion."""
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    result = supabase.table("user_suggestions").insert({
        "user_id": user_id,
        "topic": body.topic,
        "status": "new"
    }).execute()
    
    if len(result.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to submit suggestion.")
        
    return {"message": "Suggestion submitted successfully."}
