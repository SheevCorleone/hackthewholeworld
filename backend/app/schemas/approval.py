from datetime import datetime

from pydantic import BaseModel, Field


class ApprovalCreate(BaseModel):
    task_id: int
    type: str = Field(pattern="^(diploma|practice|course)$")
    comment: str | None = None


class ApprovalUpdate(BaseModel):
    state: str = Field(pattern="^(approved|needs_changes|rejected)$")
    comment: str | None = None


class ApprovalRead(BaseModel):
    id: int
    task_id: int
    type: str
    state: str
    requested_by: int
    reviewer_id: int | None = None
    comment: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
