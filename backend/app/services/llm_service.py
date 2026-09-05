"""
Wraps the Groq client: sends the system prompt + context, enforces JSON
mode, and validates the response against our Pydantic schema. Retries
once if the model returns malformed JSON (rare, but happens).
"""
import json

from fastapi import HTTPException
from groq import Groq
from pydantic import ValidationError

from app.config import get_settings
from app.schemas import RoastLLMOutput

settings = get_settings()
_client: Groq | None = None


def get_client() -> Groq:
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY is not configured. Add it to your .env file.",
            )
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _call_groq(system_prompt: str, user_content: str) -> str:
    client = get_client()
    try:
        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            temperature=settings.GROQ_TEMPERATURE,
            max_tokens=settings.GROQ_MAX_TOKENS,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API request failed: {e}")

    return completion.choices[0].message.content


def generate_roast(system_prompt: str, user_content: str) -> RoastLLMOutput:
    """Calls Groq and returns a validated RoastLLMOutput, retrying once on
    a malformed/invalid JSON response."""
    last_error: Exception | None = None

    for attempt in range(2):
        raw = _call_groq(system_prompt, user_content)
        try:
            data = json.loads(raw)
            return RoastLLMOutput(**data)
        except (json.JSONDecodeError, ValidationError) as e:
            last_error = e
            # On retry, nudge the model harder about strict JSON.
            user_content = (
                user_content
                + "\n\nIMPORTANT: Your previous response was not valid JSON matching the schema. "
                "Return ONLY the raw JSON object, nothing else."
            )
            continue

    raise HTTPException(
        status_code=502,
        detail=f"Groq returned malformed output after retry: {last_error}",
    )
