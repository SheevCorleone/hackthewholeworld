from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
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
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    curator_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    mentor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    visibility: Mapped[str] = mapped_column(
        Enum("public", "private", name="task_visibility"),
        default="public",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    created_by_user = relationship("User", back_populates="created_tasks", foreign_keys=[created_by])
    curator = relationship("User", foreign_keys=[curator_id])
    mentor = relationship("User", back_populates="mentored_tasks", foreign_keys=[mentor_id])
    mentor_links = relationship("TaskMentor", back_populates="task", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="task")
    comments = relationship("Comment", back_populates="task")

    @property
    def curator_full_name(self) -> str | None:
        return self.curator.full_name if self.curator else None

    @property
    def mentor_full_name(self) -> str | None:
        return self.mentor.full_name if self.mentor else None

    @property
    def mentor_names(self) -> list[str]:
        names = []
        if self.mentor:
            names.append(self.mentor.full_name)
        for link in self.mentor_links or []:
            if link.mentor and link.mentor.full_name not in names:
                names.append(link.mentor.full_name)
        return names
