from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.repositories import comment_repo


def create_comment(db: Session, task_id: int, author_id: int, body: str) -> Comment:
    comment = Comment(task_id=task_id, author_id=author_id, body=body)
    return comment_repo.create_comment(db, comment)
