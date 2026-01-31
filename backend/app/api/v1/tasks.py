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
    return create_task(db, payload, current_user.id, current_user.role)


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
    current_user: User = Depends(require_roles("curator", "manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current_user.role == "curator" and task.curator_id not in {current_user.id, None}:
        if task.created_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
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


@router.post("/{task_id}/archive", response_model=TaskRead)
def archive_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("curator", "manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current_user.role == "curator" and task.curator_id not in {current_user.id, None}:
        if task.created_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return update_task(db, task, TaskUpdate(status="closed", is_archived=True))


@router.post("/{task_id}/unarchive", response_model=TaskRead)
def unarchive_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("curator", "manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current_user.role == "curator" and task.curator_id not in {current_user.id, None}:
        if task.created_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return update_task(db, task, TaskUpdate(status="open", is_archived=False))
