"""
SQLAlchemy engine + session setup and initial database seed.
Works out of the box with SQLite for local dev and Postgres in production
just by changing DATABASE_URL.
"""
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import get_settings

settings = get_settings()

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def seed_demo_data(db) -> None:
    from app import models
    from app.core.security import hash_password

    # Check if any users exist
    if db.query(models.User).count() > 0:
        return

    # Create demo user
    demo_user = models.User(
        username="demodev",
        email="demo@roastmycode.dev",
        hashed_password=hash_password("password123"),
        full_name="Alex Rivera",
        github_username="octocat",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    now = datetime.utcnow()

    samples = [
        models.Roast(
            user_id=demo_user.id,
            target_type="snippet",
            target_url_or_name="legacy_auth_checker.ts",
            code_snippet="""// Critical Production Auth\nfunction verifyAccess(token: any, role: any) {\n  var secret = "supersecret123";\n  if (role == "admin" || token.includes("boss")) {\n    return true;\n  }\n  return eval("token.isValid") == true;\n}""",
            roast_output="I looked at this auth function and my firewall filed a restraining order. You're verifying admin privileges by checking if the string includes 'boss', and running eval() on user input like security was an optional DLC.",
            constructive_blueprint=[
                "Purge eval() immediately and decode JWTs using standard crypto verification libraries with RSA/ECDSA keys.",
                "Enforce Role-Based Access Control (RBAC) via typed claims rather than heuristic string matching.",
                "Replace legacy 'var' declarations with block-scoped 'const' and strict TypeScript types.",
            ],
            code_quality_score=28,
            documentation_score=35,
            architecture_score=22,
            language="TypeScript",
            tone="senior_dev",
            is_public=True,
            created_at=now - timedelta(hours=2),
        ),
        models.Roast(
            user_id=demo_user.id,
            target_type="repo",
            target_url_or_name="facebook/react-chaos-todo",
            roast_output="You managed to build a simple Todo app using 14 layers of Redux middleware, 6 custom hooks, and 48 npm packages. Even the browser needs a minute of meditation before rendering the checkbox.",
            constructive_blueprint=[
                "Eliminate state management sprawl; adopt React Server Components or lightweight Zustand/Signals.",
                "Add automated unit and regression testing with Vitest and Playwright.",
                "Audit bundle size with @next/bundle-analyzer and prune unused heavy transitive dependencies.",
            ],
            code_quality_score=62,
            documentation_score=50,
            architecture_score=44,
            language="JavaScript",
            tone="senior_dev",
            is_public=True,
            created_at=now - timedelta(hours=5),
        ),
        models.Roast(
            user_id=None,
            target_type="resume",
            target_url_or_name="Senior_FullStack_Ninja.pdf",
            roast_output="This resume contains more buzzwords per square inch than a venture capital pitch deck. 'Spearheaded agile paradigm synergy' sounds impressive until the hiring manager notices zero quantifiable revenue, speed, or dollar impact.",
            constructive_blueprint=[
                "Apply Google XYZ formatting: 'Cut API latency by 45% (from 800ms to 440ms) by introducing Redis caching'.",
                "Cut buzzwords like 'rockstar', 'guru', and 'ninja' — tech leads look for pragmatic engineering maturity.",
                "Link directly to high-quality GitHub repositories and production deployments.",
            ],
            code_quality_score=42,
            documentation_score=68,
            architecture_score=48,
            language="PDF",
            tone="recruiter",
            is_public=True,
            created_at=now - timedelta(hours=14),
        ),
        models.Roast(
            user_id=demo_user.id,
            target_type="snippet",
            target_url_or_name="matrix_multiplication.py",
            code_snippet="""def solve(n):\n    data = []\n    for i in range(len(n)):\n        for j in range(len(n)):\n            for k in range(len(n)):\n                data.append(n[i] * n[j] + n[k])\n    return data""",
            roast_output="Congratulations on discovering O(n³) loop nesting that will melt the cloud server the moment your input exceeds 100 rows. The variable names 'data', 'n', 'i', 'j', 'k' read like a math worksheet found in a dumpster.",
            constructive_blueprint=[
                "Replace manual nested iterations with vectorized NumPy matrix operations running in C/BLAS.",
                "Use domain-expressive variable identifiers instead of cryptic single-letter names.",
                "Benchmark runtime complexity with pytest-benchmark before shipping to production.",
            ],
            code_quality_score=35,
            documentation_score=20,
            architecture_score=31,
            language="Python",
            tone="senior_dev",
            is_public=True,
            created_at=now - timedelta(days=1),
        ),
    ]

    for s in samples:
        db.add(s)
    db.commit()


def init_db() -> None:
    """Create tables if they don't exist and seed initial demo data."""
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
