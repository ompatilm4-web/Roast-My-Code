
import os

from celery import Celery

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "roastmycode",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="generate_roast_task", bind=True, max_retries=2)
def generate_roast_task(self, system_prompt: str, user_content: str) -> dict:
    """Runs the Groq call in a worker process instead of the request thread."""
    from app.services.llm_service import generate_roast

    try:
        result = generate_roast(system_prompt, user_content)
        return result.model_dump()
    except Exception as exc:
        raise self.retry(exc=exc, countdown=5)