from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Sarvam AI
    sarvam_api_key: str = "your_sarvam_api_key_here"

    # OpenAI / Grok (xAI) — set whichever you have
    openai_api_key: str = "your_openai_api_key_here"
    grok_api_key: str = ""          # xAI Grok key — set in .env as GROK_API_KEY
    use_grok: bool = True            # Set to False to switch back to OpenAI

    # Supabase
    supabase_url: str = "https://your-project-id.supabase.co"
    supabase_service_key: str = "your_supabase_service_role_key_here"

    # Redis (Upstash)
    redis_url: str = "rediss://default:your_password@your-endpoint.upstash.io:6380"

    # Razorpay
    razorpay_key_id: str = "rzp_test_your_key_id_here"
    razorpay_key_secret: str = "your_razorpay_key_secret_here"
    razorpay_webhook_secret: str = "your_razorpay_webhook_secret_here"

    # Sentry
    sentry_dsn: Optional[str] = None

    # App
    secret_key: str = "interviewai-dev-secret-change-in-production"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"
    admin_emails: str = "your_email@example.com"

    # Hard Caps (from spec §2)
    max_session_minutes: int = 25
    max_concurrent_sessions: int = 3
    rate_limit_per_minute: int = 10
    placement_pack_rounds: int = 10
    placement_pack_minutes: int = 200
    topup_pack_rounds: int = 5
    topup_pack_minutes: int = 100

    # Razorpay amounts in paise
    placement_pack_price_paise: int = 49900   # ₹499
    topup_pack_price_paise: int = 19900       # ₹199
    affiliate_commission_paise: int = 9980    # ₹99.80 (20% of ₹499)
    affiliate_min_payout_paise: int = 20000   # ₹200 minimum

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
