from sqlalchemy.orm import Session, joinedload

from app.models.assignment import Assignment


def create_assignment(db: Session, assignment: Assignment) -> Assignment:
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def get_assignment(db: Session, assignment_id: int) -> Assignment | None:
    return db.get(Assignment, assignment_id)


def find_assignment(db: Session, task_id: int, student_id: int) -> Assignment | None:
    return (
        db.query(Assignment)
        .filter(Assignment.task_id == task_id, Assignment.student_id == student_id)
        .first()
    )


def list_assignments_for_student(db: Session, student_id: int, skip: int, limit: int):
    return (
        db.query(Assignment)
        .options(joinedload(Assignment.task))
        .filter(Assignment.student_id == student_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def list_assignments_for_task(db: Session, task_id: int):
    return db.query(Assignment).filter(Assignment.task_id == task_id).all()


def update_assignment(db: Session, assignment: Assignment) -> Assignment:
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment
