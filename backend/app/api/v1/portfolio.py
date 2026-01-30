from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.user import User
from app.repositories import portfolio_repo
from app.schemas.portfolio import PortfolioEntryRead

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/me", response_model=list[PortfolioEntryRead])
def list_my_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student")),
):
    return portfolio_repo.list_portfolio_entries_for_student(db, current_user.id)
