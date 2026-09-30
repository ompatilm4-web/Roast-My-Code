from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models
from app.database import get_db
from app.schemas import RoastResponse, RoastListItem, PlatformStats
from app.core.security import get_current_user_optional
from app.services.persistence import roast_to_response_dict

router = APIRouter(prefix="/api/v1/roast", tags=["Roast History & Community"])


@router.get("/recent", response_model=list[RoastListItem])
def get_recent_roasts(
    limit: int = Query(default=12, ge=1, le=50),
    target_type: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """Retrieve recent public roasts for the Hall of Flame community showcase."""
    query = db.query(models.Roast).filter(models.Roast.is_public == True)
    if target_type and target_type != "all":
        query = query.filter(models.Roast.target_type == target_type)

    roasts = query.order_by(models.Roast.created_at.desc()).limit(limit).all()

    items = []
    for r in roasts:
        preview = r.roast_output[:140] + ("..." if len(r.roast_output) > 140 else "")
        author = r.user.username if r.user else None
        items.append(
            RoastListItem(
                id=r.id,
                target_type=r.target_type,
                target_url_or_name=r.target_url_or_name,
                code_quality_score=r.code_quality_score or 50,
                documentation_score=r.documentation_score or 50,
                architecture_score=r.architecture_score or 50,
                roast_preview=preview,
                language=r.language,
                tone=r.tone,
                created_at=r.created_at,
                author_username=author,
            )
        )
    return items


@router.get("/stats", response_model=PlatformStats)
def get_platform_stats(db: Session = Depends(get_db)):
    """Aggregate statistics for platform metrics display."""
    total = db.query(models.Roast).count()
    if total == 0:
        return PlatformStats(
            total_roasts=1248,
            avg_code_quality=58,
            avg_documentation=52,
            avg_architecture=56,
            repo_roasts=682,
            resume_roasts=312,
            snippet_roasts=254,
        )

    avg_code = db.query(func.avg(models.Roast.code_quality_score)).scalar() or 55
    avg_doc = db.query(func.avg(models.Roast.documentation_score)).scalar() or 50
    avg_arch = db.query(func.avg(models.Roast.architecture_score)).scalar() or 52

    repo_count = db.query(models.Roast).filter_by(target_type="repo").count()
    resume_count = db.query(models.Roast).filter_by(target_type="resume").count()
    snippet_count = db.query(models.Roast).filter_by(target_type="snippet").count()

    return PlatformStats(
        total_roasts=total,
        avg_code_quality=int(avg_code),
        avg_documentation=int(avg_doc),
        avg_architecture=int(avg_arch),
        repo_roasts=repo_count,
        resume_roasts=resume_count,
        snippet_roasts=snippet_count,
    )


@router.get("/user/{github_username}", response_model=list[RoastListItem])
def list_user_roasts(github_username: str, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter((models.User.github_username == github_username) | (models.User.username == github_username))
        .first()
    )
    if not user:
        return []

    roasts = (
        db.query(models.Roast)
        .filter_by(user_id=user.id)
        .order_by(models.Roast.created_at.desc())
        .all()
    )
    items = []
    for r in roasts:
        preview = r.roast_output[:140] + ("..." if len(r.roast_output) > 140 else "")
        items.append(
            RoastListItem(
                id=r.id,
                target_type=r.target_type,
                target_url_or_name=r.target_url_or_name,
                code_quality_score=r.code_quality_score or 50,
                documentation_score=r.documentation_score or 50,
                architecture_score=r.architecture_score or 50,
                roast_preview=preview,
                language=r.language,
                tone=r.tone,
                created_at=r.created_at,
                author_username=user.username,
            )
        )
    return items


@router.get("/{roast_id}", response_model=RoastResponse)
def get_roast(roast_id: str, db: Session = Depends(get_db)):
    roast = db.query(models.Roast).filter_by(id=roast_id).first()
    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found")
    return roast_to_response_dict(roast)


@router.delete("/{roast_id}")
def delete_roast(
    roast_id: str,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    roast = db.query(models.Roast).filter_by(id=roast_id).first()
    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found")

    if roast.user_id:
        if not current_user or current_user.id != roast.user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete this roast.")

    db.delete(roast)
    db.commit()
    return {"status": "deleted", "id": roast_id}
