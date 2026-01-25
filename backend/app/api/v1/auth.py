from fastapi import APIRouter, Body, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenPair
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import authenticate_user, register_user

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, payload.email, payload.full_name, payload.password)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    access, refresh = authenticate_user(db, payload.email, payload.password)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPair)
def refresh(token: str = Body(..., embed=True)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    access = create_access_token(payload["sub"], payload["role"])
    refresh_token = create_refresh_token(payload["sub"], payload["role"])
    return TokenPair(access_token=access, refresh_token=refresh_token)


@router.post("/logout")
def logout():
    return {"message": "Logged out"}


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)):
    return current_user
