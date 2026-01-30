from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.user import User
from app.repositories import approval_repo
from app.schemas.approval import ApprovalRead, ApprovalUpdate
from app.services.approval_service import update_approval_state

router = APIRouter(prefix="/univ", tags=["univ"])


@router.get("/approvals", response_model=list[ApprovalRead])
def list_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("univ_teacher", "univ_supervisor", "univ_admin")),
):
    return approval_repo.list_approvals(db, 0, 200)


@router.patch("/approvals/{approval_id}", response_model=ApprovalRead)
def update_approval(
    approval_id: int,
    payload: ApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("univ_teacher", "univ_supervisor", "univ_admin")),
):
    approval = approval_repo.get_approval(db, approval_id)
    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval not found")
    return update_approval_state(
        db,
        approval,
        state=payload.state,
        reviewer_id=current_user.id,
        comment=payload.comment,
    )
