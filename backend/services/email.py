"""
Email trigger service — called from FastAPI endpoints.
Sends HTTP requests to the Next.js /api/email/trigger route.
"""
import os
import httpx
from typing import Optional

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
INTERNAL_SECRET = os.getenv("INTERNAL_API_SECRET", "")


async def trigger_email(event: str, to: str, name: str, **kwargs):
    """Fire-and-forget email trigger. Never raises — logs on failure."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                f"{FRONTEND_URL}/api/email/trigger",
                json={"event": event, "to": to, "name": name, **kwargs},
                headers={"x-internal-secret": INTERNAL_SECRET},
            )
    except Exception as e:
        print(f"[email] Failed to send '{event}' to {to}: {e}")


# ─── Convenience wrappers ────────────────────────────────────────────────────

async def on_signup(email: str, name: str):
    await trigger_email("welcome_1", email, name)


async def on_no_session_after_2_days(email: str, name: str):
    await trigger_email("welcome_2", email, name)


async def on_no_purchase_after_4_days(email: str, name: str):
    await trigger_email("welcome_3", email, name)


async def on_session_completed(email: str, name: str, score: int, download_url: str):
    await trigger_email("post_session_1", email, name, score=score, download_url=download_url)


async def on_3_days_since_session(email: str, name: str, weakest_area: str):
    await trigger_email("post_session_2", email, name, weakest_area=weakest_area)


async def on_7_days_since_session(email: str, name: str, rounds_left: int):
    await trigger_email("post_session_3", email, name, rounds_left=rounds_left)


async def on_pack_80_percent_used(email: str, name: str, rounds_left: int):
    await trigger_email("pack_expiry_1", email, name, rounds_left=rounds_left)


async def on_pack_fully_used(email: str, name: str, score_improvement: int):
    await trigger_email("pack_expiry_2", email, name, score_improvement=score_improvement)


async def on_7_days_no_session(email: str, name: str, company: str = "TCS"):
    await trigger_email("reengagement_1", email, name, company=company)


async def on_14_days_no_session(email: str, name: str):
    await trigger_email("reengagement_2", email, name)


async def on_drive_alert(email: str, name: str, company: str, college: str, days_until_drive: int):
    await trigger_email("drive_panic", email, name, company=company, college=college, days_until_drive=days_until_drive)


async def on_affiliate_approved(email: str, name: str, code: str, marketing_kit_url: str = "https://drive.google.com"):
    await trigger_email("affiliate_welcome_1", email, name, code=code, marketing_kit_url=marketing_kit_url)


async def on_affiliate_day3(email: str, name: str, code: str):
    await trigger_email("affiliate_welcome_2", email, name, code=code)


async def on_affiliate_week1_stats(email: str, name: str, clicks: int, signups: int, earnings: int):
    await trigger_email("affiliate_week1_stats", email, name, clicks=clicks, signups=signups, earnings=earnings)
