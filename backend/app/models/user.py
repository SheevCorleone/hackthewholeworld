from datetime import datetime
from sqlalchemy import DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(
        Enum("student", "curator", "mentor", "admin", name="user_roles"),
        default="student",
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    created_tasks = relationship("Task", back_populates="created_by_user", foreign_keys="Task.created_by")
    mentored_tasks = relationship("Task", back_populates="mentor", foreign_keys="Task.mentor_id")
    assignments = relationship("Assignment", back_populates="student")
    comments = relationship("Comment", back_populates="author")
