from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.repositories import assignment_repo


def request_assignment(db: Session, task_id: int, student_id: int) -> Assignment:
    existing = assignment_repo.find_assignment(db, task_id, student_id)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already requested")
    assignment = Assignment(task_id=task_id, student_id=student_id, state="requested")
    return assignment_repo.create_assignment(db, assignment)


def update_assignment_state(db: Session, assignment: Assignment, state: str) -> Assignment:
    assignment.state = state
    assignment.updated_at = datetime.utcnow()
    return assignment_repo.update_assignment(db, assignment)


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
    return assignment_repo.update_assignment(db, assignment)
