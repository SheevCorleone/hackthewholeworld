from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.repositories import approval_repo, task_repo
from app.schemas.approval import ApprovalCreate, ApprovalRead
from app.services.approval_service import create_approval

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.post("", response_model=ApprovalRead)
def submit_approval(
    payload: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student")),
):
    task = task_repo.get_task(db, payload.task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return create_approval(
        db,
        task_id=payload.task_id,
        approval_type=payload.type,
        requested_by=current_user.id,
        comment=payload.comment,
    )


@router.get("/me", response_model=list[ApprovalRead])
def list_my_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return approval_repo.list_approvals_by_student(db, current_user.id)
