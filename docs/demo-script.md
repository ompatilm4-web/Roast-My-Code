# Demo Script

A ~3 minute walkthrough for a hackathon judge or interviewer.

## 1. The hook (20s)
"RoastMyCode gives instant, brutally honest — but genuinely useful —
feedback on a GitHub repo or resume. It's built for the moment right
before you submit a project or apply for a job, when you need a second
opinion fast."

## 2. Live demo: GitHub roast (60s)
1. Open the frontend, paste a real repo (ideally the judge's own, if they'll allow it —
   this always lands well).
2. Point out the response comes back in a couple seconds — that's Groq's
   inference speed doing the work.
3. Walk through the three scores (Code Quality, Documentation, Architecture)
   and the constructive blueprint — emphasize this isn't just a joke
   generator, it's paired with actionable next steps every time.

## 3. Live demo: resume roast (30s)
1. Switch tabs, drop in a resume PDF.
2. Show the re-labeled scores (Impact, Clarity, Structure) — same schema,
   different framing, reused prompt architecture.

## 4. Architecture, briefly (60s)
- FastAPI backend, Next.js frontend, deployed independently.
- Point at `docs/architecture.md`'s diagram if screen-sharing.
- Mention the layering: routers stay thin, all logic lives in `services/`,
  which makes it fully unit-testable — pull up `tests/` and mention "22
  tests, all mocked, run in under half a second, no API keys needed in CI."
- Mention the JSON-mode retry logic in `llm_service.py` — a concrete example
  of handling LLM unreliability instead of assuming it always behaves.

## 5. What's next (10s)
"Migrations via Alembic, background processing via Celery for scale, and
GitHub OAuth for real accounts — all scaffolded, not yet wired in, because
[X] was the right scope for this stage."

## Anticipated questions

**"Why Groq instead of OpenAI?"**
Free tier that's actually usable at hackathon scale (30 req/min, 14,400/day),
and the low latency matters for a product where the whole value prop is
feeling instant.

**"How do you handle the LLM not returning valid JSON?"**
`llm_service.py` validates against a Pydantic schema and retries once with
a sharper prompt before failing loudly with a 502 — never silently returns
garbage to the client.

**"What happens if GitHub rate-limits you?"**
Caught explicitly and returned as a clear 502 with guidance to add a
`GITHUB_TOKEN` — not a generic 500.

**"Is this actually deployed anywhere?"**
[Fill in once deployed — Render/Railway for backend, Vercel for frontend.]
