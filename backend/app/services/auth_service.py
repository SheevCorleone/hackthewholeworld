from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models.user import User
from app.repositories import user_repo
from app.services.audit_service import log_action


def register_user(db: Session, email: str, full_name: str, password: str) -> User:
    if user_repo.get_by_email(db, email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(email=email, full_name=full_name, password_hash=get_password_hash(password), role="student")
    created = user_repo.create_user(db, user)
    log_action(db, actor_id=created.id, action="user_registered", entity_type="user", entity_id=created.id)
    return created


def create_user_with_role(
    db: Session,
    *,
    email: str,
    full_name: str,
    password: str,
    role: str,
    faculty: str | None = None,
    skills: str | None = None,
    course: str | None = None,
) -> User:
    if user_repo.get_by_email(db, email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        email=email,
        full_name=full_name,
        password_hash=get_password_hash(password),
        role=role,
        faculty=faculty,
        skills=skills,
        course=course,
    )
    created = user_repo.create_user(db, user)
    log_action(db, actor_id=created.id, action="user_created", entity_type="user", entity_id=created.id)
    return created


def authenticate_user(db: Session, email: str, password: str) -> tuple[str, str]:
    user = user_repo.get_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user.last_active_at = datetime.utcnow()
    db.add(user)
    db.commit()
    log_action(db, actor_id=user.id, action="user_login", entity_type="user", entity_id=user.id)
    access = create_access_token(str(user.id), user.role)
    refresh = create_refresh_token(str(user.id), user.role)
    return access, refresh
