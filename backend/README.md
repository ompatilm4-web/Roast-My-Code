# RoastMyCode API

A blunt, funny, LLM-powered code/repo/resume roasting API. Point it at a public
GitHub repo or upload a resume PDF and get back a sarcastic roast **plus**
genuinely actionable feedback, structured as JSON.

Built with **FastAPI + Groq (Llama 3.1 8B Instant)** — free tier, fast inference.

---

## Architecture

```
Client (Swagger UI / React / curl)
        │
        ▼  HTTP POST
┌───────────────────────────────────────────┐
│                FastAPI App                 │
│                                             │
│  routers/          services/                │
│  ├─ github_roast.py   ├─ github_service.py  │
│  ├─ resume_roast.py   ├─ resume_service.py  │
│  └─ roast_history.py  ├─ llm_service.py      │
│                        └─ persistence.py     │
│  core/  → logging, exceptions, auth          │
└───────────────────────────────────────────┘
        │                        │
        ▼                        ▼
  GitHub REST API          Groq API (JSON mode)
        │                        │
        └────────┬───────────────┘
                  ▼
          SQLAlchemy → SQLite (dev) / Postgres (prod)
```

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/roast/github` | Roast a public GitHub repo. Body: `{"repo": "owner/repo"}` |
| `POST` | `/api/v1/roast/resume` | Roast a resume. Multipart form: `file` (PDF), optional `github_username` |
| `GET` | `/api/v1/roast/{roast_id}` | Fetch a saved roast by ID |
| `GET` | `/api/v1/roast/user/{github_username}` | List all roasts for a user |
| `GET` | `/` | Health check |

Interactive docs at `/docs` (Swagger) and `/redoc`.

---

## Local Setup

### 1. Get a free Groq API key
1. Sign up at [console.groq.com](https://console.groq.com)
2. Generate an API key
3. (Recommended) Also grab a [GitHub personal access token](https://github.com/settings/tokens)
   (no scopes needed for public repos) — raises the GitHub API limit from
   60 req/hr to 5,000 req/hr.

### 2. Configure environment
```bash
cp .env.example .env
# edit .env and paste in GROQ_API_KEY (and optionally GITHUB_TOKEN)
```

### 3. Install & run (no Docker)
```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Uses local SQLite by default — zero extra setup. Visit
`http://127.0.0.1:8000/docs` to try it.

### 4. Run with Docker (Postgres included)
```bash
docker compose up --build
```

---

## Testing

```bash
pip install -r requirements-dev.txt
pytest -v --cov=app --cov-report=term-missing

```
22 tests, fully mocked (no real GitHub/Groq calls, no API key required).

---

## Migrations (Alembic)

```bash
alembic revision --autogenerate -m "description of change"
alembic upgrade head
```
Config in `alembic.ini` / `alembic/env.py` reads `DATABASE_URL` from the
same `Settings` object the app uses — no duplicated config.

---

## Example Requests

```bash
curl -X POST http://127.0.0.1:8000/api/v1/roast/github \
  -H "Content-Type: application/json" \
  -d '{"repo": "octocat/Hello-World", "github_username": "your-username"}'
```

```bash
curl -X POST http://127.0.0.1:8000/api/v1/roast/resume \
  -F "file=@resume.pdf" \
  -F "github_username=your-username"
```

---

## Deploying (free tiers)

### Render
1. Push this repo to GitHub.
2. New → Web Service → connect the repo.
3. Environment: Docker (picks up the `Dockerfile` automatically).
4. Add env vars from `.env.example`.
5. Add a free Render Postgres instance and set `DATABASE_URL` to its connection string.

### Railway
1. `railway init` → link this repo.
2. Add a Postgres plugin — Railway injects `DATABASE_URL` automatically.
3. Add `GROQ_API_KEY` (and `GITHUB_TOKEN`) as project variables.

### Fly.io
```bash
fly launch
fly secrets set GROQ_API_KEY=xxx GITHUB_TOKEN=xxx
fly postgres create && fly postgres attach
fly deploy
```

---

## Production Notes

- **Migrations**: use Alembic (above) instead of `create_all()` once the schema stabilizes.
- **Rate limiting**: `slowapi` is included; wire `limiter` from `app/core/security.py` onto routers.
- **Background processing**: `app/tasks/celery_app.py` is ready to wire in for higher traffic.
- **Auth**: set `API_KEY` in `.env` to require an `X-API-Key` header on protected routes.

---

## Tech Stack

- **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.0
- **LLM**: Groq (`llama-3.1-8b-instant`, JSON mode)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Parsing**: `requests` (GitHub REST API), `pypdf` (resumes)
- **Testing**: pytest, fully mocked external calls
- **Deployment**: Docker + docker-compose, deployable to Render/Railway/Fly.io
