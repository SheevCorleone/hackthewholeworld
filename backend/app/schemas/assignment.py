from datetime import datetime
from pydantic import BaseModel


class AssignmentCreate(BaseModel):
    task_id: int
    nda_accepted: bool | None = False


class AssignmentRequest(BaseModel):
    nda_accepted: bool | None = False


class AssignmentUpdate(BaseModel):
    state: str
    nda_accepted: bool | None = None
    team_role: str | None = None


class AssignmentRead(BaseModel):
    id: int
    task_id: int
    student_id: int
    state: str
    nda_accepted: bool
    team_role: str | None = None
    decision_at: datetime | None = None
    decided_by: int | None = None
    decision_reason: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
