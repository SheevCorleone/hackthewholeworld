from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.comment import Comment
from app.models.user import User
from app.repositories import assignment_repo, comment_repo, task_repo
from app.schemas.comment import CommentCreate, CommentRead, CommentUpdate
from app.services.comment_service import create_comment

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("", response_model=CommentRead)
def create_comment_endpoint(
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
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="NDA required for comments")
    return create_comment(
        db,
        payload.task_id,
        current_user.id,
        payload.body,
        is_private=False,
    )


@router.get("", response_model=list[CommentRead])
def list_comments(
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
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="NDA required for comments")
    return comment_repo.list_comments(db, task_id, skip, limit)


@router.patch("/{comment_id}", response_model=CommentRead)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = comment_repo.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    comment.body = payload.body
    if payload.is_private is not None:
        comment.is_private = payload.is_private
    if payload.recipient_id is not None:
        comment.recipient_id = payload.recipient_id
    if payload.meeting_info is not None:
        comment.meeting_info = payload.meeting_info
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = comment_repo.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    comment_repo.delete_comment(db, comment)
    return {"message": "Comment deleted"}
