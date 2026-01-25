from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def create_refresh_token(subject: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.refresh_token_expire_minutes)
    to_encode = {"exp": expire, "sub": str(subject), "role": role, "type": "refresh"}
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
