
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

# Primary and fallback models known to be active on Groq
FALLBACK_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
]


def get_client(custom_api_key: Optional[str] = None) -> Optional[Groq]:
    settings = get_settings()
    key = custom_api_key or settings.GROQ_API_KEY
    if not key or not key.strip():
        return None
    try:
        return Groq(api_key=key.strip())
    except Exception as e:
        logger.warning("Failed to initialize Groq client: %s", e)
        return None


def _call_groq(client: Groq, model: str, system_prompt: str, user_content: str) -> str:
    settings = get_settings()
    completion = client.chat.completions.create(
        model=model,
        temperature=settings.GROQ_TEMPERATURE,
        max_tokens=settings.GROQ_MAX_TOKENS,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
    )
    return completion.choices[0].message.content


def _sanitize_output(data: dict, target_type: str) -> RoastLLMOutput:
    """Ensure data dictionary strictly satisfies RoastLLMOutput schema."""
    roast = str(data.get("roast") or "No roast commentary generated.")

    # Clamp scores
    def clamp_score(val, default=50):
        try:
            return max(0, min(100, int(val)))
        except (ValueError, TypeError):
            return default

    q_score = clamp_score(data.get("code_quality_score"), 50)
    d_score = clamp_score(data.get("documentation_score"), 50)
    a_score = clamp_score(data.get("architecture_score"), 50)

    # Sanitize constructive_blueprint
    bp = data.get("constructive_blueprint")
    cleaned_bp = []
    if isinstance(bp, list):
        for item in bp:
            if isinstance(item, str) and item.strip():
                cleaned_bp.append(item.strip())
    elif isinstance(bp, str) and bp.strip():
        lines = [line.strip().lstrip("0123456789.-* ") for line in bp.split("\n")]
        cleaned_bp = [l for l in lines if l]

    if not cleaned_bp:
        if "resume" in target_type.lower():
            cleaned_bp = [
                "Quantify measurable engineering impact using metrics (latency, scale, revenue).",
                "Cut corporate buzzwords and emphasize concrete technical stack competencies.",
                "Highlight key production repos and portfolio links.",
            ]
        else:
            cleaned_bp = [
                "Extract business logic into testable, single-responsibility functions.",
                "Enforce defensive error boundaries and edge-case handling.",
                "Add explicit type annotations and documentation for interfaces.",
            ]

    return RoastLLMOutput(
        roast=roast,
        code_quality_score=q_score,
        documentation_score=d_score,
        architecture_score=a_score,
        constructive_blueprint=cleaned_bp[:8],
    )


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
    settings = get_settings()
    client = get_client(custom_api_key)

    if client:
        models_to_try = [settings.GROQ_MODEL]
        for m in FALLBACK_MODELS:
            if m not in models_to_try:
                models_to_try.append(m)

        last_error: Exception | None = None
        current_prompt = user_content

        for model in models_to_try:
            try:
                logger.info("Attempting roast via Groq model '%s'...", model)
                raw = _call_groq(client, model, system_prompt, current_prompt)
                data = json.loads(raw)
                output = _sanitize_output(data, target_type)
                logger.info("Groq roast successfully generated with model '%s'.", model)
                return output
            except Exception as e:
                logger.warning("Groq call failed for model '%s': %s", model, e)
                last_error = e
                # If error is a model not found / access error, try the next model immediately
                continue

        logger.warning(
            "All Groq LLM attempts failed (%s). Engaging high-fidelity heuristic fallback engine.",
            last_error,
        )

    if settings.ALLOW_FALLBACK_ROASTER:
        return generate_heuristic_roast(system_prompt, user_content, target_type)

    raise HTTPException(
        status_code=502,
        detail="Groq LLM service is currently unavailable. Please provide a valid GROQ_API_KEY in settings or .env.",
    )

