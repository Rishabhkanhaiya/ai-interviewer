"""
Payments router — Razorpay order creation and webhook handler.
"""

import hmac
import hashlib
import json
from fastapi import APIRouter, HTTPException, Request, Header
from config import get_settings
from db.supabase_client import get_supabase
from models.schemas import CreateOrderRequest, CreateOrderResponse, PackType
from routers.sessions import get_user_id_from_jwt
import httpx

settings = get_settings()
router = APIRouter(prefix="/api/payments", tags=["payments"])


async def create_razorpay_order(amount_paise: int, receipt: str, notes: dict) -> dict:
    """Create a Razorpay order via REST API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret),
            json={
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt,
                "notes": notes,
            },
        )
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Razorpay order creation failed")
        return response.json()


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(body: CreateOrderRequest, authorization: str = Header(...)):
    """
    Create a Razorpay order for pack purchase.
    Validates affiliate code if provided.
    """
    user_id = get_user_id_from_jwt(authorization)
    supabase = get_supabase()

    # Determine price
    if body.pack_type == PackType.PLACEMENT_499:
        amount_paise = settings.placement_pack_price_paise
    else:
        amount_paise = settings.topup_pack_price_paise

    # Validate affiliate code
    affiliate_data = None
    if body.affiliate_code:
        result = supabase.table("affiliates").select("*").eq("code", body.affiliate_code.upper()).execute()
        if result.data:
            affiliate_data = result.data[0]

    # Create Razorpay order
    notes = {
        "user_id": user_id,
        "pack_type": body.pack_type.value,
        "affiliate_code": body.affiliate_code or "",
    }
    order = await create_razorpay_order(amount_paise, f"pack_{user_id[:8]}", notes)

    # Store pending payment record
    supabase.table("payments").insert({
        "user_id": user_id,
        "razorpay_payment_id": f"pending_{order['id']}",
        "razorpay_order_id": order["id"],
        "amount_paise": amount_paise,
        "status": "pending",
        "affiliate_code": body.affiliate_code,
    }).execute()

    return CreateOrderResponse(
        order_id=order["id"],
        amount_paise=amount_paise,
        currency="INR",
        razorpay_key_id=settings.razorpay_key_id,
    )


@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request):
    """
    Handle Razorpay payment webhook.
    Verifies HMAC signature, creates pack on payment.captured event.
    """
    body_bytes = await request.body()
    signature = request.headers.get("x-razorpay-signature", "")

    # Verify webhook signature
    expected = hmac.new(
        settings.razorpay_webhook_secret.encode(),
        body_bytes,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = json.loads(body_bytes)
    event = payload.get("event")

    if event == "payment.captured":
        payment_data = payload["payload"]["payment"]["entity"]
        razorpay_payment_id = payment_data["id"]
        order_id = payment_data["order_id"]
        notes = payment_data.get("notes", {})

        user_id = notes.get("user_id")
        pack_type = notes.get("pack_type", "placement_499")
        affiliate_code = notes.get("affiliate_code", "")

        if not user_id:
            return {"status": "ignored"}

        supabase = get_supabase()

        # Determine pack details
        if pack_type == "placement_499":
            rounds_total = settings.placement_pack_rounds
            minutes_total = settings.placement_pack_minutes
        else:
            rounds_total = settings.topup_pack_rounds
            minutes_total = settings.topup_pack_minutes

        # Create pack record
        pack_result = supabase.table("packs").insert({
            "user_id": user_id,
            "pack_type": pack_type,
            "rounds_total": rounds_total,
            "rounds_used": 0,
            "minutes_total": minutes_total,
            "minutes_used": 0,
            "payment_id": razorpay_payment_id,
            "affiliate_code": affiliate_code or None,
        }).execute()

        pack_id = pack_result.data[0]["id"] if pack_result.data else None

        # Update payment record
        supabase.table("payments").update({
            "razorpay_payment_id": razorpay_payment_id,
            "status": "completed",
            "pack_id": pack_id,
        }).eq("razorpay_order_id", order_id).execute()

        # Handle affiliate payout
        if affiliate_code and pack_id:
            affiliate_result = (
                supabase.table("affiliates")
                .select("*")
                .eq("code", affiliate_code.upper())
                .execute()
            )
            if affiliate_result.data:
                affiliate = affiliate_result.data[0]

                # Get payment record id
                payment_record = (
                    supabase.table("payments")
                    .select("id")
                    .eq("razorpay_payment_id", razorpay_payment_id)
                    .single()
                    .execute()
                )
                if payment_record.data:
                    # Create payout record
                    supabase.table("affiliate_payouts").insert({
                        "affiliate_id": affiliate["id"],
                        "payment_id": payment_record.data["id"],
                        "amount_paise": settings.affiliate_commission_paise,
                        "status": "pending",
                    }).execute()

                    # Update affiliate totals
                    supabase.table("affiliates").update({
                        "total_referrals": affiliate["total_referrals"] + 1,
                        "total_earned_paise": affiliate["total_earned_paise"] + settings.affiliate_commission_paise,
                    }).eq("id", affiliate["id"]).execute()

    elif event == "payment.failed":
        order_id = payload["payload"]["payment"]["entity"].get("order_id")
        if order_id:
            supabase = get_supabase()
            supabase.table("payments").update({"status": "failed"}).eq("razorpay_order_id", order_id).execute()

    return {"status": "ok"}


@router.get("/validate-affiliate/{code}")
async def validate_affiliate(code: str):
    """Validate an affiliate code and return referrer name."""
    supabase = get_supabase()
    result = supabase.table("affiliates").select("code, user_id").eq("code", code.upper()).execute()
    if not result.data:
        return {"valid": False}

    affiliate = result.data[0]
    user = supabase.table("users").select("name").eq("id", affiliate["user_id"]).single().execute()
    referrer_name = user.data.get("name", "A friend") if user.data else "A friend"

    return {"valid": True, "referrer_name": referrer_name, "discount_paise": 0}
