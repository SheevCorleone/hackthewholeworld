from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    assignment_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewRead(BaseModel):
    id: int
    assignment_id: int
    mentor_id: int
    rating: int
    comment: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
