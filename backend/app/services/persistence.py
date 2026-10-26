
from typing import Optional
from sqlalchemy.orm import Session

from app import models
from app.schemas import RoastLLMOutput


def get_or_create_user(db: Session, github_username: Optional[str]) -> Optional[models.User]:
    if not github_username or not github_username.strip():
        return None

    clean_gh = github_username.strip()
    user = (
        db.query(models.User)
        .filter(
            (models.User.github_username == clean_gh) | (models.User.username == clean_gh)
        )
        .first()
    )
    if user:
        return user

    user = models.User(
        username=clean_gh,
        github_username=clean_gh,
        avatar_url=f"https://github.com/{clean_gh}.png",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def save_roast(
    db: Session,
    target_type: str,
    target_url_or_name: str,
    llm_output: RoastLLMOutput,
    user: Optional[models.User] = None,
    code_snippet: Optional[str] = None,
    language: Optional[str] = None,
    tone: Optional[str] = "senior_dev",
    is_public: bool = True,
) -> models.Roast:
    roast = models.Roast(
        user_id=user.id if user else None,
        target_type=target_type,
        target_url_or_name=target_url_or_name,
        code_snippet=code_snippet,
        roast_output=llm_output.roast,
        constructive_blueprint=llm_output.constructive_blueprint,
        code_quality_score=llm_output.code_quality_score,
        documentation_score=llm_output.documentation_score,
        architecture_score=llm_output.architecture_score,
        language=language,
        tone=tone,
        is_public=is_public,
    )
    db.add(roast)
    db.commit()
    db.refresh(roast)
    return roast


def roast_to_response_dict(roast: models.Roast) -> dict:
    author = roast.user.username if roast.user else None
    return {
        "id": roast.id,
        "target_type": roast.target_type,
        "target_url_or_name": roast.target_url_or_name,
        "code_snippet": roast.code_snippet,
        "roast": roast.roast_output,
        "code_quality_score": roast.code_quality_score,
        "documentation_score": roast.documentation_score,
        "architecture_score": roast.architecture_score,
        "constructive_blueprint": roast.constructive_blueprint,
        "language": roast.language,
        "tone": roast.tone,
        "is_public": roast.is_public,
        "created_at": roast.created_at,
        "author_username": author,
    }
