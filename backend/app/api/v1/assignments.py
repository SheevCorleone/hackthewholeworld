from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.assignment import Assignment
from app.models.user import User
from app.repositories import assignment_repo, task_repo
from app.schemas.assignment import AssignmentCreate, AssignmentRead, AssignmentUpdate
from app.services.assignment_service import request_assignment, update_assignment_state

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.post("", response_model=AssignmentRead)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student", "curator", "mentor", "manager", "admin")),
):
    task = task_repo.get_task(db, payload.task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return request_assignment(db, task, current_user.id, payload.nda_accepted)


@router.get("/me", response_model=list[AssignmentRead])
def list_my_assignments(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student", "curator", "mentor", "manager", "admin")),
):
    return assignment_repo.list_assignments_for_student(db, current_user.id, skip, limit)


@router.patch("/{assignment_id}", response_model=AssignmentRead)
def update_assignment(
    assignment_id: int,
    payload: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = assignment_repo.get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if current_user.role not in {"curator", "mentor", "manager", "admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return update_assignment_state(db, assignment, payload.state)
