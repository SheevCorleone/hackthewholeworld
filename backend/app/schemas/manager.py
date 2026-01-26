from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class StudentSummary(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    faculty: str | None = None
    skills: str | None = None
    course: str | None = None
    created_at: datetime
    last_active_at: datetime | None = None

    class Config:
        from_attributes = True


class StudentStats(BaseModel):
    applications_total: int
    applications_approved: int
    applications_rejected: int
    projects_completed: int
    reviews_count: int
    average_rating: float | None = None


class StudentWithStats(StudentSummary):
    stats: StudentStats


class ManagerUserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: str
    faculty: str | None = None
    skills: str | None = None
    course: str | None = None


class ManagerDashboard(BaseModel):
    total_projects: int
    active_projects: int
    pending_applications: int
    students: int
    mentors: int


class ApplicationWithStudent(BaseModel):
    id: int
    task_id: int
    student_id: int
    state: str
    decision_at: datetime | None = None
    decided_by: int | None = None
    decision_reason: str | None = None
    created_at: datetime
    updated_at: datetime
    student: StudentSummary
    stats: StudentStats | None = None

    class Config:
        from_attributes = True
