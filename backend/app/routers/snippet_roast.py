"""
Direct Code Snippet roasting router.
Allows developers to paste raw code snippets and receive immediate, witty feedback + blueprint.
"""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import SnippetRoastRequest, RoastResponse
from app.prompts import SNIPPET_SYSTEM_PROMPT
from app.core.security import get_current_user_optional
from app.services import llm_service, persistence

router = APIRouter(prefix="/api/v1/roast", tags=["Snippet Roast"])


@router.post("/snippet", response_model=RoastResponse)
def roast_code_snippet(
    req: SnippetRoastRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Analyze and roast a pasted code snippet directly."""
    lang_info = f"Language: {req.language}\n" if req.language and req.language != "auto" else ""
    title_info = f"Snippet Context: {req.title}\n" if req.title else ""
    tone_instruction = f"Tone: {req.tone}\n" if req.tone else ""

    prompt_text = (
        f"{title_info}{lang_info}{tone_instruction}\n"
        f"```\n{req.code}\n```"
    )

    custom_key = current_user.custom_api_key if current_user else None
    llm_output = llm_service.generate_roast(
        system_prompt=SNIPPET_SYSTEM_PROMPT,
        user_content=prompt_text,
        custom_api_key=custom_key,
        target_type="snippet",
    )

    target_name = req.title if req.title and req.title.strip() else f"Snippet ({req.language or 'Code'})"

    roast = persistence.save_roast(
        db=db,
        target_type="snippet",
        target_url_or_name=target_name,
        llm_output=llm_output,
        user=current_user,
        code_snippet=req.code,
        language=req.language,
        tone=req.tone,
        is_public=True,
    )
    return persistence.roast_to_response_dict(roast)
