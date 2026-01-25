from datetime import datetime
from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories import task_repo


def create_task(db: Session, payload, created_by: int) -> Task:
    task = Task(
        title=payload.title,
        description=payload.description,
        tags=payload.tags,
        status=payload.status or "open",
        created_by=created_by,
        mentor_id=payload.mentor_id,
        deadline=payload.deadline,
        visibility=payload.visibility or "public",
    )
    return task_repo.create_task(db, task)


def update_task(db: Session, task: Task, payload) -> Task:
    task.title = payload.title or task.title
    task.description = payload.description or task.description
    task.tags = payload.tags or task.tags
    task.status = payload.status or task.status
    task.mentor_id = payload.mentor_id if payload.mentor_id is not None else task.mentor_id
    task.deadline = payload.deadline if payload.deadline is not None else task.deadline
    task.visibility = payload.visibility or task.visibility
    task.updated_at = datetime.utcnow()
    return task_repo.update_task(db, task)
