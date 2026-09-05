"""
Tests for GitHub URL parsing (pure logic, no network) and repo context
fetching (mocked HTTP — never hits the real GitHub API in CI).
"""
from unittest.mock import patch, MagicMock

import pytest
from fastapi import HTTPException

from app.services import github_service


class TestParseOwnerRepo:
    def test_full_url(self):
        assert github_service.parse_owner_repo("https://github.com/octocat/Hello-World") == (
            "octocat",
            "Hello-World",
        )

    def test_shorthand(self):
        assert github_service.parse_owner_repo("octocat/Hello-World") == ("octocat", "Hello-World")

    def test_strips_git_suffix(self):
        assert github_service.parse_owner_repo("https://github.com/octocat/Hello-World.git") == (
            "octocat",
            "Hello-World",
        )

    def test_strips_trailing_slash(self):
        assert github_service.parse_owner_repo("octocat/Hello-World/") == ("octocat", "Hello-World")

    def test_invalid_raises_400(self):
        with pytest.raises(HTTPException) as exc_info:
            github_service.parse_owner_repo("not-a-valid-repo")
        assert exc_info.value.status_code == 400


class TestFetchRepoContext:
    @patch("app.services.github_service.requests.get")
    def test_happy_path(self, mock_get):
        def fake_response(url, **kwargs):
            resp = MagicMock()
            if url.endswith("/repos/octocat/Hello-World"):
                resp.status_code = 200
                resp.json.return_value = {
                    "full_name": "octocat/Hello-World",
                    "description": "My first repo",
                    "stargazers_count": 100,
                    "forks_count": 10,
                    "open_issues_count": 2,
                    "default_branch": "main",
                }
            elif url.endswith("/readme"):
                resp.status_code = 200
                resp.json.return_value = {"content": "SGVsbG8gV29ybGQ="}  # "Hello World" b64
            elif url.endswith("/languages"):
                resp.status_code = 200
                resp.json.return_value = {"Python": 1000}
            elif url.endswith("/git/trees/main"):
                resp.status_code = 200
                resp.json.return_value = {"tree": [{"path": "main.py"}, {"path": "README.md"}]}
            elif url.endswith("/commits"):
                resp.status_code = 200
                resp.json.return_value = [{"commit": {"message": "Initial commit\n\nmore detail"}}]
            else:
                resp.status_code = 404
            resp.raise_for_status = MagicMock()
            return resp

        mock_get.side_effect = fake_response

        ctx = github_service.fetch_repo_context("octocat/Hello-World")

        assert ctx["full_name"] == "octocat/Hello-World"
        assert ctx["stars"] == 100
        assert "Python" in ctx["languages"]
        assert "main.py" in ctx["file_tree"]
        assert ctx["recent_commit_messages"] == ["Initial commit"]
        assert "Hello World" in ctx["readme_excerpt"]

    @patch("app.services.github_service.requests.get")
    def test_repo_not_found_raises_404(self, mock_get):
        resp = MagicMock()
        resp.status_code = 404
        mock_get.return_value = resp

        with pytest.raises(HTTPException) as exc_info:
            github_service.fetch_repo_context("octocat/does-not-exist")
        assert exc_info.value.status_code == 404

    @patch("app.services.github_service.requests.get")
    def test_rate_limit_raises_502(self, mock_get):
        resp = MagicMock()
        resp.status_code = 403
        mock_get.return_value = resp

        with pytest.raises(HTTPException) as exc_info:
            github_service.fetch_repo_context("octocat/Hello-World")
        assert exc_info.value.status_code == 502
