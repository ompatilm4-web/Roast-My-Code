# RoastMyCode API

A blunt, funny, LLM-powered code/repo/resume roasting API. Point it at a public
GitHub repo or upload a resume PDF and get back a sarcastic roast **plus**
genuinely actionable feedback, structured as JSON.

Built with **FastAPI + Groq LPUs (`qwen/qwen3.8-27b` with multi-model fallback)** — sub-second JSON inference + offline heuristic resilience.

---

## Architecture

```
Client (Next.js / Swagger UI / curl)
        │
        ▼  HTTP POST / GET
┌────────────────────────────────────────────────────────┐
│                      FastAPI App                       │
│                                                        │
│  routers/                   services/                  │
│  ├─ auth.py                 ├─ llm_service.py          │
│  ├─ snippet_roast.py        ├─ heuristic_roaster.py    │
│  ├─ github_roast.py         ├─ github_service.py       │
│  ├─ resume_roast.py         ├─ resume_service.py       │
│  └─ roast_history.py        └─ persistence.py          │
│                                                        │
│  core/  → security (JWT), logging, exceptions          │
└────────────────────────────────────────────────────────┘
        │                        │
        ▼                        ▼
  GitHub REST API          Groq LPU API (JSON mode)
        │                        │
        └────────┬───────────────┘
                  ▼
          SQLAlchemy 2.0 → SQLite (dev) / Postgres (prod)
```

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account |
| `POST` | `/api/v1/auth/login` | Authenticate user & get JWT token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| `PUT` | `/api/v1/auth/profile` | Update profile and custom Groq API key |
| `POST` | `/api/v1/roast/snippet` | Roast raw code snippet with chosen persona |
| `POST` | `/api/v1/roast/github` | Roast a public GitHub repo |
| `POST` | `/api/v1/roast/resume` | Roast uploaded resume PDF |
| `GET` | `/api/v1/roast/public` | Paginated public "Hall of Flame" roasts |
| `GET` | `/api/v1/roast/stats` | Global platform metrics |
| `GET` | `/api/v1/roast/{roast_id}` | Fetch a saved roast by ID |
| `GET` | `/api/v1/roast/user/{username}` | List all roasts for a user |
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
