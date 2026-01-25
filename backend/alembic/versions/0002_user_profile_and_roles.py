"""user profile and roles

Revision ID: 0002
Revises: 0001
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("avatar_url", sa.String(length=500), nullable=True))
    op.execute("ALTER TYPE user_roles ADD VALUE IF NOT EXISTS 'teacher'")
    op.execute("ALTER TYPE user_roles ADD VALUE IF NOT EXISTS 'tech_admin'")


def downgrade():
    op.drop_column("users", "avatar_url")
