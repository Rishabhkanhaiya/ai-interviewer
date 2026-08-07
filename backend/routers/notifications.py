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
