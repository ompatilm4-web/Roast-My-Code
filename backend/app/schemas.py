"""
Pydantic schemas — the API's public contract.
Kept separate from the ORM models on purpose (proper layering: DB shape
can evolve independently of what clients see).
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# ---------- Requests ----------

class GithubRoastRequest(BaseModel):
    repo: str = Field(
        ...,
        description="Full GitHub URL or 'owner/repo' shorthand, e.g. 'octocat/Hello-World'",
        examples=["https://github.com/octocat/Hello-World", "octocat/Hello-World"],
    )
    github_username: Optional[str] = Field(
        default=None, description="Optional: associate this roast with a user profile"
    )

    @field_validator("repo")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("repo must not be empty")
        return v.strip()


# ---------- LLM output contract (what we force Groq to return) ----------

class RoastLLMOutput(BaseModel):
    roast: str = Field(description="A witty, sarcastic critique of the code/repo/resume")
    code_quality_score: int = Field(ge=0, le=100)
    documentation_score: int = Field(ge=0, le=100)
    architecture_score: int = Field(ge=0, le=100)
    constructive_blueprint: list[str] = Field(min_length=1, max_length=8)


# ---------- Responses ----------

class RoastResponse(BaseModel):
    id: str
    target_type: str
    target_url_or_name: str
    roast: str
    code_quality_score: int
    documentation_score: int
    architecture_score: int
    constructive_blueprint: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class RoastListItem(BaseModel):
    id: str
    target_type: str
    target_url_or_name: str
    code_quality_score: int
    documentation_score: int
    architecture_score: int
    created_at: datetime

    model_config = {"from_attributes": True}
