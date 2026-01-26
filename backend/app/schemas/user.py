from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    faculty: str | None = None
    skills: str | None = None
    course: str | None = None
    avatar_url: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRead(UserBase):
    id: int
    role: str
    created_at: datetime
    last_active_at: datetime | None = None

    class Config:
        from_attributes = True


class UserUpdateRole(BaseModel):
    role: str
