from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.core.logging import setup_logging
from app.core.exceptions import register_exception_handlers
from app.routers import github_roast, resume_roast, roast_history

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Sarcastic, LLM-powered code, repo, and resume roasting API — powered by Groq.",
    version="1.0.0",
    lifespan=lifespan,
)

register_exception_handlers(app)

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")] if settings.ALLOWED_ORIGINS != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(github_roast.router)
app.include_router(resume_roast.router)
app.include_router(roast_history.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": settings.APP_NAME, "env": settings.ENV}
