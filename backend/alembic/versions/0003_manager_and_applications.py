"""manager role and application metadata

Revision ID: 0003
Revises: 0002
Create Date: 2024-01-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE user_roles ADD VALUE IF NOT EXISTS 'manager'")
    op.add_column("users", sa.Column("faculty", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("skills", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("course", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("last_active_at", sa.DateTime(), nullable=True))

    op.add_column("assignments", sa.Column("decision_at", sa.DateTime(), nullable=True))
    op.add_column("assignments", sa.Column("decided_by", sa.Integer(), nullable=True))
    op.add_column("assignments", sa.Column("decision_reason", sa.String(length=500), nullable=True))
    op.create_foreign_key(
        "fk_assignments_decided_by_users",
        "assignments",
        "users",
        ["decided_by"],
        ["id"],
    )


def downgrade():
    op.drop_constraint("fk_assignments_decided_by_users", "assignments", type_="foreignkey")
    op.drop_column("assignments", "decision_reason")
    op.drop_column("assignments", "decided_by")
    op.drop_column("assignments", "decision_at")

    op.drop_column("users", "last_active_at")
    op.drop_column("users", "course")
    op.drop_column("users", "skills")
    op.drop_column("users", "faculty")
