from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    faculty: str | None = None
    skills: str | None = None
    about: str | None = None
    course: str | None = None
    avatar_url: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRead(UserBase):
    id: int
    role: str
    status: str
    created_at: datetime
    last_active_at: datetime | None = None

    class Config:
        from_attributes = True


class UserUpdateRole(BaseModel):
    role: str


class UserProfileRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    avatar_url: str | None = None
    faculty: str | None = None
    course: str | None = None
    skills: str | None = None
    about: str | None = None
    created_at: datetime
    last_active_at: datetime | None = None

    class Config:
        from_attributes = True


class StudentProfileRead(UserProfileRead):
    status: str
    linkedin_url: str | None = None
    github_url: str | None = None


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=500)
    faculty: str | None = Field(default=None, max_length=255)
    course: str | None = Field(default=None, max_length=255)
    skills: str | None = Field(default=None, max_length=500)
    about: str | None = Field(default=None, max_length=2000)
