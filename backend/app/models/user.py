from datetime import datetime
from sqlalchemy import DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(
        Enum(
            "student",
            "curator",
            "mentor",
            "manager",
            "admin",
            "univ_teacher",
            "univ_supervisor",
            "univ_admin",
            "hr",
            "academic_partnership_admin",
            name="user_roles",
        ),
        default="student",
        index=True,
    )
    status: Mapped[str] = mapped_column(
        Enum("pending", "active", "disabled", name="user_status"),
        default="pending",
        index=True,
    )
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    faculty: Mapped[str | None] = mapped_column(String(255), nullable=True)
    skills: Mapped[str | None] = mapped_column(String(500), nullable=True)
    about: Mapped[str | None] = mapped_column(Text, nullable=True)
    course: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    token_version: Mapped[int] = mapped_column(Integer, default=0)

    created_tasks = relationship(
        "Task",
        back_populates="created_by_user",
        foreign_keys="Task.created_by",
    )

    mentored_tasks = relationship(
        "Task",
        back_populates="mentor",
        foreign_keys="Task.mentor_id",
    )

    assignments = relationship(
        "Assignment",
        back_populates="student",
        foreign_keys="Assignment.student_id",
    )

    decided_assignments = relationship(
        "Assignment",
        back_populates="decided_by_user",
        foreign_keys="Assignment.decided_by",
    )

    comments = relationship(
        "Comment",
        back_populates="author",
        foreign_keys="Comment.author_id",
    )

    skills_list = relationship(
        "UserSkill",
        back_populates="user",
        cascade="all, delete-orphan",
    )
