# API Reference

Base URL (local): `http://127.0.0.1:8000`
Interactive docs: `/docs` (Swagger UI), `/redoc` (ReDoc)

---

## `POST /api/v1/roast/github`

Roast a public GitHub repository.

**Request body**
```json
{
  "repo": "octocat/Hello-World",
  "github_username": "your-username"
}
```
- `repo` — required. Accepts `owner/repo` shorthand or a full GitHub URL.
- `github_username` — optional. Associates the roast with a user for history lookup.

**Response `200`**
```json
{
  "id": "b3f1...",
  "target_type": "repo",
  "target_url_or_name": "octocat/Hello-World",
  "roast": "This repo has one commit and it's called 'fix'.",
  "code_quality_score": 40,
  "documentation_score": 15,
  "architecture_score": 35,
  "constructive_blueprint": [
    "Write a real README",
    "Add tests",
    "Split main.py"
  ],
  "created_at": "2026-08-11T12:00:00Z"
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | Malformed `repo` value |
| 404 | Repo doesn't exist or is private |
| 502 | GitHub rate limit hit, or Groq failed to return valid JSON after retry |

---

## `POST /api/v1/roast/resume`

Roast an uploaded resume PDF.

**Request** — `multipart/form-data`
- `file` — required. PDF, max 5MB.
- `github_username` — optional form field.

**Response `200`** — same shape as the GitHub endpoint, with
`target_type: "resume"`. Scores are re-labeled in the UI as Impact,
Clarity, and Structure — same underlying fields.

**Errors**
| Status | Cause |
|---|---|
| 400 | Not a PDF, or corrupt file, or over 5MB |
| 422 | PDF has no extractable text (likely a scanned image) |
| 502 | Groq failed to return valid JSON after retry |

---

## `GET /api/v1/roast/{roast_id}`

Fetch a previously saved roast by ID.

**Response `200`** — same shape as the create endpoints.
**404** if the ID doesn't exist.

---

## `GET /api/v1/roast/user/{github_username}`

List all roasts for a given username, newest first.

**Response `200`**
```json
[
  {
    "id": "b3f1...",
    "target_type": "repo",
    "target_url_or_name": "octocat/Hello-World",
    "code_quality_score": 40,
    "documentation_score": 15,
    "architecture_score": 35,
    "created_at": "2026-08-11T12:00:00Z"
  }
]
```
**404** if no user with that username has any roasts yet.

---

## `GET /`

Health check.
```json
{ "status": "ok", "service": "RoastMyCode API", "env": "development" }
```
