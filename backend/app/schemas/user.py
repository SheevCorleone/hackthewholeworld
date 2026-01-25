from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRead(UserBase):
    id: int
    role: str
    avatar_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRole(BaseModel):
    role: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
