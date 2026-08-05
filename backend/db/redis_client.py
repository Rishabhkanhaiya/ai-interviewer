import redis.asyncio as aioredis
from config import get_settings
import json
from typing import Optional, Any

settings = get_settings()

# Connection pool — one pool for the entire app lifetime
_redis_pool: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    """Return a shared Redis connection pool. TLS required for Upstash."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            ssl_cert_reqs=None,  # Upstash uses self-signed cert on TLS
            retry_on_timeout=True,
            health_check_interval=30,
        )
    return _redis_pool


# ── Session State ────────────────────────────────────────────────────────────

async def set_session_state(session_id: str, data: dict) -> None:
    """Store interview state machine data. TTL: 2 hours."""
    r = await get_redis()
    await r.setex(
        f"session:{session_id}:state",
        7200,  # 2 hours
        json.dumps(data),
    )


async def get_session_state(session_id: str) -> Optional[dict]:
    """Retrieve session state. Returns None if expired or not found."""
    r = await get_redis()
    raw = await r.get(f"session:{session_id}:state")
    if raw is None:
        return None
    return json.loads(raw)


# ── Transcript Store ─────────────────────────────────────────────────────────

async def append_transcript(session_id: str, entry: dict) -> None:
    """Append a {speaker, text, timestamp} entry to the session transcript list."""
    r = await get_redis()
    key = f"session:{session_id}:transcript"
    await r.rpush(key, json.dumps(entry))
    await r.expire(key, 7200)


async def get_transcript(session_id: str) -> list[dict]:
    """Get the full transcript list for a session."""
    r = await get_redis()
    raw_list = await r.lrange(f"session:{session_id}:transcript", 0, -1)
    return [json.loads(item) for item in raw_list]


# ── Session Minutes Counter ──────────────────────────────────────────────────

async def increment_session_minutes(session_id: str, pack_id: str, delta: float = 1.0) -> float:
    """
    Atomically increment session and pack minute counters.
    Returns the new total minutes used for this session.
    """
    r = await get_redis()
    session_key = f"session:{session_id}:minutes"
    pack_key = f"pack:{pack_id}:minutes_used"

    pipe = r.pipeline()
    pipe.incrbyfloat(session_key, delta)
    pipe.incrbyfloat(pack_key, delta)
    pipe.expire(session_key, 7200)
    pipe.expire(pack_key, 2592000)  # 30 days
    results = await pipe.execute()

    return float(results[0])  # session minutes used


async def get_pack_minutes_used(pack_id: str) -> float:
    """Get current minutes used from Redis for a pack (fast path)."""
    r = await get_redis()
    val = await r.get(f"pack:{pack_id}:minutes_used")
    return float(val) if val else 0.0


async def get_pack_rounds_used(pack_id: str) -> int:
    """Get current rounds used from Redis for a pack (fast path)."""
    r = await get_redis()
    val = await r.get(f"pack:{pack_id}:rounds_used")
    return int(val) if val else 0


async def increment_pack_rounds(pack_id: str) -> int:
    """Increment round counter for a pack. Returns new count."""
    r = await get_redis()
    key = f"pack:{pack_id}:rounds_used"
    new_count = await r.incr(key)
    await r.expire(key, 2592000)  # 30 days
    return int(new_count)


# ── Rate Limiting ────────────────────────────────────────────────────────────

async def check_rate_limit(user_id: str) -> bool:
    """
    Returns True if user is under the rate limit (allowed).
    Returns False if user has exceeded 10 calls/minute.
    Uses a sliding 60-second window.
    """
    r = await get_redis()
    key = f"user:{user_id}:rate"
    pipe = r.pipeline()
    pipe.incr(key)
    pipe.expire(key, 60)
    results = await pipe.execute()
    count = int(results[0])
    return count <= settings.rate_limit_per_minute


# ── Concurrent Session Tracking ──────────────────────────────────────────────

async def add_active_session(user_id: str, session_id: str) -> None:
    """Register a session as active for a user."""
    r = await get_redis()
    key = f"user:{user_id}:active_sessions"
    await r.sadd(key, session_id)
    await r.expire(key, 7200)


async def remove_active_session(user_id: str, session_id: str) -> None:
    """Remove a session from the user's active session set."""
    r = await get_redis()
    await r.srem(f"user:{user_id}:active_sessions", session_id)


async def check_concurrent_sessions(user_id: str) -> int:
    """Returns the number of currently active sessions for a user."""
    r = await get_redis()
    return await r.scard(f"user:{user_id}:active_sessions")


# ── Anti-Gaming Fingerprinting ───────────────────────────────────────────────

async def check_transcript_duplicate(user_id: str, transcript_hash: str) -> bool:
    """
    Returns True if this transcript hash has been seen before (duplicate/gaming).
    Always adds the hash to the set regardless.
    """
    r = await get_redis()
    key = f"transcript_hash:{user_id}"
    # SADD returns 1 if new, 0 if already existed
    result = await r.sadd(key, transcript_hash)
    await r.expire(key, 604800)  # 7 days
    return result == 0  # True = duplicate
