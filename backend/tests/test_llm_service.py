"""
Tests for the Groq wrapper: valid JSON on first try, retry-on-malformed-JSON,
and the final failure path. Groq is fully mocked — no real API calls, no
API key needed, runs offline in CI.
"""
import json
from unittest.mock import patch, MagicMock

import pytest
from fastapi import HTTPException

from app.services import llm_service


def _mock_completion(content: str):
    completion = MagicMock()
    completion.choices = [MagicMock(message=MagicMock(content=content))]
    return completion


VALID_JSON = json.dumps(
    {
        "roast": "Your variable names read like a ransom note.",
        "code_quality_score": 55,
        "documentation_score": 20,
        "architecture_score": 60,
        "constructive_blueprint": ["Add docstrings", "Rename variables", "Add tests"],
    }
)


class TestGenerateRoast:
    @patch("app.services.llm_service.get_client")
    def test_valid_json_first_try(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = _mock_completion(VALID_JSON)
        mock_get_client.return_value = mock_client

        result = llm_service.generate_roast("system prompt", "user content")

        assert result.code_quality_score == 55
        assert len(result.constructive_blueprint) == 3
        assert mock_client.chat.completions.create.call_count == 1

    @patch("app.services.llm_service.get_client")
    def test_retries_once_on_malformed_json(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = [
            _mock_completion("not valid json {{{"),
            _mock_completion(VALID_JSON),
        ]
        mock_get_client.return_value = mock_client

        result = llm_service.generate_roast("system prompt", "user content")

        assert result.code_quality_score == 55
        assert mock_client.chat.completions.create.call_count == 2

    @patch("app.services.llm_service.get_client")
    def test_raises_502_after_two_bad_responses(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = [
            _mock_completion("garbage"),
            _mock_completion("still garbage"),
        ]
        mock_get_client.return_value = mock_client

        with pytest.raises(HTTPException) as exc_info:
            llm_service.generate_roast("system prompt", "user content")
        assert exc_info.value.status_code == 502

    @patch("app.services.llm_service.get_client")
    def test_score_out_of_range_triggers_retry(self, mock_get_client):
        invalid_score_json = json.dumps(
            {
                "roast": "meh",
                "code_quality_score": 150,  # invalid: > 100
                "documentation_score": 20,
                "architecture_score": 60,
                "constructive_blueprint": ["tip"],
            }
        )
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = [
            _mock_completion(invalid_score_json),
            _mock_completion(VALID_JSON),
        ]
        mock_get_client.return_value = mock_client

        result = llm_service.generate_roast("system prompt", "user content")
        assert result.code_quality_score == 55  # fell through to the valid retry
