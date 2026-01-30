"""user token version

Revision ID: 0006
Revises: 0005
Create Date: 2024-06-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("token_version", sa.Integer(), server_default="0", nullable=False))


def downgrade():
    op.drop_column("users", "token_version")
