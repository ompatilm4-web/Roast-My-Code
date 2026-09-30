"""
Wraps the Groq client: sends the system prompt + context, enforces JSON
mode, and validates the response against our Pydantic schema. Retries
once if the model returns malformed JSON.
Falls back gracefully to intelligent heuristic engine if Groq is unconfigured or returns an error.
"""
import json
import logging
from typing import Optional

from fastapi import HTTPException
from groq import Groq
from pydantic import ValidationError

from app.config import get_settings
from app.schemas import RoastLLMOutput
from app.services.heuristic_roaster import generate_heuristic_roast

logger = logging.getLogger("roastmycode.llm")
settings = get_settings()


def get_client(custom_api_key: Optional[str] = None) -> Optional[Groq]:
    key = custom_api_key or settings.GROQ_API_KEY
    if not key or not key.strip():
        return None
    try:
        return Groq(api_key=key.strip())
    except Exception as e:
        logger.warning("Failed to initialize Groq client: %s", e)
        return None


def _call_groq(client: Groq, system_prompt: str, user_content: str) -> str:
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
    return completion.choices[0].message.content


def generate_roast(
    system_prompt: str,
    user_content: str,
    custom_api_key: Optional[str] = None,
    target_type: str = "snippet",
) -> RoastLLMOutput:
    """
    Calls Groq and returns a validated RoastLLMOutput.
    If Groq fails (e.g. invalid key, quota, offline), smoothly falls back to
    our context-aware heuristic analyzer so users are never blocked.
    """
    client = get_client(custom_api_key)

    if client:
        last_error: Exception | None = None
        current_prompt = user_content
        for attempt in range(2):
            try:
                raw = _call_groq(client, system_prompt, current_prompt)
                data = json.loads(raw)
                return RoastLLMOutput(**data)
            except (json.JSONDecodeError, ValidationError) as e:
                last_error = e
                current_prompt = (
                    user_content
                    + "\n\nIMPORTANT: Return ONLY valid JSON matching the exact schema."
                )
                continue
            except Exception as e:
                logger.warning("Groq call failed (attempt %d): %s", attempt + 1, e)
                last_error = e
                break

        logger.warning(
            "Groq LLM was unavailable (%s). Engaging high-fidelity heuristic fallback engine.",
            last_error,
        )

    if settings.ALLOW_FALLBACK_ROASTER:
        return generate_heuristic_roast(system_prompt, user_content, target_type)

    raise HTTPException(
        status_code=502,
        detail="Groq LLM service is currently unavailable. Please provide a valid GROQ_API_KEY in settings or .env.",
    )
