from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.real_threat import RealThreat
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/threats", tags=["Real Protection"])

class ThreatResponse(BaseModel):
    id: int
    sender: str
    subject: str
    risk_score: float
    threat_type: str
    detected_at: datetime
    status: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ThreatResponse])
async def list_real_threats(db: AsyncSession = Depends(get_db)):
    """
    Liste les menaces réelles détectées par le bouclier IMAP.
    """
    result = await db.execute(
        select(RealThreat).order_by(desc(RealThreat.detected_at))
    )
    return result.scalars().all()

@router.get("/intelligence")
async def get_threat_intelligence():
    """
    Renvoie un flux de menaces pour le widget Threat Intelligence
    """
    import random
    from datetime import datetime, timedelta
    
    threats = [
        {
            "id": "t1",
            "title": "Campagne Emotet détectée en Europe",
            "description": "Vague de phishing massive ciblant les factures impayées.",
            "type": "email",
            "severity": "critical",
            "templateName": "Facture Urgente",
            "date": "Il y a 2h"
        },
        {
            "id": "t2",
            "title": "Smishing : Faux colis",
            "description": "Recrudescence des SMS frauduleux demandant des frais de livraison.",
            "type": "sms",
            "severity": "high",
            "templateName": "Microsoft 365 Login",
            "date": "Il y a 5h"
        },
        {
            "id": "t3",
            "title": "Vulnérabilité RH exploitée",
            "description": "Attaques d'ingénierie sociale via de fausses demandes de mise à jour des fiches de paie.",
            "type": "email",
            "severity": "medium",
            "templateName": "Mise à jour RH",
            "date": "Hier"
        }
    ]
    
    # Shuffle lightly to simulate real-time updates on each fetch
    random.shuffle(threats)
    return threats
