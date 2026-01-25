from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.repositories import user_repo
from app.schemas.user import UserRead, UserUpdate, UserUpdateRole

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "curator", "tech_admin")),
):
    return user_repo.list_users(db, skip, limit)


@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.full_name:
        current_user.full_name = payload.full_name
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/{user_id}/role", response_model=UserRead)
def update_role(
    user_id: int,
    payload: UserUpdateRole,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "tech_admin")),
):
    user = db.get(User, user_id)
    user.role = payload.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
