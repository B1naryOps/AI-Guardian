"""add requires_password_change

Revision ID: 8d9e4b102f48
Revises: 59dd3588705f
Create Date: 2026-05-14 21:42:15.726860

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d9e4b102f48'
down_revision: Union[str, None] = '59dd3588705f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('requires_password_change', sa.Boolean(), server_default='0', nullable=True))
    pass


def downgrade() -> None:
    op.drop_column('users', 'requires_password_change')
    pass
