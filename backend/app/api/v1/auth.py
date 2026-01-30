import time
from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenPair
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import authenticate_user, register_user

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])

RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 10
_rate_limit_store: dict[str, list[float]] = {}


def _enforce_rate_limit(request: Request, key: str):
    now = time.time()
    client_host = request.client.host if request and request.client else "unknown"
    bucket_key = f"{key}:{client_host}"
    events = _rate_limit_store.get(bucket_key, [])
    events = [ts for ts in events if now - ts < RATE_LIMIT_WINDOW]
    if len(events) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests")
    events.append(now)
    _rate_limit_store[bucket_key] = events


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    _enforce_rate_limit(request, "register")
    return register_user(db, payload.email, payload.full_name, payload.password)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    _enforce_rate_limit(request, "login")
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
