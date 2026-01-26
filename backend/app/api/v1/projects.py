from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.repositories import task_repo
from app.schemas.assignment import AssignmentRead
from app.schemas.task import TaskRead
from app.services.assignment_service import request_assignment

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[TaskRead])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in {"manager", "admin"}:
        return task_repo.list_tasks(db, 0, 200, None, None, None)
    if current_user.role == "curator":
        return db.query(Task).filter(Task.created_by == current_user.id).all()
    if current_user.role == "mentor":
        return db.query(Task).filter(Task.mentor_id == current_user.id).all()
    return (
        db.query(Task)
        .filter(Task.visibility == "public")
        .filter(Task.status.in_(["open", "in_progress"]))
        .all()
    )


@router.get("/{project_id}", response_model=TaskRead)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_repo.get_task(db, project_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if current_user.role == "student" and task.visibility != "public":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return task


@router.post("/{project_id}/applications", response_model=AssignmentRead)
def apply_to_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student")),
):
    task = task_repo.get_task(db, project_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return request_assignment(db, project_id, current_user.id)
