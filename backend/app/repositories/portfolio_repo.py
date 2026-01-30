from sqlalchemy.orm import Session

from app.models.portfolio_entry import PortfolioEntry


def create_portfolio_entry(db: Session, entry: PortfolioEntry) -> PortfolioEntry:
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_portfolio_entry_by_assignment(db: Session, assignment_id: int) -> PortfolioEntry | None:
    return db.query(PortfolioEntry).filter(PortfolioEntry.assignment_id == assignment_id).first()


def list_portfolio_entries_for_student(db: Session, student_id: int) -> list[PortfolioEntry]:
    return (
        db.query(PortfolioEntry)
        .filter(PortfolioEntry.student_id == student_id)
        .order_by(PortfolioEntry.created_at.desc())
        .all()
    )
