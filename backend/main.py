"""
AI Mock Interview Platform — FastAPI Backend
Main application entry point.
"""

import sentry_sdk
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from config import get_settings
from routers import sessions, payments, users, affiliates, admin
from routers.interview_ws import interview_websocket_handler
from db.redis_client import check_rate_limit, check_concurrent_sessions
from db.supabase_client import get_supabase
from models.schemas import CompanyMode, RoleType, RoundType, LanguagePref
from routers.sessions import get_user_id_from_jwt

settings = get_settings()

# ── Sentry Setup ─────────────────────────────────────────────────────────────
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        traces_sample_rate=0.1,
    )

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Mock Interview Platform API",
    description="Voice-first AI interview platform for Indian engineering students",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url=None,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(sessions.router)
app.include_router(payments.router)
app.include_router(users.router)
app.include_router(affiliates.router)
app.include_router(admin.router)


# ── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    """UptimeRobot pings this endpoint every 5 minutes."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# ── WebSocket — Interview Session ─────────────────────────────────────────────
@app.websocket("/ws/interview/{session_id}")
async def interview_websocket(
    websocket: WebSocket,
    session_id: str,
    token: str,  # passed as query param: ?token=<jwt>
):
    """
    Core interview WebSocket endpoint.
    Handles the full real-time audio ↔ AI interview session.
    """
    try:
        # Verify JWT
        user_id = get_user_id_from_jwt(f"Bearer {token}")
        
        # Route to new handler
        await interview_websocket_handler(websocket, session_id, user_id)
        
    except Exception as e:
        import traceback
        print(f"[WS ERROR] {type(e).__name__}: {e}")
        traceback.print_exc()
        try:
            if websocket.client_state.name == "CONNECTED":
                await websocket.send_text(f'{{"type":"error","code":"SERVER_ERROR","message":"{str(e)}"}}')
                await websocket.close()
        except Exception:
            pass


# ── Dev Test Audio Page ───────────────────────────────────────────────────────
@app.get("/test")
async def test_page():
    """Simple server test — Phase 07 audio test page backend."""
    return {"message": "Backend is running", "version": "1.0.0"}
