from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.repositories import user_repo
from app.schemas.user import StudentProfileRead, UserProfileRead, UserProfileUpdate, UserRead, UserUpdateRole

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin", "curator")),
):
    return user_repo.list_users(db, skip, limit)


@router.patch("/{user_id}/role", response_model=UserRead)
def update_role(
    user_id: int,
    payload: UserUpdateRole,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    user = db.get(User, user_id)
    user.role = payload.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserProfileRead)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserProfileRead)
def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=StudentProfileRead)
def get_student_profile(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    user = db.get(User, user_id)
    if not user or user.role != "student":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return user
