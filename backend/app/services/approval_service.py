from datetime import datetime
from sqlalchemy.orm import Session

from app.models.approval import Approval
from app.repositories import approval_repo
from app.services.audit_service import log_action


def create_approval(
    db: Session,
    *,
    task_id: int,
    approval_type: str,
    requested_by: int,
    comment: str | None = None,
) -> Approval:
    approval = Approval(
        task_id=task_id,
        type=approval_type,
        state="submitted",
        requested_by=requested_by,
        comment=comment,
    )
    created = approval_repo.create_approval(db, approval)
    log_action(
        db,
        actor_id=requested_by,
        action="approval_submitted",
        entity_type="approval",
        entity_id=created.id,
        metadata={"task_id": task_id, "type": approval_type},
    )
    return created


def update_approval_state(
    db: Session,
    approval: Approval,
    *,
    state: str,
    reviewer_id: int,
    comment: str | None = None,
) -> Approval:
    approval.state = state
    approval.reviewer_id = reviewer_id
    approval.comment = comment
    approval.updated_at = datetime.utcnow()
    updated = approval_repo.update_approval(db, approval)
    log_action(
        db,
        actor_id=reviewer_id,
        action="approval_updated",
        entity_type="approval",
        entity_id=updated.id,
        metadata={"state": state},
    )
    return updated
