"""user status and team mentors

Revision ID: 0005
Revises: 0004
Create Date: 2024-06-01 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE TYPE user_status AS ENUM ('pending', 'active', 'disabled')")
    op.add_column(
        "users",
        sa.Column("status", sa.Enum("pending", "active", "disabled", name="user_status"), nullable=True),
    )
    op.create_index("ix_users_status", "users", ["status"])

    op.add_column("assignments", sa.Column("team_role", sa.String(length=100), nullable=True))

    op.create_table(
        "task_mentors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("mentor_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]),
        sa.ForeignKeyConstraint(["mentor_id"], ["users.id"]),
        sa.UniqueConstraint("task_id", "mentor_id", name="uq_task_mentor"),
    )
    op.create_index("ix_task_mentors_task_id", "task_mentors", ["task_id"])
    op.create_index("ix_task_mentors_mentor_id", "task_mentors", ["mentor_id"])

    op.execute("UPDATE users SET status='active'")
    op.alter_column("users", "status", nullable=False)


def downgrade():
    op.drop_index("ix_task_mentors_mentor_id", table_name="task_mentors")
    op.drop_index("ix_task_mentors_task_id", table_name="task_mentors")
    op.drop_table("task_mentors")

    op.drop_column("assignments", "team_role")

    op.drop_index("ix_users_status", table_name="users")
    op.drop_column("users", "status")
    op.execute("DROP TYPE user_status")
