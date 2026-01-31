from datetime import datetime
from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10, max_length=4000)
    goal: str | None = Field(default=None, max_length=2000)
    key_tasks: str | None = Field(default=None, max_length=2000)
    novelty: str | None = Field(default=None, max_length=2000)
    skills_required: str | None = Field(default=None, max_length=500)
    course_alignment: str | None = Field(default=None, max_length=255)
    diploma_possible: bool | None = None
    practice_possible: bool | None = None
    course_project_possible: bool | None = None
    nda_required: bool | None = None
    tags: str | None = Field(default=None, max_length=255)
    status: str | None = None
    is_archived: bool | None = None
    curator_id: int | None = None
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
    title: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = Field(default=None, min_length=10, max_length=4000)
    goal: str | None = Field(default=None, max_length=2000)
    key_tasks: str | None = Field(default=None, max_length=2000)
    novelty: str | None = Field(default=None, max_length=2000)
    skills_required: str | None = Field(default=None, max_length=500)
    course_alignment: str | None = Field(default=None, max_length=255)
    diploma_possible: bool | None = None
    practice_possible: bool | None = None
    course_project_possible: bool | None = None
    nda_required: bool | None = None
    tags: str | None = Field(default=None, max_length=255)
    status: str | None = None
    is_archived: bool | None = None
    curator_id: int | None = None
    mentor_id: int | None = None
    deadline: datetime | None = None
    visibility: str | None = None


class TaskRead(TaskBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    curator_full_name: str | None = None
    mentor_full_name: str | None = None
    mentor_names: list[str] | None = None

    class Config:
        from_attributes = True
