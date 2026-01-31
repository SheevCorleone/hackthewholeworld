from sqlalchemy.orm import Session

from app.models.user import User


def get_by_email(db: Session, email: str, include_deleted: bool = False) -> User | None:
    query = db.query(User).filter(User.email == email)
    if not include_deleted:
        query = query.filter(User.is_deleted.is_(False))
    return query.first()


def list_users(db: Session, skip: int, limit: int):
    return db.query(User).filter(User.is_deleted.is_(False)).offset(skip).limit(limit).all()


def list_users_by_role(db: Session, role: str, skip: int, limit: int):
    return (
        db.query(User)
        .filter(User.role == role, User.is_deleted.is_(False))
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_user(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
