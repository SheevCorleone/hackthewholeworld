from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TaskMentor(Base):
    __tablename__ = "task_mentors"
    __table_args__ = (UniqueConstraint("task_id", "mentor_id", name="uq_task_mentor"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), index=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    task = relationship("Task", back_populates="mentor_links")
    mentor = relationship("User")
