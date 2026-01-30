from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.user import User
from app.repositories import portfolio_repo, review_repo
from app.schemas.portfolio import PortfolioEntryRead

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/me", response_model=list[PortfolioEntryRead])
def list_my_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student")),
):
    entries = portfolio_repo.list_portfolio_entries_for_student(db, current_user.id)
    response = []
    for entry in entries:
        review = review_repo.get_review_by_assignment(db, entry.assignment_id)
        response.append(
            PortfolioEntryRead(
                id=entry.id,
                student_id=entry.student_id,
                task_id=entry.task_id,
                assignment_id=entry.assignment_id,
                summary=entry.summary,
                review_rating=review.rating if review else None,
                review_comment=review.comment if review else None,
                created_at=entry.created_at,
            )
        )
    return response
