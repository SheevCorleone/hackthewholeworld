from sqlalchemy.orm import Session

from app.models.review import Review


def create_review(db: Session, review: Review) -> Review:
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_review_by_assignment(db: Session, assignment_id: int) -> Review | None:
    return db.query(Review).filter(Review.assignment_id == assignment_id).first()


def list_reviews_for_student(db: Session, student_id: int) -> list[Review]:
    return (
        db.query(Review)
        .join(Review.assignment)
        .filter(Review.assignment.has(student_id=student_id))
        .order_by(Review.created_at.desc())
        .all()
    )


def list_reviews_for_task(db: Session, task_id: int) -> list[Review]:
    return (
        db.query(Review)
        .join(Review.assignment)
        .filter(Review.assignment.has(task_id=task_id))
        .order_by(Review.created_at.desc())
        .all()
    )
