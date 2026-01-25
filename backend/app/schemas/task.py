from datetime import datetime
from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    tags: str | None = None
    status: str | None = None
    mentor_id: int | None = None
    deadline: datetime | None = None
    visibility: str | None = None


class TaskCreate(TaskBase):
    status: str | None = "open"
    visibility: str | None = "public"


class TaskUpdate(TaskBase):
    pass


class TaskRead(TaskBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
