from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.user import User
from app.repositories import user_repo
from app.schemas.user import UserRead, UserUpdateRole

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin", "curator")),
):
    return user_repo.list_users(db, skip, limit)


@router.patch("/{user_id}/role", response_model=UserRead)
def update_role(
    user_id: int,
    payload: UserUpdateRole,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    user = db.get(User, user_id)
    user.role = payload.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
