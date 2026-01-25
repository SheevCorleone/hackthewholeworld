from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    task_id: int
    body: str = Field(min_length=1, max_length=2000)


class CommentUpdate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class CommentRead(BaseModel):
    id: int
    task_id: int
    author_id: int
    body: str
    created_at: datetime

    class Config:
        from_attributes = True
