from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.assignment import Assignment
from app.models.task import Task
from app.models.user import User
from app.repositories import assignment_repo, task_repo, user_repo
from app.schemas.assignment import AssignmentRead
from app.schemas.manager import (
    ApplicationWithStudent,
    ManagerDashboard,
    ManagerUserCreate,
    StudentStats,
    StudentSummary,
    StudentWithStats,
)
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.schemas.user import UserRead
from app.services.assignment_service import decide_assignment
from app.services.auth_service import create_user_with_role
from app.services.task_service import create_task, update_task

router = APIRouter(prefix="/manager", tags=["manager"])


@router.get("/dashboard", response_model=ManagerDashboard)
def manager_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    total_projects = db.query(func.count(Task.id)).scalar() or 0
    active_projects = db.query(func.count(Task.id)).filter(Task.status.in_(["open", "in_progress"])).scalar() or 0
    pending_applications = (
        db.query(func.count(Assignment.id)).filter(Assignment.state == "requested").scalar() or 0
    )
    students = db.query(func.count(User.id)).filter(User.role == "student").scalar() or 0
    mentors = db.query(func.count(User.id)).filter(User.role == "mentor").scalar() or 0
    return ManagerDashboard(
        total_projects=total_projects,
        active_projects=active_projects,
        pending_applications=pending_applications,
        students=students,
        mentors=mentors,
    )


@router.get("/projects", response_model=list[TaskRead])
def list_projects(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    return task_repo.list_tasks(db, skip, limit, None, None, None)


@router.post("/projects", response_model=TaskRead)
def create_project(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("manager", "admin")),
):
    return create_task(db, payload, current_user.id)


@router.get("/projects/{task_id}", response_model=TaskRead)
def get_project(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return task


@router.patch("/projects/{task_id}", response_model=TaskRead)
def update_project(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return update_task(db, task, payload)


@router.get("/projects/{task_id}/applications", response_model=list[ApplicationWithStudent])
def list_project_applications(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    assignments = assignment_repo.list_assignments_for_task(db, task_id)
    result = []
    for assignment in assignments:
        result.append(
            ApplicationWithStudent(
                id=assignment.id,
                task_id=assignment.task_id,
                student_id=assignment.student_id,
                state=assignment.state,
                decision_at=assignment.decision_at,
                decided_by=assignment.decided_by,
                decision_reason=assignment.decision_reason,
                created_at=assignment.created_at,
                updated_at=assignment.updated_at,
                student=assignment.student,
                stats=_student_stats(db, assignment.student_id),
            )
        )
    return result


@router.post("/applications/{assignment_id}/approve", response_model=AssignmentRead)
def approve_application(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("manager", "admin")),
):
    assignment = assignment_repo.get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return decide_assignment(db, assignment, state="active", decided_by=current_user.id)


@router.post("/applications/{assignment_id}/reject", response_model=AssignmentRead)
def reject_application(
    assignment_id: int,
    reason: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("manager", "admin")),
):
    assignment = assignment_repo.get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return decide_assignment(db, assignment, state="canceled", decided_by=current_user.id, reason=reason)


@router.post("/mentors", response_model=UserRead)
def create_mentor(
    payload: ManagerUserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    if payload.role != "mentor":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be mentor")
    return create_user_with_role(db, **payload.model_dump())


@router.post("/curators", response_model=UserRead)
def create_curator(
    payload: ManagerUserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    if payload.role != "curator":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be curator")
    return create_user_with_role(db, **payload.model_dump())


@router.get("/mentors", response_model=list[UserRead])
def list_mentors(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    return user_repo.list_users_by_role(db, "mentor", 0, 200)


@router.get("/students", response_model=list[StudentWithStats])
def list_students(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    students = user_repo.list_users_by_role(db, "student", 0, 200)
    response = []
    for student in students:
        summary = StudentSummary.model_validate(student)
        response.append(StudentWithStats(**summary.model_dump(), stats=_student_stats(db, student.id)))
    return response


@router.get("/students/{student_id}/stats", response_model=StudentStats)
def student_stats(
    student_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    student = db.get(User, student_id)
    if not student or student.role != "student":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return _student_stats(db, student_id)


def _student_stats(db: Session, student_id: int) -> StudentStats:
    total = db.query(func.count(Assignment.id)).filter(Assignment.student_id == student_id).scalar() or 0
    approved = (
        db.query(func.count(Assignment.id))
        .filter(Assignment.student_id == student_id, Assignment.state == "active")
        .scalar()
        or 0
    )
    rejected = (
        db.query(func.count(Assignment.id))
        .filter(Assignment.student_id == student_id, Assignment.state == "canceled")
        .scalar()
        or 0
    )
    completed = (
        db.query(func.count(Assignment.id))
        .filter(Assignment.student_id == student_id, Assignment.state == "done")
        .scalar()
        or 0
    )
    return StudentStats(
        applications_total=total,
        applications_approved=approved,
        applications_rejected=rejected,
        projects_completed=completed,
        reviews_count=0,
        average_rating=None,
    )
