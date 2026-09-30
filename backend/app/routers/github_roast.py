from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import GithubRoastRequest, RoastResponse
from app.prompts import GITHUB_SYSTEM_PROMPT
from app.core.security import get_current_user_optional
from app.services import github_service, llm_service, persistence

router = APIRouter(prefix="/api/v1/roast", tags=["GitHub Roast"])


@router.post("/github", response_model=RoastResponse)
def roast_github_repo(
    request: GithubRoastRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Fetch a public GitHub repo, roast it, and persist the result."""
    ctx = github_service.fetch_repo_context(request.repo)
    prompt_text = github_service.build_repo_prompt_text(ctx)

    custom_key = current_user.custom_api_key if current_user else None
    llm_output = llm_service.generate_roast(
        system_prompt=GITHUB_SYSTEM_PROMPT,
        user_content=prompt_text,
        custom_api_key=custom_key,
        target_type="repo",
    )

    user = current_user or persistence.get_or_create_user(db, request.github_username)
    roast = persistence.save_roast(
        db,
        target_type="repo",
        target_url_or_name=ctx["full_name"],
        llm_output=llm_output,
        user=user,
        language=ctx.get("language"),
        tone=request.tone or "senior_dev",
        is_public=True,
    )
    return persistence.roast_to_response_dict(roast)
