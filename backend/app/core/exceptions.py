"""
App-specific exceptions and their HTTP mappings. Routers/services can raise
these instead of constructing HTTPException everywhere, which keeps error
handling consistent and makes intent explicit at the call site.
"""
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class RoastMyCodeError(Exception):
    """Base class for all app-specific errors."""

    status_code = 500
    detail = "Something went wrong."

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.detail
        super().__init__(self.detail)


class GithubRateLimitError(RoastMyCodeError):
    status_code = 502
    detail = "GitHub API rate limit hit. Add a GITHUB_TOKEN to raise the limit."


class RepoNotFoundError(RoastMyCodeError):
    status_code = 404
    detail = "GitHub repo not found."


class LLMGenerationError(RoastMyCodeError):
    status_code = 502
    detail = "The LLM failed to generate a valid roast after retrying."


class InvalidResumeError(RoastMyCodeError):
    status_code = 422
    detail = "Could not extract usable text from this resume."


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RoastMyCodeError)
    async def handle_app_error(request: Request, exc: RoastMyCodeError):
        logger.warning("Handled app error: %s", exc.detail)
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception):
        logger.exception("Unhandled exception")
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})
