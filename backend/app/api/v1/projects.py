from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.repositories import assignment_repo, task_repo
from app.schemas.assignment import AssignmentRead, AssignmentRequest
from app.schemas.task import TaskRead
from app.schemas.team import TeamMemberRead
from app.services.assignment_service import request_assignment

router = APIRouter(prefix="/projects", tags=["projects"])


def _can_view_contacts(current_user: User, task: Task, db: Session) -> bool:
    if current_user.role in {"manager", "admin", "mentor", "curator"}:
        return True
    if current_user.role != "student":
        return True
    assignment = assignment_repo.find_assignment(db, task.id, current_user.id)
    if not assignment or assignment.state not in {"active", "done"}:
        return False
    if task.nda_required and not assignment.nda_accepted:
        return False
    return True


@router.get("", response_model=list[TaskRead])
def list_projects(
    skip: int = 0,
    limit: int = 20,
    status_filter: str | None = None,
    tag: str | None = None,
    query: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in {"manager", "admin", "hr", "academic_partnership_admin"}:
        return task_repo.list_tasks(db, skip, limit, status_filter, tag, query)
    if current_user.role in {"univ_teacher", "univ_supervisor", "univ_admin"}:
        return task_repo.list_tasks(db, skip, limit, status_filter, tag, query)
    if current_user.role == "curator":
        return (
            db.query(Task)
            .filter(Task.created_by == current_user.id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    if current_user.role == "mentor":
        return (
            db.query(Task)
            .filter(Task.mentor_id == current_user.id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    return (
        db.query(Task)
        .filter(Task.visibility == "public")
        .filter(Task.status.in_(["open", "in_progress"]))
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{project_id}", response_model=TaskRead)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_repo.get_task(db, project_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if current_user.role == "student" and task.visibility != "public":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    if current_user.role == "student" and task.nda_required:
        assignment = assignment_repo.find_assignment(db, task.id, current_user.id)
        if not assignment or not assignment.nda_accepted:
            task.description = "Доступно после подтверждения NDA"
            task.goal = None
            task.key_tasks = None
            task.novelty = None
            task.skills_required = None
            task.course_alignment = None
    return task


@router.post("/{project_id}/applications", response_model=AssignmentRead)
def apply_to_project(
    project_id: int,
    payload: AssignmentRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student")),
):
    task = task_repo.get_task(db, project_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    nda_accepted = payload.nda_accepted if payload else False
    return request_assignment(db, task, current_user.id, nda_accepted)


@router.get("/{project_id}/team", response_model=list[TeamMemberRead])
def list_project_team(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_repo.get_task(db, project_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    can_view_contacts = _can_view_contacts(current_user, task, db)
    assignments = assignment_repo.list_assignments_for_task(db, project_id)
    team = []
    for assignment in assignments:
        if assignment.state not in {"active", "done"}:
            continue
        student = assignment.student
        team.append(
            TeamMemberRead(
                user_id=student.id,
                full_name=student.full_name,
                email=student.email if can_view_contacts else None,
                role_in_team=assignment.team_role,
                contact_email=student.email if can_view_contacts else None,
                linkedin_url=student.linkedin_url if can_view_contacts else None,
                github_url=student.github_url if can_view_contacts else None,
            )
        )
    return team
