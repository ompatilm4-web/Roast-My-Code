"""
ORM models: User + Roast.
UUIDs are stored as strings for cross-database compatibility (SQLite + Postgres).
"""
import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    github_username: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    custom_api_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    roasts: Mapped[list["Roast"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Roast(Base):
    __tablename__ = "roasts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    target_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'repo' | 'resume' | 'snippet'
    target_url_or_name: Mapped[str] = mapped_column(Text, nullable=False)
    code_snippet: Mapped[str | None] = mapped_column(Text, nullable=True)

    roast_output: Mapped[str] = mapped_column(Text, nullable=False)
    constructive_blueprint: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    code_quality_score: Mapped[int] = mapped_column(Integer, nullable=True)
    documentation_score: Mapped[int] = mapped_column(Integer, nullable=True)
    architecture_score: Mapped[int] = mapped_column(Integer, nullable=True)

    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    tone: Mapped[str | None] = mapped_column(String(50), nullable=True, default="senior_dev")
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User | None"] = relationship(back_populates="roasts")
