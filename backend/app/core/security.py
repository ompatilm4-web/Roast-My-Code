"""
Lightweight security layer:
- Optional API key auth (off by default — set API_KEY in .env to enable)
- Rate limiting via slowapi

This is intentionally minimal for an MVP. Swap for real OAuth/JWT before
this goes fully public with paying users or write access to other systems.
"""
from fastapi import Header, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

settings = get_settings()

# --- Rate limiting ---
# Usage in a router:
#   from app.core.security import limiter
#   @limiter.limit("10/minute")
#   @router.post(...)
#   def my_endpoint(request: Request, ...): ...
limiter = Limiter(key_func=get_remote_address)


# --- Optional API key auth ---
async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """
    No-op unless API_KEY is set in the environment. Add as a dependency to
    any router you want to lock down:
        router = APIRouter(dependencies=[Depends(require_api_key)])
    """
    configured_key = settings.API_KEY
    if not configured_key:
        return  # auth disabled — fine for local dev / early hackathon demo
    if x_api_key != configured_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
