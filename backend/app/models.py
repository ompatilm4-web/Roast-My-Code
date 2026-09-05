"""
ORM models: User + Roast.
UUIDs are stored as strings for cross-database compatibility (SQLite + Postgres).
"""
import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    github_username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    roasts: Mapped[list["Roast"]] = relationship(back_populates="user")


class Roast(Base):
    __tablename__ = "roasts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    target_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'repo' | 'resume'
    target_url_or_name: Mapped[str] = mapped_column(Text, nullable=False)

    roast_output: Mapped[str] = mapped_column(Text, nullable=False)
    constructive_blueprint: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    code_quality_score: Mapped[int] = mapped_column(Integer, nullable=True)
    documentation_score: Mapped[int] = mapped_column(Integer, nullable=True)
    architecture_score: Mapped[int] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User | None"] = relationship(back_populates="roasts")
