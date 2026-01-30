from pydantic import BaseModel


class HrStudentSummary(BaseModel):
    id: int
    full_name: str
    email: str
    skills: str | None = None
    completed_projects: int
    average_rating: float | None = None
