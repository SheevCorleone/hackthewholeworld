from sqlalchemy.orm import Session

from app.models.comment import Comment


def create_comment(db: Session, comment: Comment) -> Comment:
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_comment(db: Session, comment_id: int) -> Comment | None:
    return db.get(Comment, comment_id)


def list_comments(db: Session, task_id: int, skip: int, limit: int):
    return (
        db.query(Comment)
        .filter(Comment.task_id == task_id, Comment.is_private.is_(False))
        .order_by(Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def list_questions(db: Session, task_id: int, skip: int, limit: int):
    return (
        db.query(Comment)
        .filter(Comment.task_id == task_id)
        .order_by(Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def delete_comment(db: Session, comment: Comment):
    db.delete(comment)
    db.commit()
