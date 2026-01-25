from sqlalchemy.orm import Session

from app.models.user import User


def get_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def list_users(db: Session, skip: int, limit: int):
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
