
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


# ---------- Auth Schemas ----------

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=100)
    full_name: Optional[str] = None
    github_username: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not cleaned.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username must contain only letters, numbers, underscores, or hyphens")
        return cleaned


class UserLogin(BaseModel):
    username_or_email: str = Field(...)
    password: str = Field(...)


class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    github_username: Optional[str] = None
    avatar_url: Optional[str] = None
    custom_api_key_set: bool = False
    created_at: datetime
    roast_count: int = 0

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    github_username: Optional[str] = None
    avatar_url: Optional[str] = None
    custom_api_key: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------- Roast Requests ----------

class GithubRoastRequest(BaseModel):
    repo: str = Field(
        ...,
        description="Full GitHub URL or 'owner/repo' shorthand, e.g. 'octocat/Hello-World'",
        examples=["https://github.com/octocat/Hello-World", "octocat/Hello-World"],
    )
    github_username: Optional[str] = Field(
        default=None, description="Optional: associate this roast with a user profile"
    )
    tone: Optional[str] = Field(default="senior_dev", description="Roast persona/tone")

    @field_validator("repo")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("repo must not be empty")
        return v.strip()


class SnippetRoastRequest(BaseModel):
    code: str = Field(..., min_length=5, description="Code snippet to roast")
    language: Optional[str] = Field(default="auto", description="Programming language")
    title: Optional[str] = Field(default="code_snippet", description="Snippet name/description")
    tone: Optional[str] = Field(default="senior_dev", description="Roast persona/tone")

    @field_validator("code")
    @classmethod
    def not_empty_code(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Code snippet must not be empty")
        return v


# ---------- LLM output contract (what we force Groq / Fallback to return) ----------

class RoastLLMOutput(BaseModel):
    roast: str = Field(description="A witty, sarcastic critique of the code/repo/resume")
    code_quality_score: int = Field(ge=0, le=100)
    documentation_score: int = Field(ge=0, le=100)
    architecture_score: int = Field(ge=0, le=100)
    constructive_blueprint: List[str] = Field(min_length=1, max_length=8)


# ---------- Roast Responses ----------

class RoastResponse(BaseModel):
    id: str
    target_type: str
    target_url_or_name: str
    code_snippet: Optional[str] = None
    roast: str
    code_quality_score: int
    documentation_score: int
    architecture_score: int
    constructive_blueprint: List[str]
    language: Optional[str] = None
    tone: Optional[str] = None
    is_public: bool = True
    created_at: datetime
    author_username: Optional[str] = None

    model_config = {"from_attributes": True}


class RoastListItem(BaseModel):
    id: str
    target_type: str
    target_url_or_name: str
    code_quality_score: int
    documentation_score: int
    architecture_score: int
    roast_preview: Optional[str] = None
    language: Optional[str] = None
    tone: Optional[str] = None
    created_at: datetime
    author_username: Optional[str] = None

    model_config = {"from_attributes": True}


class PlatformStats(BaseModel):
    total_roasts: int
    avg_code_quality: int
    avg_documentation: int
    avg_architecture: int
    repo_roasts: int
    resume_roasts: int
    snippet_roasts: int
