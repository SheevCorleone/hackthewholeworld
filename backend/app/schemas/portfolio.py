from datetime import datetime

from pydantic import BaseModel


class PortfolioEntryRead(BaseModel):
    id: int
    student_id: int
    task_id: int
    assignment_id: int
    summary: str | None = None
    review_rating: int | None = None
    review_comment: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
