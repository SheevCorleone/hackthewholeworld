from datetime import datetime, timedelta

from app.db.session import SessionLocal
from app.models.assignment import Assignment
from app.models.task import Task
from app.repositories import assignment_repo, task_repo, user_repo
from app.services.auth_service import create_user_with_role
from app.services.approval_service import create_approval


def seed():
    db = SessionLocal()
    try:
        users = {
            "manager": ("manager@sberlab.local", "Manager", "manager"),
            "mentor": ("mentor@sberlab.local", "Mentor", "mentor"),
            "student": ("student@sberlab.local", "Student", "student"),
            "univ_teacher": ("teacher@sberlab.local", "Univ Teacher", "univ_teacher"),
            "hr": ("hr@sberlab.local", "HR", "hr"),
        }
        created = {}
        for role, (email, name, role_name) in users.items():
            existing = user_repo.get_by_email(db, email)
            if existing:
                created[role] = existing
                continue
            created[role] = create_user_with_role(
                db,
                email=email,
                full_name=name,
                password="changeme123",
                role=role_name,
                status="active",
            )

        if not task_repo.list_tasks(db, 0, 1, None, None, None):
            task = Task(
                title="AI ассистент для кампуса",
                description="Разработка прототипа AI-ассистента для сопровождения студенческих проектов.",
                goal="Повысить эффективность коммуникации между студентами и наставниками.",
                key_tasks="Сбор требований, прототип чат-бота, интеграция с трекером задач.",
                novelty="Комбинация образовательной аналитики и generative AI.",
                skills_required="Python, FastAPI, NLP",
                course_alignment="Прикладной AI и инженерия данных",
                diploma_possible=True,
                practice_possible=True,
                course_project_possible=True,
                nda_required=True,
                tags="ai, nlp",
                status="open",
                created_by=created["manager"].id,
                mentor_id=created["mentor"].id,
                deadline=datetime.utcnow() + timedelta(days=60),
                visibility="public",
            )
            task = task_repo.create_task(db, task)
            assignment = Assignment(
                task_id=task.id,
                student_id=created["student"].id,
                state="requested",
                nda_accepted=True,
            )
            assignment_repo.create_assignment(db, assignment)
            create_approval(
                db,
                task_id=task.id,
                approval_type="diploma",
                requested_by=created["student"].id,
                comment="Прошу согласовать тему для диплома.",
            )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
