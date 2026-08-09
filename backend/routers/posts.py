"""
Posts router — public blog reads and admin CMS endpoints.
"""

from fastapi import APIRouter, HTTPException, Header, UploadFile, File
import re
from db.supabase_client import get_supabase
from routers.admin import require_admin
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(tags=["posts"])

class PostCreate(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content: str
    cover_image_url: Optional[str] = None
    category: str
    status: str
    slug: str
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class PostUpdate(PostCreate):
    pass

class UploadUrlRequest(BaseModel):
    filename: str
    content_type: str

# ─── PUBLIC ENDPOINTS ────────────────────────────────────────────────────────

@router.get("/api/posts")
async def get_published_posts(category: Optional[str] = None):
    """Get all published posts, optionally filtered by category."""
    supabase = get_supabase()
    query = supabase.table("posts").select("slug, title, excerpt, cover_image_url, category, read_time_minutes, published_at").eq("status", "published")
    if category:
        query = query.eq("category", category)
    
    # Order by published_at DESC
    query = query.order("published_at", desc=True)
    result = query.execute()
    return result.data or []

@router.get("/api/posts/{slug}")
async def get_published_post_by_slug(slug: str):
    """Get a single published post by slug."""
    supabase = get_supabase()
    result = supabase.table("posts").select("*").eq("slug", slug).eq("status", "published").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return result.data[0]


# ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────────

@router.get("/api/admin/posts")
async def admin_get_all_posts(authorization: str = Header(...)):
    """Admin: Get all posts including drafts."""
    await require_admin(authorization)
    supabase = get_supabase()
    result = supabase.table("posts").select("id, slug, title, category, status, updated_at").order("updated_at", desc=True).execute()
    return result.data or []

@router.get("/api/admin/posts/{id}")
async def admin_get_post(id: str, authorization: str = Header(...)):
    """Admin: Get a single post by ID."""
    await require_admin(authorization)
    supabase = get_supabase()
    result = supabase.table("posts").select("*").eq("id", id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return result.data[0]

@router.post("/api/admin/posts")
async def admin_create_post(post: PostCreate, authorization: str = Header(...)):
    """Admin: Create a new post."""
    admin_id = await require_admin(authorization)
    supabase = get_supabase()
    
    # Calculate read time (words / 200)
    word_count = len(post.content.split())
    read_time = max(1, round(word_count / 200))

    data = post.dict()
    data["author_id"] = admin_id
    data["read_time_minutes"] = read_time
    if data["status"] == "published":
        data["published_at"] = datetime.utcnow().isoformat()

    try:
        result = supabase.table("posts").insert(data).execute()
        
        # Trigger global notification if published
        if data["status"] == "published":
            supabase.table("in_app_notifications").insert({
                "title": "New Blog Post",
                "message": f"Read our latest post: {data['title']}",
                "link": f"/blog/{data['slug']}",
                "type": "blog_post"
            }).execute()
            
        return result.data[0]
    except Exception as e:
        if "duplicate key value violates unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Slug already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/admin/posts/{id}")
async def admin_update_post(id: str, post: PostUpdate, authorization: str = Header(...)):
    """Admin: Update an existing post."""
    await require_admin(authorization)
    supabase = get_supabase()
    
    # Calculate read time
    word_count = len(post.content.split())
    read_time = max(1, round(word_count / 200))

    data = post.dict()
    data["read_time_minutes"] = read_time
    data["updated_at"] = datetime.utcnow().isoformat()
    
    # Check if we are transitioning to published
    existing = supabase.table("posts").select("status").eq("id", id).single().execute()
    just_published = False
    if existing.data and existing.data["status"] != "published" and data["status"] == "published":
        data["published_at"] = datetime.utcnow().isoformat()
        just_published = True

    try:
        result = supabase.table("posts").update(data).eq("id", id).execute()
        
        # Trigger global notification if just published
        if just_published:
            supabase.table("in_app_notifications").insert({
                "title": "New Blog Post",
                "message": f"Read our latest post: {data['title']}",
                "link": f"/blog/{data['slug']}",
                "type": "blog_post"
            }).execute()
            
        if not result.data:
            raise HTTPException(status_code=404, detail="Post not found")
        return result.data[0]
    except Exception as e:
        if "duplicate key value violates unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Slug already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/admin/posts/{id}")
async def admin_delete_post(id: str, authorization: str = Header(...)):
    """Admin: Delete a post."""
    await require_admin(authorization)
    supabase = get_supabase()
    result = supabase.table("posts").delete().eq("id", id).execute()
    return {"success": True}

@router.post("/api/admin/upload")
async def admin_upload_image(file: UploadFile = File(...), authorization: str = Header(...)):
    """Admin: Upload a blog image directly through FastAPI to Supabase Storage."""
    await require_admin(authorization)
    supabase = get_supabase()
    
    timestamp = int(datetime.utcnow().timestamp())
    clean_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', file.filename or 'image.jpg')
    file_path = f"post-images/{timestamp}-{clean_filename}"
    
    contents = await file.read()
    
    try:
        supabase.storage.from_("blog-images").upload(
            path=file_path,
            file=contents,
            file_options={"content-type": file.content_type or "image/jpeg", "upsert": "true"}
        )
        public_url = supabase.storage.from_("blog-images").get_public_url(file_path)
        if isinstance(public_url, str):
            public_url = public_url.rstrip('?')
        return {"publicUrl": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

