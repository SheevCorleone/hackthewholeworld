from sqlalchemy.orm import Session

from app.models.task_mentor import TaskMentor


def add_task_mentor(db: Session, task_id: int, mentor_id: int) -> TaskMentor:
    link = TaskMentor(task_id=task_id, mentor_id=mentor_id)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def remove_task_mentor(db: Session, task_id: int, mentor_id: int) -> None:
    link = db.query(TaskMentor).filter(TaskMentor.task_id == task_id, TaskMentor.mentor_id == mentor_id).first()
    if link:
        db.delete(link)
        db.commit()


def list_task_mentors(db: Session, task_id: int) -> list[TaskMentor]:
    return db.query(TaskMentor).filter(TaskMentor.task_id == task_id).all()
