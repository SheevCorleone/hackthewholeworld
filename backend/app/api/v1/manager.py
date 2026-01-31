from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.assignment import Assignment
from app.models.review import Review
from app.models.task import Task
from app.models.user import User
from app.repositories import assignment_repo, task_mentor_repo, task_repo, user_repo
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
from app.schemas.team import TaskMentorRead
from app.schemas.user import UserRead
from app.services.assignment_service import decide_assignment
from app.services.audit_service import log_action
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
    students = (
        db.query(func.count(User.id))
        .filter(User.role == "student", User.status == "active")
        .scalar()
        or 0
    )
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
    return create_task(db, payload, current_user.id, current_user.role)


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


@router.post("/projects/{task_id}/archive", response_model=TaskRead)
def archive_project(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return update_task(db, task, TaskUpdate(status="closed", is_archived=True))


@router.post("/projects/{task_id}/unarchive", response_model=TaskRead)
def unarchive_project(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return update_task(db, task, TaskUpdate(status="open", is_archived=False))


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
                team_role=assignment.team_role,
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
    updated = decide_assignment(db, assignment, state="active", decided_by=current_user.id)
    log_action(
        db,
        actor_id=current_user.id,
        action="assignment_approved",
        entity_type="assignment",
        entity_id=updated.id,
    )
    return updated


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
    updated = decide_assignment(db, assignment, state="canceled", decided_by=current_user.id, reason=reason)
    log_action(
        db,
        actor_id=current_user.id,
        action="assignment_rejected",
        entity_type="assignment",
        entity_id=updated.id,
    )
    return updated


@router.patch("/applications/{assignment_id}/role", response_model=AssignmentRead)
def update_application_role(
    assignment_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("manager", "admin")),
):
    assignment = assignment_repo.get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    assignment.team_role = role
    assignment.decided_by = current_user.id
    assignment.updated_at = datetime.utcnow()
    return assignment_repo.update_assignment(db, assignment)


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
    return (
        db.query(User)
        .filter(User.role == "mentor", User.status == "active", User.is_deleted.is_(False))
        .all()
    )


@router.get("/curators", response_model=list[UserRead])
def list_curators(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    return (
        db.query(User)
        .filter(User.role == "curator", User.status == "active", User.is_deleted.is_(False))
        .all()
    )


@router.get("/projects/{task_id}/mentors", response_model=list[TaskMentorRead])
def list_task_mentors(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    links = task_mentor_repo.list_task_mentors(db, task_id)
    result = []
    for link in links:
        result.append(
            TaskMentorRead(
                id=link.id,
                mentor_id=link.mentor_id,
                full_name=link.mentor.full_name,
                email=link.mentor.email,
            )
        )
    return result


@router.post("/projects/{task_id}/mentors", response_model=TaskMentorRead)
def add_task_mentor(
    task_id: int,
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    mentor = db.get(User, mentor_id)
    if not mentor or mentor.role != "mentor":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mentor not found")
    link = task_mentor_repo.add_task_mentor(db, task_id, mentor_id)
    return TaskMentorRead(
        id=link.id,
        mentor_id=link.mentor_id,
        full_name=link.mentor.full_name,
        email=link.mentor.email,
    )


@router.delete("/projects/{task_id}/mentors/{mentor_id}")
def remove_task_mentor(
    task_id: int,
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    task_mentor_repo.remove_task_mentor(db, task_id, mentor_id)
    return {"message": "Mentor removed"}


@router.delete("/mentors/{mentor_id}", response_model=UserRead)
def delete_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    mentor = db.get(User, mentor_id)
    if not mentor or mentor.role != "mentor" or mentor.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")
    mentor.status = "disabled"
    mentor.is_deleted = True
    mentor.token_version = (mentor.token_version or 0) + 1
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor


@router.delete("/curators/{curator_id}", response_model=UserRead)
def delete_curator(
    curator_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    curator = db.get(User, curator_id)
    if not curator or curator.role != "curator" or curator.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curator not found")
    curator.status = "disabled"
    curator.is_deleted = True
    curator.token_version = (curator.token_version or 0) + 1
    db.add(curator)
    db.commit()
    db.refresh(curator)
    return curator


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


@router.get("/students/pending", response_model=list[StudentSummary])
def list_pending_students(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("manager", "admin")),
):
    return db.query(User).filter(User.role == "student", User.status == "pending").all()


@router.post("/students/{student_id}/approve", response_model=UserRead)
def approve_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("manager", "admin")),
):
    student = db.get(User, student_id)
    if not student or student.role != "student":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    student.status = "active"
    db.add(student)
    db.commit()
    db.refresh(student)
    log_action(
        db,
        actor_id=current_user.id,
        action="student_approved",
        entity_type="user",
        entity_id=student_id,
    )
    return student


@router.post("/students/{student_id}/reject", response_model=UserRead)
def reject_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("manager", "admin")),
):
    student = db.get(User, student_id)
    if not student or student.role != "student":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    student.status = "disabled"
    db.add(student)
    db.commit()
    db.refresh(student)
    log_action(
        db,
        actor_id=current_user.id,
        action="student_rejected",
        entity_type="user",
        entity_id=student_id,
    )
    return student


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
    review_count = (
        db.query(func.count(Review.id))
        .join(Review.assignment)
        .filter(Review.assignment.has(student_id=student_id))
        .scalar()
        or 0
    )
    average_rating = (
        db.query(func.avg(Review.rating))
        .join(Review.assignment)
        .filter(Review.assignment.has(student_id=student_id))
        .scalar()
    )
    return StudentStats(
        applications_total=total,
        applications_approved=approved,
        applications_rejected=rejected,
        projects_completed=completed,
        reviews_count=review_count,
        average_rating=float(average_rating) if average_rating is not None else None,
    )
