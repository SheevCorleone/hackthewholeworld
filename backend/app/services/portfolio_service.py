from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.models.portfolio_entry import PortfolioEntry
from app.repositories import portfolio_repo


def create_portfolio_entry_for_assignment(
    db: Session,
    assignment: Assignment,
    summary: str | None = None,
) -> PortfolioEntry:
    existing = portfolio_repo.get_portfolio_entry_by_assignment(db, assignment.id)
    if existing:
        return existing
    entry = PortfolioEntry(
        student_id=assignment.student_id,
        task_id=assignment.task_id,
        assignment_id=assignment.id,
        summary=summary,
    )
    return portfolio_repo.create_portfolio_entry(db, entry)
