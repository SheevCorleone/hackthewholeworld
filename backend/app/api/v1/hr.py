from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.assignment import Assignment
from app.models.review import Review
from app.models.user import User
from app.schemas.hr import HrStudentSummary

router = APIRouter(prefix="/hr", tags=["hr"])


@router.get("/dashboard", response_model=list[HrStudentSummary])
def hr_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("hr", "manager", "admin")),
):
    students = db.query(User).filter(User.role == "student", User.status == "active").all()
    response: list[HrStudentSummary] = []
    for student in students:
        completed = (
            db.query(func.count(Assignment.id))
            .filter(Assignment.student_id == student.id, Assignment.state == "done")
            .scalar()
            or 0
        )
        avg_rating = (
            db.query(func.avg(Review.rating))
            .join(Review.assignment)
            .filter(Review.assignment.has(student_id=student.id))
            .scalar()
        )
        response.append(
            HrStudentSummary(
                id=student.id,
                full_name=student.full_name,
                email=student.email,
                skills=student.skills,
                completed_projects=completed,
                average_rating=float(avg_rating) if avg_rating is not None else None,
            )
        )
    response.sort(key=lambda item: (item.average_rating or 0, item.completed_projects), reverse=True)
    return response
