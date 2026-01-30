from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.user import User
from app.repositories import assignment_repo, review_repo
from app.schemas.review import ReviewCreate, ReviewRead
from app.services.review_service import create_review

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewRead)
def create_review_endpoint(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("mentor", "curator", "manager", "admin")),
):
    assignment = assignment_repo.get_assignment(db, payload.assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if assignment.state != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignment is not active")
    return create_review(
        db,
        assignment=assignment,
        mentor_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )


@router.get("/student/{student_id}", response_model=list[ReviewRead])
def list_reviews_for_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("mentor", "curator", "manager", "admin")),
):
    return review_repo.list_reviews_for_student(db, student_id)


@router.get("/me", response_model=list[ReviewRead])
def list_my_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student")),
):
    return review_repo.list_reviews_for_student(db, current_user.id)
