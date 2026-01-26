from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (
        UniqueConstraint("task_id", "student_id", name="uq_task_student"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    state: Mapped[str] = mapped_column(
        Enum("requested", "active", "done", "canceled", name="assignment_state"),
        default="requested",
        index=True,
    )

    decision_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    decided_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    decision_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    task = relationship(
        "Task",
        back_populates="assignments",
    )

    student = relationship(
        "User",
        back_populates="assignments",
        foreign_keys=[student_id],
    )

    decided_by_user = relationship(
        "User",
        back_populates="decided_assignments",
        foreign_keys=[decided_by],
    )
