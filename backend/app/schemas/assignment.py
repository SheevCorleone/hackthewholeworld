from datetime import datetime
from pydantic import BaseModel


class AssignmentCreate(BaseModel):
    task_id: int


class AssignmentUpdate(BaseModel):
    state: str


class AssignmentRead(BaseModel):
    id: int
    task_id: int
    student_id: int
    state: str
    decision_at: datetime | None = None
    decided_by: int | None = None
    decision_reason: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
