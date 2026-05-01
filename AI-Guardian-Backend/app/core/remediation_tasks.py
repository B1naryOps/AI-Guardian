from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.simulation_target import SimulationTarget
from app.models.remediation import UserTrainingStatus
from app.database import SessionLocal

async def check_repeat_offender(user_id: int):
    async with SessionLocal() as db:
        # Get the last 2 simulations for this user
        result = await db.execute(
            select(SimulationTarget)
            .where(SimulationTarget.user_id == user_id)
            .order_by(SimulationTarget.created_at.desc())
            .limit(2)
        )
        targets = result.scalars().all()

        if len(targets) == 2 and all(t.has_clicked for t in targets):
            # Check if user is already blocked
            existing_result = await db.execute(
                select(UserTrainingStatus)
                .where(UserTrainingStatus.user_id == user_id)
                .where(UserTrainingStatus.status == "BLOCKED")
            )
            existing = existing_result.scalars().first()

            if not existing:
                # Block user
                new_status = UserTrainingStatus(
                    user_id=user_id,
                    status="BLOCKED"
                )
                db.add(new_status)
                await db.commit()
