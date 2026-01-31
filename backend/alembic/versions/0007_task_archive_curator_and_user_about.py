"""add task archive, curator, and user about

Revision ID: 0007_task_archive_curator_and_user_about
Revises: 0006
Create Date: 2025-02-14 00:00:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0007_task_archive_curator_and_user_about"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("about", sa.Text(), nullable=True))

    op.add_column("tasks", sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("tasks", sa.Column("curator_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_tasks_curator_id"), "tasks", ["curator_id"], unique=False)
    op.create_index(op.f("ix_tasks_is_archived"), "tasks", ["is_archived"], unique=False)
    op.create_foreign_key("fk_tasks_curator_id_users", "tasks", "users", ["curator_id"], ["id"])

    op.execute(
        """
        UPDATE tasks
        SET curator_id = users.id
        FROM users
        WHERE tasks.created_by = users.id
        AND users.role = 'curator'
        """
    )
    op.alter_column("tasks", "is_archived", server_default=None)


def downgrade():
    op.drop_constraint("fk_tasks_curator_id_users", "tasks", type_="foreignkey")
    op.drop_index(op.f("ix_tasks_is_archived"), table_name="tasks")
    op.drop_index(op.f("ix_tasks_curator_id"), table_name="tasks")
    op.drop_column("tasks", "curator_id")
    op.drop_column("tasks", "is_archived")
    op.drop_column("users", "about")
