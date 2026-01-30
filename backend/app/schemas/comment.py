from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    task_id: int
    body: str = Field(min_length=1, max_length=2000)
    is_private: bool | None = False
    recipient_id: int | None = None
    meeting_info: str | None = None


class CommentUpdate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)
    is_private: bool | None = None
    recipient_id: int | None = None
    meeting_info: str | None = None


class CommentRead(BaseModel):
    id: int
    task_id: int
    author_id: int
    body: str
    is_private: bool
    recipient_id: int | None = None
    meeting_info: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
