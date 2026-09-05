from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import GithubRoastRequest, RoastResponse
from app.prompts import GITHUB_SYSTEM_PROMPT
from app.services import github_service, llm_service, persistence

router = APIRouter(prefix="/api/v1/roast", tags=["GitHub Roast"])


@router.post("/github", response_model=RoastResponse)
def roast_github_repo(request: GithubRoastRequest, db: Session = Depends(get_db)):
    """Fetch a public GitHub repo, roast it, and persist the result."""
    ctx = github_service.fetch_repo_context(request.repo)
    prompt_text = github_service.build_repo_prompt_text(ctx)

    llm_output = llm_service.generate_roast(GITHUB_SYSTEM_PROMPT, prompt_text)

    user = persistence.get_or_create_user(db, request.github_username)
    roast = persistence.save_roast(
        db,
        target_type="repo",
        target_url_or_name=ctx["full_name"],
        llm_output=llm_output,
        user=user,
    )
    return persistence.roast_to_response_dict(roast)
