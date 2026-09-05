"""
Centralized app configuration.
All values are pulled from environment variables / .env so nothing
sensitive is hardcoded.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


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
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_TEMPERATURE: float = 0.7
    GROQ_MAX_TOKENS: int = 1500

    # --- GitHub ---
    # Optional but strongly recommended: unauthenticated GitHub API calls
    # are capped at 60 requests/hour per IP vs 5000/hour with a token.
    GITHUB_TOKEN: str = ""

    # --- Optional API key auth (see app/core/security.py) ---
    # Leave blank to disable auth entirely (fine for local dev / early demo).
    API_KEY: str = ""

    # --- Uploads ---
    MAX_RESUME_SIZE_MB: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
