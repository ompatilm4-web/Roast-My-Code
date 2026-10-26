
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import (
    UserRegister,
    UserLogin,
    UserResponse,
    UserUpdate,
    TokenResponse,
    RoastResponse,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.services.persistence import roast_to_response_dict

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def _user_to_response(user: models.User, roast_count: int | None = None) -> UserResponse:
    if roast_count is None:
        roast_count = len(user.roasts) if user.roasts else 0
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        github_username=user.github_username,
        avatar_url=user.avatar_url or (f"https://github.com/{user.github_username}.png" if user.github_username else None),
        custom_api_key_set=bool(user.custom_api_key and user.custom_api_key.strip()),
        created_at=user.created_at,
        roast_count=roast_count,
    )


@router.post("/register", response_model=TokenResponse)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    """Create a new user account and return an access token."""
    # Check if username exists
    existing = db.query(models.User).filter_by(username=req.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken.",
        )

    # Check if email exists if provided
    if req.email:
        existing_email = db.query(models.User).filter_by(email=req.email.strip().lower()).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered.",
            )

    avatar = f"https://github.com/{req.github_username}.png" if req.github_username else None

    user = models.User(
        username=req.username,
        email=req.email.strip().lower() if req.email else None,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        github_username=req.github_username,
        avatar_url=avatar,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "username": user.username})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_user_to_response(user, 0),
    )


@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with username or email + password, returning an access token."""
    identifier = req.username_or_email.strip().lower()

    user = (
        db.query(models.User)
        .filter((models.User.username == identifier) | (models.User.email == identifier))
        .first()
    )

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    token = create_access_token({"sub": user.id, "username": user.username})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_user_to_response(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve currently authenticated user profile with roast count."""
    count = db.query(models.Roast).filter_by(user_id=user.id).count()
    return _user_to_response(user, count)


@router.put("/me", response_model=UserResponse)
def update_profile(
    req: UserUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile fields (github_username, full_name, avatar, custom groq api key)."""
    if req.full_name is not None:
        user.full_name = req.full_name.strip()
    if req.github_username is not None:
        user.github_username = req.github_username.strip()
        if not user.avatar_url:
            user.avatar_url = f"https://github.com/{user.github_username}.png"
    if req.avatar_url is not None:
        user.avatar_url = req.avatar_url.strip()
    if req.custom_api_key is not None:
        user.custom_api_key = req.custom_api_key.strip() or None

    db.commit()
    db.refresh(user)
    count = db.query(models.Roast).filter_by(user_id=user.id).count()
    return _user_to_response(user, count)


@router.get("/me/roasts", response_model=list[RoastResponse])
def get_my_roasts(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all roasts authored by the current authenticated user."""
    roasts = (
        db.query(models.Roast)
        .filter_by(user_id=user.id)
        .order_by(models.Roast.created_at.desc())
        .all()
    )
    return [roast_to_response_dict(r) for r in roasts]
