from datetime import datetime
from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories import task_repo
from app.services.audit_service import log_action


def create_task(db: Session, payload, created_by: int) -> Task:
    task = Task(
        title=payload.title,
        description=payload.description,
        goal=payload.goal,
        key_tasks=payload.key_tasks,
        novelty=payload.novelty,
        skills_required=payload.skills_required,
        course_alignment=payload.course_alignment,
        diploma_possible=bool(payload.diploma_possible),
        practice_possible=bool(payload.practice_possible),
        course_project_possible=bool(payload.course_project_possible),
        nda_required=bool(payload.nda_required),
        tags=payload.tags,
        status=payload.status or "open",
        created_by=created_by,
        mentor_id=payload.mentor_id,
        deadline=payload.deadline,
        visibility=payload.visibility or "public",
    )
    created = task_repo.create_task(db, task)
    log_action(
        db,
        actor_id=created_by,
        action="task_created",
        entity_type="task",
        entity_id=created.id,
    )
    return created


def update_task(db: Session, task: Task, payload) -> Task:
    task.title = payload.title or task.title
    task.description = payload.description or task.description
    task.goal = payload.goal if payload.goal is not None else task.goal
    task.key_tasks = payload.key_tasks if payload.key_tasks is not None else task.key_tasks
    task.novelty = payload.novelty if payload.novelty is not None else task.novelty
    task.skills_required = payload.skills_required if payload.skills_required is not None else task.skills_required
    task.course_alignment = payload.course_alignment if payload.course_alignment is not None else task.course_alignment
    task.diploma_possible = (
        payload.diploma_possible if payload.diploma_possible is not None else task.diploma_possible
    )
    task.practice_possible = (
        payload.practice_possible if payload.practice_possible is not None else task.practice_possible
    )
    task.course_project_possible = (
        payload.course_project_possible
        if payload.course_project_possible is not None
        else task.course_project_possible
    )
    task.nda_required = payload.nda_required if payload.nda_required is not None else task.nda_required
    task.tags = payload.tags or task.tags
    task.status = payload.status or task.status
    task.mentor_id = payload.mentor_id if payload.mentor_id is not None else task.mentor_id
    task.deadline = payload.deadline if payload.deadline is not None else task.deadline
    task.visibility = payload.visibility or task.visibility
    task.updated_at = datetime.utcnow()
    updated = task_repo.update_task(db, task)
    log_action(
        db,
        actor_id=task.created_by,
        action="task_updated",
        entity_type="task",
        entity_id=task.id,
    )
    return updated
