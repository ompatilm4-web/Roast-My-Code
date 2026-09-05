from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RoastResponse
from app.prompts import RESUME_SYSTEM_PROMPT
from app.services import resume_service, llm_service, persistence

router = APIRouter(prefix="/api/v1/roast", tags=["Resume Roast"])


@router.post("/resume", response_model=RoastResponse)
async def roast_resume(
    file: UploadFile = File(..., description="Resume as a PDF"),
    github_username: str | None = Form(default=None),
    db: Session = Depends(get_db),
):
    """Parse an uploaded resume PDF, roast it, and persist the result."""
    raw_bytes = await file.read()
    resume_text = resume_service.extract_resume_text(file, raw_bytes)

    llm_output = llm_service.generate_roast(RESUME_SYSTEM_PROMPT, resume_text)

    user = persistence.get_or_create_user(db, github_username)
    roast = persistence.save_roast(
        db,
        target_type="resume",
        target_url_or_name=file.filename or "resume.pdf",
        llm_output=llm_output,
        user=user,
    )
    return persistence.roast_to_response_dict(roast)
