from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import RoastResponse, RoastListItem
from app.services.persistence import roast_to_response_dict

router = APIRouter(prefix="/api/v1/roast", tags=["Roast History"])


@router.get("/{roast_id}", response_model=RoastResponse)
def get_roast(roast_id: str, db: Session = Depends(get_db)):
    roast = db.query(models.Roast).filter_by(id=roast_id).first()
    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found")
    return roast_to_response_dict(roast)


@router.get("/user/{github_username}", response_model=list[RoastListItem])
def list_user_roasts(github_username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(github_username=github_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return (
        db.query(models.Roast)
        .filter_by(user_id=user.id)
        .order_by(models.Roast.created_at.desc())
        .all()
    )
