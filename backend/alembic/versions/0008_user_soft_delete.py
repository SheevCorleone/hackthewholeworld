"""add user soft delete flag

Revision ID: 0008
Revises: 0007
Create Date: 2025-02-14 00:00:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index(op.f("ix_users_is_deleted"), "users", ["is_deleted"], unique=False)
    op.alter_column("users", "is_deleted", server_default=None)


def downgrade():
    op.drop_index(op.f("ix_users_is_deleted"), table_name="users")
    op.drop_column("users", "is_deleted")
