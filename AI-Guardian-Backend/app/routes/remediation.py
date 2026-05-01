from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.models.remediation import UserTrainingStatus
from app.core.auth import get_current_user_id
from datetime import datetime

router = APIRouter(prefix="/remediation", tags=["Remediation"])

@router.get("/status")
async def get_remediation_status(request: Request, db: AsyncSession = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not user_id:
        return {"is_blocked": False}
        
    result = await db.execute(
        select(UserTrainingStatus)
        .where(UserTrainingStatus.user_id == user_id)
        .where(UserTrainingStatus.status == "BLOCKED")
    )
    existing = result.scalars().first()
    
    return {"is_blocked": bool(existing)}

@router.post("/complete")
async def complete_remediation(request: Request, db: AsyncSession = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Non autorisé")
        
    result = await db.execute(
        select(UserTrainingStatus)
        .where(UserTrainingStatus.user_id == user_id)
        .where(UserTrainingStatus.status == "BLOCKED")
    )
    existing = result.scalars().first()
    
    if not existing:
        return {"message": "Aucune formation en attente."}
        
    existing.status = "COMPLETED"
    existing.completed_at = datetime.utcnow()
    await db.commit()
    
    return {"message": "Formation complétée avec succès. Accès débloqué."}
