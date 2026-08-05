import re
import supabase._sync.client as _sc
from supabase import create_client, Client
from config import get_settings

settings = get_settings()

# Patch supabase SDK regex to support new sb_secret_ / sb_publishable_ API key format
_old_match = _sc.re.match
def _patched_match(pattern, string, *args, **kwargs):
    if isinstance(string, str) and string.startswith("sb_"):
        return True
    return _old_match(pattern, string, *args, **kwargs)

_sc.re.match = _patched_match

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Return a shared Supabase service-role client."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    return _supabase_client
