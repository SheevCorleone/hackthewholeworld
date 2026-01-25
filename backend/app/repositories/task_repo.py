from sqlalchemy.orm import Session

from app.models.task import Task


def create_task(db: Session, task: Task) -> Task:
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, task_id: int) -> Task | None:
    return db.get(Task, task_id)


def list_tasks(db: Session, skip: int, limit: int, status: str | None, tag: str | None, query: str | None):
    q = db.query(Task)
    if status:
        q = q.filter(Task.status == status)
    if tag:
        q = q.filter(Task.tags.ilike(f"%{tag}%"))
    if query:
        q = q.filter(Task.title.ilike(f"%{query}%"))
    return q.offset(skip).limit(limit).all()


def update_task(db: Session, task: Task) -> Task:
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task):
    db.delete(task)
    db.commit()
