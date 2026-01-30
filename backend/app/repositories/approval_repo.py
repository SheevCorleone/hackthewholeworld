from sqlalchemy.orm import Session

from app.models.approval import Approval


def create_approval(db: Session, approval: Approval) -> Approval:
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return approval


def update_approval(db: Session, approval: Approval) -> Approval:
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return approval


def get_approval(db: Session, approval_id: int) -> Approval | None:
    return db.get(Approval, approval_id)


def list_approvals(db: Session, skip: int, limit: int) -> list[Approval]:
    return db.query(Approval).order_by(Approval.created_at.desc()).offset(skip).limit(limit).all()


def list_approvals_by_student(db: Session, student_id: int) -> list[Approval]:
    return (
        db.query(Approval)
        .filter(Approval.requested_by == student_id)
        .order_by(Approval.created_at.desc())
        .all()
    )


def list_approvals_by_reviewer(db: Session, reviewer_id: int) -> list[Approval]:
    return (
        db.query(Approval)
        .filter(Approval.reviewer_id == reviewer_id)
        .order_by(Approval.created_at.desc())
        .all()
    )
