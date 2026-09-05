"""
Small helper shared by both roast routers: upsert the user (if given) and
save the roast row.
"""
from sqlalchemy.orm import Session

from app import models
from app.schemas import RoastLLMOutput


def get_or_create_user(db: Session, github_username: str | None) -> models.User | None:
    if not github_username:
        return None

    user = db.query(models.User).filter_by(github_username=github_username).first()
    if user:
        return user

    user = models.User(github_username=github_username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def save_roast(
    db: Session,
    target_type: str,
    target_url_or_name: str,
    llm_output: RoastLLMOutput,
    user: models.User | None = None,
) -> models.Roast:
    roast = models.Roast(
        user_id=user.id if user else None,
        target_type=target_type,
        target_url_or_name=target_url_or_name,
        roast_output=llm_output.roast,
        constructive_blueprint=llm_output.constructive_blueprint,
        code_quality_score=llm_output.code_quality_score,
        documentation_score=llm_output.documentation_score,
        architecture_score=llm_output.architecture_score,
    )
    db.add(roast)
    db.commit()
    db.refresh(roast)
    return roast


def roast_to_response_dict(roast: models.Roast) -> dict:
    return {
        "id": roast.id,
        "target_type": roast.target_type,
        "target_url_or_name": roast.target_url_or_name,
        "roast": roast.roast_output,
        "code_quality_score": roast.code_quality_score,
        "documentation_score": roast.documentation_score,
        "architecture_score": roast.architecture_score,
        "constructive_blueprint": roast.constructive_blueprint,
        "created_at": roast.created_at,
    }
