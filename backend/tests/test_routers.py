"""
End-to-end router tests using FastAPI's TestClient against an isolated
SQLite test DB (see conftest.py). External calls (GitHub, Groq) are mocked
so these run fast and offline.
"""
import json
from unittest.mock import patch


VALID_LLM_JSON = json.dumps(
    {
        "roast": "This repo has one commit and it's called 'fix'.",
        "code_quality_score": 40,
        "documentation_score": 15,
        "architecture_score": 35,
        "constructive_blueprint": ["Write a real README", "Add tests", "Split main.py"],
    }
)

FAKE_REPO_CTX = {
    "owner": "octocat",
    "repo": "Hello-World",
    "full_name": "octocat/Hello-World",
    "description": "test repo",
    "stars": 5,
    "forks": 1,
    "open_issues": 0,
    "languages": {"Python": 100},
    "file_tree": ["main.py"],
    "readme_excerpt": "hi",
    "recent_commit_messages": ["fix"],
}


class TestHealthCheck:
    def test_root_returns_ok(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestGithubRoastEndpoint:
    @patch("app.routers.github_roast.llm_service.generate_roast")
    @patch("app.routers.github_roast.github_service.fetch_repo_context")
    def test_roast_github_repo_success(self, mock_fetch, mock_llm, client):
        from app.schemas import RoastLLMOutput

        mock_fetch.return_value = FAKE_REPO_CTX
        mock_llm.return_value = RoastLLMOutput(**json.loads(VALID_LLM_JSON))

        resp = client.post(
            "/api/v1/roast/github",
            json={"repo": "octocat/Hello-World", "github_username": "test-user"},
        )

        assert resp.status_code == 200
        body = resp.json()
        assert body["target_type"] == "repo"
        assert body["code_quality_score"] == 40
        assert len(body["constructive_blueprint"]) == 3

    def test_roast_github_rejects_empty_repo(self, client):
        resp = client.post("/api/v1/roast/github", json={"repo": ""})
        assert resp.status_code == 422  # pydantic validation error


class TestRoastHistoryEndpoint:
    @patch("app.routers.github_roast.llm_service.generate_roast")
    @patch("app.routers.github_roast.github_service.fetch_repo_context")
    def test_get_roast_by_id_after_creation(self, mock_fetch, mock_llm, client):
        from app.schemas import RoastLLMOutput

        mock_fetch.return_value = FAKE_REPO_CTX
        mock_llm.return_value = RoastLLMOutput(**json.loads(VALID_LLM_JSON))

        create_resp = client.post("/api/v1/roast/github", json={"repo": "octocat/Hello-World"})
        roast_id = create_resp.json()["id"]

        get_resp = client.get(f"/api/v1/roast/{roast_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == roast_id

    def test_get_nonexistent_roast_returns_404(self, client):
        resp = client.get("/api/v1/roast/does-not-exist")
        assert resp.status_code == 404

    def test_list_roasts_for_unknown_user_returns_404(self, client):
        resp = client.get("/api/v1/roast/user/nobody")
        assert resp.status_code == 404
