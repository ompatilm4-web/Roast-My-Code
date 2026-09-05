# Architecture

## Overview

RoastMyCode is split into two independently deployable services:

```
┌─────────────────────┐        ┌──────────────────────────────┐
│   frontend/          │  HTTP  │   backend/                    │
│   Next.js + Tailwind │ ─────► │   FastAPI                     │
│   (Vercel)            │◄───── │   (Render / Railway / Fly.io) │
└─────────────────────┘        └──────────────┬────────────────┘
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          ▼                     ▼                     ▼
                  GitHub REST API         Groq API (JSON mode)   PostgreSQL / SQLite
```

## Backend layering

```
routers/     → HTTP layer only: parses the request, calls a service, returns a schema
services/    → business logic: GitHub fetch, PDF parsing, Groq calls, DB writes
core/        → cross-cutting concerns: auth, logging, exception handling
models.py    → SQLAlchemy ORM — the database's shape
schemas.py   → Pydantic — the API's public contract (kept separate from models.py
               on purpose: the DB can evolve without breaking API consumers)
prompts.py   → LLM system prompts, isolated so they can be tuned without
               touching application logic
```

### Request flow: `POST /api/v1/roast/github`

1. `routers/github_roast.py` validates the request body (`schemas.GithubRoastRequest`)
2. `services/github_service.py` parses the repo identifier, calls the GitHub
   REST API for metadata, README, languages, file tree, and recent commits
3. `services/llm_service.py` sends that context to Groq with a system prompt
   enforcing JSON output, validates the response against `schemas.RoastLLMOutput`,
   and retries once if the JSON is malformed
4. `services/persistence.py` upserts the user (if a `github_username` was given)
   and saves the roast row
5. The router returns a `schemas.RoastResponse`

### Why Groq

Groq's `llama-3.1-8b-instant` offers a generous free tier (30 requests/min,
14,400/day) with very low latency — important for a roast to feel instant
rather than like a loading spinner.

### Error handling

Custom exceptions live in `core/exceptions.py` (`GithubRateLimitError`,
`RepoNotFoundError`, `LLMGenerationError`, `InvalidResumeError`) and are
mapped to consistent JSON error responses via a global exception handler
registered in `main.py`. An unhandled-exception fallback prevents stack
traces from ever leaking to the client.

## Data model

```
users
├── id (uuid, pk)
├── github_username (unique)
└── created_at

roasts
├── id (uuid, pk)
├── user_id (fk → users.id, nullable)
├── target_type ('repo' | 'resume')
├── target_url_or_name
├── roast_output (text)
├── constructive_blueprint (json list)
├── code_quality_score (0-100)
├── documentation_score (0-100)
├── architecture_score (0-100)
└── created_at
```

`user_id` is nullable because roasting doesn't require an account — the
`github_username` field on each request is just an optional label for
grouping history.

## Scaling path

The MVP calls Groq synchronously inside the request. `app/tasks/celery_app.py`
is a ready-to-wire Celery task that moves this to a background worker once
traffic justifies it — the router would return immediately with a roast ID,
and the client polls `GET /roast/{id}` until it's ready.
