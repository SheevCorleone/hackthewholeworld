from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.repositories import comment_repo


def create_comment(
    db: Session,
    task_id: int,
    author_id: int,
    body: str,
    *,
    is_private: bool = False,
    recipient_id: int | None = None,
    meeting_info: str | None = None,
) -> Comment:
    comment = Comment(
        task_id=task_id,
        author_id=author_id,
        body=body,
        is_private=is_private,
        recipient_id=recipient_id,
        meeting_info=meeting_info,
    )
    return comment_repo.create_comment(db, comment)
