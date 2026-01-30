from datetime import datetime
from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    goal: str | None = None
    key_tasks: str | None = None
    novelty: str | None = None
    skills_required: str | None = None
    course_alignment: str | None = None
    diploma_possible: bool | None = None
    practice_possible: bool | None = None
    course_project_possible: bool | None = None
    nda_required: bool | None = None
    tags: str | None = None
    status: str | None = None
    mentor_id: int | None = None
    deadline: datetime | None = None
    visibility: str | None = None


class TaskCreate(TaskBase):
    status: str | None = "open"
    visibility: str | None = "public"
    diploma_possible: bool | None = False
    practice_possible: bool | None = False
    course_project_possible: bool | None = False
    nda_required: bool | None = False


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    goal: str | None = None
    key_tasks: str | None = None
    novelty: str | None = None
    skills_required: str | None = None
    course_alignment: str | None = None
    diploma_possible: bool | None = None
    practice_possible: bool | None = None
    course_project_possible: bool | None = None
    nda_required: bool | None = None
    tags: str | None = None
    status: str | None = None
    mentor_id: int | None = None
    deadline: datetime | None = None
    visibility: str | None = None


class TaskRead(TaskBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
