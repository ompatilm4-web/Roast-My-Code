
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app import models

settings = get_settings()

# --- Rate limiting ---
limiter = Limiter(key_func=get_remote_address)

# --- Bearer Schemes ---
bearer_scheme = HTTPBearer(auto_error=False)


# --- Password Hashing (PBKDF2-HMAC-SHA256) ---
def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = secrets.token_hex(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    )
    return f"{salt}${iterations}${derived.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored salt$iterations$derived_hex."""
    if not hashed_password or "$" not in hashed_password:
        return False
    try:
        salt, iterations_str, derived_hex = hashed_password.split("$")
        iterations = int(iterations_str)
        test_derived = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations,
        )
        return hmac.compare_digest(test_derived.hex(), derived_hex)
    except Exception:
        return False


# --- JWT Helpers ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


# --- FastAPI Dependencies ---
async def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    """Returns the authenticated User if a valid Bearer token is provided, otherwise None."""
    if not auth or not auth.credentials:
        return None

    payload = decode_access_token(auth.credentials)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    user = db.query(models.User).filter_by(id=user_id).first()
    return user


async def get_current_user(
    user: Optional[models.User] = Depends(get_current_user_optional),
) -> models.User:
    """Enforces authentication. Raises 401 if token is missing or invalid."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# --- Optional API key auth (retained for backward compatibility) ---
async def require_api_key(x_api_key: Optional[str] = Header(default=None)) -> None:
    configured_key = settings.API_KEY
    if not configured_key:
        return
    if x_api_key != configured_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
