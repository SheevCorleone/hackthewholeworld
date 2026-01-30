from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text)
    goal: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_tasks: Mapped[str | None] = mapped_column(Text, nullable=True)
    novelty: Mapped[str | None] = mapped_column(Text, nullable=True)
    skills_required: Mapped[str | None] = mapped_column(String(500), nullable=True)
    course_alignment: Mapped[str | None] = mapped_column(String(255), nullable=True)
    diploma_possible: Mapped[bool] = mapped_column(default=False)
    practice_possible: Mapped[bool] = mapped_column(default=False)
    course_project_possible: Mapped[bool] = mapped_column(default=False)
    nda_required: Mapped[bool] = mapped_column(default=False)
    tags: Mapped[str | None] = mapped_column(String(255), index=True)
    status: Mapped[str] = mapped_column(
        Enum("open", "in_progress", "completed", "closed", name="task_status"),
        default="open",
        index=True,
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    mentor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    visibility: Mapped[str] = mapped_column(
        Enum("public", "private", name="task_visibility"),
        default="public",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    created_by_user = relationship("User", back_populates="created_tasks", foreign_keys=[created_by])
    mentor = relationship("User", back_populates="mentored_tasks", foreign_keys=[mentor_id])
    assignments = relationship("Assignment", back_populates="task")
    comments = relationship("Comment", back_populates="task")
