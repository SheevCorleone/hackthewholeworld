from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.repositories import task_repo
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services.task_service import create_task, update_task

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskRead)
def create_task_endpoint(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("curator", "manager", "admin")),
):
    return create_task(db, payload, current_user.id)


@router.get("", response_model=list[TaskRead])
def list_tasks(
    skip: int = 0,
    limit: int = 20,
    status_filter: str | None = None,
    tag: str | None = None,
    query: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return task_repo.list_tasks(db, skip, limit, status_filter, tag, query)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task_endpoint(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("curator", "manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return update_task(db, task, payload)


@router.delete("/{task_id}")
def delete_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("curator", "manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    task_repo.delete_task(db, task)
    return {"message": "Task deleted"}
