"""initial

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("student", "curator", "mentor", "admin", name="user_roles"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"], unique=False)

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("tags", sa.String(length=255)),
        sa.Column("status", sa.Enum("open", "in_progress", "completed", "closed", name="task_status"), nullable=False),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("mentor_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("deadline", sa.DateTime(), nullable=True),
        sa.Column("visibility", sa.Enum("public", "private", name="task_visibility"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_tasks_title", "tasks", ["title"], unique=False)
    op.create_index("ix_tasks_status", "tasks", ["status"], unique=False)
    op.create_index("ix_tasks_tags", "tasks", ["tags"], unique=False)
    op.create_index("ix_tasks_created_by", "tasks", ["created_by"], unique=False)
    op.create_index("ix_tasks_mentor_id", "tasks", ["mentor_id"], unique=False)

    op.create_table(
        "assignments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("tasks.id"), nullable=False),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("state", sa.Enum("requested", "active", "done", "canceled", name="assignment_state"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("task_id", "student_id", name="uq_task_student"),
    )
    op.create_index("ix_assignments_task_id", "assignments", ["task_id"], unique=False)
    op.create_index("ix_assignments_student_id", "assignments", ["student_id"], unique=False)
    op.create_index("ix_assignments_state", "assignments", ["state"], unique=False)

    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("tasks.id"), nullable=False),
        sa.Column("author_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_comments_task_id", "comments", ["task_id"], unique=False)
    op.create_index("ix_comments_author_id", "comments", ["author_id"], unique=False)


def downgrade():
    op.drop_table("comments")
    op.drop_table("assignments")
    op.drop_table("tasks")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS assignment_state")
    op.execute("DROP TYPE IF EXISTS task_visibility")
    op.execute("DROP TYPE IF EXISTS task_status")
    op.execute("DROP TYPE IF EXISTS user_roles")
