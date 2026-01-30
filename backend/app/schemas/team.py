from pydantic import BaseModel


class TeamMemberRead(BaseModel):
    user_id: int
    full_name: str
    email: str | None = None
    role_in_team: str | None = None
    contact_email: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None


class TaskMentorRead(BaseModel):
    id: int
    mentor_id: int
    full_name: str
    email: str
