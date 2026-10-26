
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ENV_PATH = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "RoastMyCode API"
    ENV: str = "development"  # development | production
    ALLOWED_ORIGINS: str = "*"  # comma-separated list in prod, e.g. "https://roastmycode.app"

    # --- Database ---
    # Defaults to a local SQLite file so the project runs with zero setup.
    # Swap for a Postgres URL in production:
    #   postgresql+psycopg2://user:pass@host:5432/roastmycode
    DATABASE_URL: str = "sqlite:///./roastmycode.db"

    # --- Groq / LLM ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    GROQ_TEMPERATURE: float = 0.7
    GROQ_MAX_TOKENS: int = 1500

    # --- GitHub ---
    # Optional but strongly recommended: unauthenticated GitHub API calls
    # are capped at 60 requests/hour per IP vs 5000/hour with a token.
    GITHUB_TOKEN: str = ""

    # --- Optional API key auth (see app/core/security.py) ---
    # Leave blank to disable auth entirely (fine for local dev / early demo).
    API_KEY: str = ""

    # --- JWT Authentication ---
    JWT_SECRET_KEY: str = "supersecret_roastmycode_jwt_key_987654321_flame_guard"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # --- Fallback / Heuristic engine ---
    ALLOW_FALLBACK_ROASTER: bool = True

    # --- Uploads ---
    MAX_RESUME_SIZE_MB: int = 5

    model_config = SettingsConfigDict(
        env_file=(str(_ENV_PATH), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

