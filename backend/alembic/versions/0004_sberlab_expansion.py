"""sberlab expansion

Revision ID: 0004
Revises: 0003
Create Date: 2024-06-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE user_roles ADD VALUE IF NOT EXISTS 'univ_teacher'")
    op.execute("ALTER TYPE user_roles ADD VALUE IF NOT EXISTS 'univ_supervisor'")
    op.execute("ALTER TYPE user_roles ADD VALUE IF NOT EXISTS 'univ_admin'")
    op.execute("ALTER TYPE user_roles ADD VALUE IF NOT EXISTS 'hr'")
    op.execute("ALTER TYPE user_roles ADD VALUE IF NOT EXISTS 'academic_partnership_admin'")

    op.add_column("users", sa.Column("linkedin_url", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("github_url", sa.String(length=500), nullable=True))

    op.add_column("tasks", sa.Column("goal", sa.Text(), nullable=True))
    op.add_column("tasks", sa.Column("key_tasks", sa.Text(), nullable=True))
    op.add_column("tasks", sa.Column("novelty", sa.Text(), nullable=True))
    op.add_column("tasks", sa.Column("skills_required", sa.String(length=500), nullable=True))
    op.add_column("tasks", sa.Column("course_alignment", sa.String(length=255), nullable=True))
    op.add_column("tasks", sa.Column("diploma_possible", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("tasks", sa.Column("practice_possible", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("tasks", sa.Column("course_project_possible", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("tasks", sa.Column("nda_required", sa.Boolean(), server_default=sa.false(), nullable=False))

    op.add_column("assignments", sa.Column("nda_accepted", sa.Boolean(), server_default=sa.false(), nullable=False))

    op.add_column("comments", sa.Column("is_private", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("comments", sa.Column("recipient_id", sa.Integer(), nullable=True))
    op.add_column("comments", sa.Column("meeting_info", sa.Text(), nullable=True))
    op.create_foreign_key(
        "fk_comments_recipient_id_users",
        "comments",
        "users",
        ["recipient_id"],
        ["id"],
    )

    op.create_table(
        "approvals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.Enum("diploma", "practice", "course", name="approval_type"), nullable=False),
        sa.Column(
            "state",
            sa.Enum("submitted", "approved", "needs_changes", "rejected", name="approval_state"),
            nullable=False,
        ),
        sa.Column("requested_by", sa.Integer(), nullable=False),
        sa.Column("reviewer_id", sa.Integer(), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]),
        sa.ForeignKeyConstraint(["requested_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"]),
    )
    op.create_index("ix_approvals_task_id", "approvals", ["task_id"])
    op.create_index("ix_approvals_requested_by", "approvals", ["requested_by"])
    op.create_index("ix_approvals_reviewer_id", "approvals", ["reviewer_id"])
    op.create_index("ix_approvals_state", "approvals", ["state"])
    op.create_index("ix_approvals_type", "approvals", ["type"])

    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("assignment_id", sa.Integer(), nullable=False),
        sa.Column("mentor_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["assignment_id"], ["assignments.id"]),
        sa.ForeignKeyConstraint(["mentor_id"], ["users.id"]),
        sa.UniqueConstraint("assignment_id", name="uq_review_assignment"),
    )
    op.create_index("ix_reviews_assignment_id", "reviews", ["assignment_id"])
    op.create_index("ix_reviews_mentor_id", "reviews", ["mentor_id"])

    op.create_table(
        "portfolio_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("assignment_id", sa.Integer(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]),
        sa.ForeignKeyConstraint(["assignment_id"], ["assignments.id"]),
        sa.UniqueConstraint("assignment_id", name="uq_portfolio_assignment"),
    )
    op.create_index("ix_portfolio_entries_student_id", "portfolio_entries", ["student_id"])
    op.create_index("ix_portfolio_entries_task_id", "portfolio_entries", ["task_id"])
    op.create_index("ix_portfolio_entries_assignment_id", "portfolio_entries", ["assignment_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=255), nullable=False),
        sa.Column("entity_type", sa.String(length=255), nullable=True),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("metadata", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"]),
    )
    op.create_index("ix_audit_logs_actor_id", "audit_logs", ["actor_id"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_entity_id", "audit_logs", ["entity_id"])
    op.create_index("ix_audit_logs_entity_type", "audit_logs", ["entity_type"])

    op.create_table(
        "user_skills",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("user_id", "name", name="uq_user_skill"),
    )
    op.create_index("ix_user_skills_user_id", "user_skills", ["user_id"])
    op.create_index("ix_user_skills_name", "user_skills", ["name"])


def downgrade():
    op.drop_index("ix_user_skills_name", table_name="user_skills")
    op.drop_index("ix_user_skills_user_id", table_name="user_skills")
    op.drop_table("user_skills")

    op.drop_index("ix_audit_logs_entity_type", table_name="audit_logs")
    op.drop_index("ix_audit_logs_entity_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_action", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor_id", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("ix_portfolio_entries_assignment_id", table_name="portfolio_entries")
    op.drop_index("ix_portfolio_entries_task_id", table_name="portfolio_entries")
    op.drop_index("ix_portfolio_entries_student_id", table_name="portfolio_entries")
    op.drop_table("portfolio_entries")

    op.drop_index("ix_reviews_mentor_id", table_name="reviews")
    op.drop_index("ix_reviews_assignment_id", table_name="reviews")
    op.drop_table("reviews")

    op.drop_index("ix_approvals_type", table_name="approvals")
    op.drop_index("ix_approvals_state", table_name="approvals")
    op.drop_index("ix_approvals_reviewer_id", table_name="approvals")
    op.drop_index("ix_approvals_requested_by", table_name="approvals")
    op.drop_index("ix_approvals_task_id", table_name="approvals")
    op.drop_table("approvals")

    op.drop_constraint("fk_comments_recipient_id_users", "comments", type_="foreignkey")
    op.drop_column("comments", "meeting_info")
    op.drop_column("comments", "recipient_id")
    op.drop_column("comments", "is_private")

    op.drop_column("assignments", "nda_accepted")

    op.drop_column("tasks", "nda_required")
    op.drop_column("tasks", "course_project_possible")
    op.drop_column("tasks", "practice_possible")
    op.drop_column("tasks", "diploma_possible")
    op.drop_column("tasks", "course_alignment")
    op.drop_column("tasks", "skills_required")
    op.drop_column("tasks", "novelty")
    op.drop_column("tasks", "key_tasks")
    op.drop_column("tasks", "goal")

    op.drop_column("users", "github_url")
    op.drop_column("users", "linkedin_url")
