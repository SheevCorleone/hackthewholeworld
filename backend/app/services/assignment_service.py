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
