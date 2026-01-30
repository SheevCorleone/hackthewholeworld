from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories import assignment_repo, comment_repo, task_repo
from app.schemas.comment import CommentCreate, CommentRead
from app.services.comment_service import create_comment

router = APIRouter(prefix="/questions", tags=["questions"])


def _can_view_question(current_user: User, question) -> bool:
    if not question.is_private:
        return True
    if question.author_id == current_user.id or question.recipient_id == current_user.id:
        return True
    return current_user.role in {
        "manager",
        "admin",
        "mentor",
        "curator",
        "univ_teacher",
        "univ_supervisor",
        "univ_admin",
        "hr",
        "academic_partnership_admin",
    }


@router.post("", response_model=CommentRead)
def create_question(
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_repo.get_task(db, payload.task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if task.nda_required and current_user.role == "student":
        assignment = assignment_repo.find_assignment(db, task.id, current_user.id)
        if not assignment or not assignment.nda_accepted:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="NDA required for questions")
    return create_comment(
        db,
        payload.task_id,
        current_user.id,
        payload.body,
        is_private=bool(payload.is_private),
        recipient_id=payload.recipient_id,
        meeting_info=payload.meeting_info,
    )


@router.get("", response_model=list[CommentRead])
def list_questions(
    task_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_repo.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if task.nda_required and current_user.role == "student":
        assignment = assignment_repo.find_assignment(db, task.id, current_user.id)
        if not assignment or not assignment.nda_accepted:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="NDA required for questions")
    questions = comment_repo.list_questions(db, task_id, skip, limit)
    return [question for question in questions if _can_view_question(current_user, question)]
