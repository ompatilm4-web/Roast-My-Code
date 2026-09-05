# RoastMyCode

Sarcastic, LLM-powered feedback on your code, GitHub repos, and resume —
paired with genuinely actionable advice, not just jokes.

```
[ Next.js frontend ] ──HTTP──► [ FastAPI backend ] ──► GitHub API + Groq API ──► Postgres/SQLite
```

## Structure

| Folder | What it is |
|---|---|
| [`backend/`](./backend/README.md) | FastAPI service — roast generation, GitHub/PDF parsing, persistence |
| `frontend/` | Next.js + Tailwind dashboard consuming the backend API |
| `docs/` | Architecture notes, API reference, demo script |
| `.github/workflows/` | CI — lints and tests both services on every push |

## Quick start (full stack, local)

```bash
# 1. Backend env
cp backend/.env.example backend/.env
# edit backend/.env → add GROQ_API_KEY (get one free at console.groq.com)

# 2. Frontend env
cp frontend/.env.local.example frontend/.env.local

# 3. Run everything
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

Or run each service natively — see [`backend/README.md`](./backend/README.md)
and run `npm install && npm run dev` inside `frontend/`.

## Testing

```bash
cd backend && pip install -r requirements-dev.txt && pytest -v
cd frontend && npm install && npm run build
```

Both run in CI on every push (see `.github/workflows/ci.yml`).

## Docs

- [`docs/architecture.md`](./docs/architecture.md) — full system design, data model, request flow
- [`docs/api-reference.md`](./docs/api-reference.md) — every endpoint, request/response shapes
- [`docs/demo-script.md`](./docs/demo-script.md) — walkthrough script for hackathon judges/interviewers

## Deployment

- **Backend** → Render, Railway, or Fly.io (Dockerfile included; see `backend/README.md` for step-by-step)
- **Frontend** → Vercel (zero-config for Next.js) or the included `frontend/Dockerfile`
- **Database** → managed Postgres from whichever backend host you pick
