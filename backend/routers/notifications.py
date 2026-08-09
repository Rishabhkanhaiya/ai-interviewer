from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from models.schemas import PushSubscriptionRequest
from db.supabase_client import get_supabase
from routers.sessions import get_user_id_from_jwt
import logging
from pywebpush import webpush, WebPushException
import json
import os

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_CLAIMS = {"sub": f"mailto:{os.getenv('ADMIN_EMAILS', 'admin@example.com')}"}

@router.post("/subscribe")
async def subscribe_push(
    sub: PushSubscriptionRequest,
    authorization: str = Header(...)
):
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    
    # Check if this exact endpoint is already registered for this user
    existing = supabase.table("push_subscriptions") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("endpoint", sub.endpoint) \
        .execute()
        
    if existing.data:
        return {"status": "success", "message": "Already subscribed"}
        
    # Insert new subscription
    supabase.table("push_subscriptions").insert({
        "user_id": user_id,
        "endpoint": sub.endpoint,
        "p256dh": sub.p256dh,
        "auth": sub.auth
    }).execute()
    
    return {"status": "success"}


@router.post("/test-push")
async def test_push(authorization: str = Header(...)):
    user_id = get_user_id_from_jwt(authorization)
    if not VAPID_PRIVATE_KEY:
        raise HTTPException(status_code=500, detail="VAPID key not configured")
        
    supabase = get_supabase()
    subs = supabase.table("push_subscriptions").select("*").eq("user_id", user_id).execute()
    
    if not subs.data:
        raise HTTPException(status_code=404, detail="No push subscriptions found")
        
    for sub in subs.data:
        subscription_info = {
            "endpoint": sub["endpoint"],
            "keys": {
                "p256dh": sub["p256dh"],
                "auth": sub["auth"]
            }
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps({"title": "Test Push", "body": "This is a test notification from the interviewer!", "url": "/"}),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
        except WebPushException as ex:
            logging.error(f"WebPush error: {ex}")
            # If 410, we could delete the subscription from DB
            if ex.response and ex.response.status_code == 410:
                supabase.table("push_subscriptions").delete().eq("id", sub["id"]).execute()
                
    return {"status": "success", "sent": len(subs.data)}

# ── In-App Notifications ─────────────────────────────────────────────────────────

from pydantic import BaseModel
from typing import Optional, List

class AdminNotificationRequest(BaseModel):
    title: str
    message: str
    link: Optional[str] = None
    type: str = "system"
    user_id: Optional[str] = None # if None, it's a global broadcast

@router.get("/in-app")
async def get_in_app_notifications(authorization: str = Header(...)):
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    
    # Fetch all global notifications OR notifications specific to this user
    # Note: RLS allows this via `user_id IS NULL OR user_id = auth.uid()`
    # But since we use the service role (get_supabase returns admin client usually), 
    # we explicitly filter here.
    notifs = supabase.table("in_app_notifications").select("*") \
        .or_(f"user_id.eq.{user_id},user_id.is.null") \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
        
    # Fetch which notifications the user has read
    reads = supabase.table("in_app_notification_reads").select("notification_id") \
        .eq("user_id", user_id) \
        .execute()
        
    read_ids = set([r["notification_id"] for r in reads.data]) if reads.data else set()
    
    results = []
    unread_count = 0
    for n in (notifs.data or []):
        is_read = n["id"] in read_ids
        if not is_read:
            unread_count += 1
        results.append({
            **n,
            "is_read": is_read
        })
        
    return {"notifications": results, "unread_count": unread_count}

@router.post("/in-app/{notification_id}/read")
async def mark_notification_read(notification_id: str, authorization: str = Header(...)):
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    
    try:
        supabase.table("in_app_notification_reads").insert({
            "user_id": user_id,
            "notification_id": notification_id
        }).execute()
    except Exception as e:
        # Ignore if already marked read (duplicate key)
        pass
        
    return {"status": "success"}

@router.post("/in-app/admin-send")
async def send_admin_notification(
    req: AdminNotificationRequest,
    authorization: str = Header(...)
):
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()
    
    # Verify Admin
    user = supabase.table("users").select("is_admin, email").eq("id", user_id).execute()
    if not user.data or not user.data[0].get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
        
    payload = {
        "title": req.title,
        "message": req.message,
        "type": req.type,
    }
    if req.link:
        payload["link"] = req.link
    if req.user_id:
        payload["user_id"] = req.user_id
        
    supabase.table("in_app_notifications").insert(payload).execute()
    return {"status": "success"}
