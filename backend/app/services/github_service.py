"""
Fetches everything we need about a repo from the GitHub REST API:
metadata, README, language breakdown, top-level file tree, and recent
commit messages. Returns a plain dict that gets fed into the LLM prompt.
"""
import re
import base64
from urllib.parse import urlparse

import requests
from fastapi import HTTPException

from app.config import get_settings

settings = get_settings()
GITHUB_API = "https://api.github.com"


def _headers() -> dict:
    headers = {"Accept": "application/vnd.github+json"}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
    return headers


def parse_owner_repo(repo_identifier: str) -> tuple[str, str]:
    """Accepts 'owner/repo' or a full GitHub URL and returns (owner, repo)."""
    repo_identifier = repo_identifier.strip().rstrip("/")

    if repo_identifier.startswith("http://") or repo_identifier.startswith("https://"):
        path = urlparse(repo_identifier).path.strip("/")
    else:
        path = repo_identifier

    parts = [p for p in path.split("/") if p]
    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="repo must look like 'owner/repo' or a full GitHub URL")

    owner, repo = parts[0], re.sub(r"\.git$", "", parts[1])
    return owner, repo


def _get(url: str, params: dict | None = None):
    resp = requests.get(url, headers=_headers(), params=params, timeout=15)
    return resp


def fetch_repo_context(repo_identifier: str) -> dict:
    owner, repo = parse_owner_repo(repo_identifier)
    base = f"{GITHUB_API}/repos/{owner}/{repo}"

    repo_resp = _get(base)
    if repo_resp.status_code == 404:
        raise HTTPException(status_code=404, detail=f"GitHub repo '{owner}/{repo}' not found")
    if repo_resp.status_code == 403:
        raise HTTPException(
            status_code=502,
            detail="GitHub API rate limit hit. Add a GITHUB_TOKEN to your .env to raise the limit.",
        )
    repo_resp.raise_for_status()
    repo_data = repo_resp.json()

    # README (best-effort, not all repos have one)
    readme_text = ""
    readme_resp = _get(f"{base}/readme")
    if readme_resp.status_code == 200:
        content = readme_resp.json().get("content", "")
        try:
            readme_text = base64.b64decode(content).decode("utf-8", errors="ignore")
        except Exception:
            readme_text = ""

    # Languages
    languages: dict = {}
    lang_resp = _get(f"{base}/languages")
    if lang_resp.status_code == 200:
        languages = lang_resp.json()

    # Top-level file tree
    file_tree: list[str] = []
    default_branch = repo_data.get("default_branch", "main")
    tree_resp = _get(f"{base}/git/trees/{default_branch}")
    if tree_resp.status_code == 200:
        file_tree = [item["path"] for item in tree_resp.json().get("tree", [])][:50]

    # Recent commits
    commit_messages: list[str] = []
    commits_resp = _get(f"{base}/commits", params={"per_page": 10})
    if commits_resp.status_code == 200:
        commit_messages = [c["commit"]["message"].split("\n")[0] for c in commits_resp.json()]

    return {
        "owner": owner,
        "repo": repo,
        "full_name": repo_data.get("full_name"),
        "description": repo_data.get("description"),
        "stars": repo_data.get("stargazers_count"),
        "forks": repo_data.get("forks_count"),
        "open_issues": repo_data.get("open_issues_count"),
        "languages": languages,
        "file_tree": file_tree,
        "readme_excerpt": readme_text[:4000],  # cap to keep prompt small
        "recent_commit_messages": commit_messages,
    }


def build_repo_prompt_text(ctx: dict) -> str:
    return f"""
Repository: {ctx['full_name']}
Description: {ctx['description'] or '(none provided)'}
Stars: {ctx['stars']} | Forks: {ctx['forks']} | Open issues: {ctx['open_issues']}
Languages: {', '.join(ctx['languages'].keys()) or 'unknown'}

Top-level file tree (up to 50 entries):
{chr(10).join(ctx['file_tree']) or '(empty)'}

Recent commit messages:
{chr(10).join(f"- {m}" for m in ctx['recent_commit_messages']) or '(none)'}

README excerpt:
{ctx['readme_excerpt'] or '(no README found — this alone deserves a roast)'}
""".strip()
