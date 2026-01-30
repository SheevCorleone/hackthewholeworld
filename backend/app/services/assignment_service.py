from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.models.task import Task
from app.repositories import assignment_repo
from app.services.audit_service import log_action
from app.services.portfolio_service import create_portfolio_entry_for_assignment


def request_assignment(
    db: Session,
    task: Task,
    student_id: int,
    nda_accepted: bool | None = False,
) -> Assignment:
    existing = assignment_repo.find_assignment(db, task.id, student_id)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already requested")
    if task.nda_required and not nda_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NDA agreement is required for this project",
        )
    assignment = Assignment(
        task_id=task.id,
        student_id=student_id,
        state="requested",
        nda_accepted=bool(nda_accepted),
    )
    created = assignment_repo.create_assignment(db, assignment)
    log_action(
        db,
        actor_id=student_id,
        action="assignment_requested",
        entity_type="assignment",
        entity_id=created.id,
        metadata={"task_id": task.id},
    )
    return created


def update_assignment_state(db: Session, assignment: Assignment, state: str) -> Assignment:
    assignment.state = state
    assignment.updated_at = datetime.utcnow()
    updated = assignment_repo.update_assignment(db, assignment)
    if state == "active":
        create_portfolio_entry_for_assignment(
            db,
            assignment,
            summary="Назначен в команду проекта.",
        )
    return updated


def decide_assignment(
    db: Session,
    assignment: Assignment,
    *,
    state: str,
    decided_by: int,
    reason: str | None = None,
) -> Assignment:
    assignment.state = state
    assignment.decision_at = datetime.utcnow()
    assignment.decided_by = decided_by
    assignment.decision_reason = reason
    assignment.updated_at = datetime.utcnow()
    updated = assignment_repo.update_assignment(db, assignment)
    if state == "active":
        create_portfolio_entry_for_assignment(
            db,
            assignment,
            summary="Назначен в команду проекта.",
        )
    log_action(
        db,
        actor_id=decided_by,
        action="assignment_decided",
        entity_type="assignment",
        entity_id=updated.id,
        metadata={"state": state},
    )
    return updated
