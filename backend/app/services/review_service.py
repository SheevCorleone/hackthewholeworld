from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.models.review import Review
from app.repositories import assignment_repo, review_repo
from app.services.audit_service import log_action


def create_review(
    db: Session,
    *,
    assignment: Assignment,
    mentor_id: int,
    rating: int,
    comment: str | None = None,
) -> Review:
    existing = review_repo.get_review_by_assignment(db, assignment.id)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Review already exists")
    review = Review(assignment_id=assignment.id, mentor_id=mentor_id, rating=rating, comment=comment)
    created = review_repo.create_review(db, review)
    assignment.state = "done"
    assignment.updated_at = datetime.utcnow()
    assignment_repo.update_assignment(db, assignment)
    log_action(
        db,
        actor_id=mentor_id,
        action="review_created",
        entity_type="review",
        entity_id=created.id,
        metadata={"assignment_id": assignment.id},
    )
    return created
