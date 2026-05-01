from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from typing import List
from app.database import get_db
from app.models.simulation import Simulation
from app.models.simulation_target import SimulationTarget
from app.models.user import User
from app.models.department import Department
from app.schemas.simulation import SimulationCreate, SimulationResponse, SimulationTargetResponse
from datetime import datetime
from fastapi.responses import RedirectResponse
from app.websockets.manager import manager
from app.core.remediation_tasks import check_repeat_offender
from app.core.communications import send_simulation_message

router = APIRouter(prefix="/simulations", tags=["Simulations"])

@router.get("/", response_model=List[SimulationResponse])
async def list_simulations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Simulation).order_by(Simulation.created_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=SimulationResponse)
async def create_simulation(sim: SimulationCreate, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # 1. Créer la simulation
    db_sim = Simulation(**sim.model_dump())
    db.add(db_sim)
    await db.flush() # Pour avoir l'ID
    
    # 2. Chercher les cibles (utilisateurs)
    query = select(User)
    if sim.target_department != "Tous":
        dept_res = await db.execute(select(Department).where(Department.name == sim.target_department))
        dept = dept_res.scalar_one_or_none()
        if dept:
            query = query.where(User.department_id == dept.id)
        else:
            query = query.where(User.id == -1)
    else:
        # Pour "Tous", on exclut quand même les admins par sécurité
        query = query.where(User.role != "ADMIN")
    
    users_result = await db.execute(query)
    users = users_result.scalars().all()
    
    # 3. Créer les cibles de simulation
    targets_list = []
    for user in users:
        target = SimulationTarget(
            simulation_id=db_sim.id,
            user_id=user.id
        )
        db.add(target)
        targets_list.append(target)
    
    db_sim.total_targets = len(targets_list)
    
    # Préparer les cibles pour Gophish AVANT le commit pour éviter l'expiration des objets SQLAlchemy
    g_targets = [{"first_name": u.prenoms, "last_name": u.nom, "email": u.email} for u in users]
    
    await db.commit()
    await db.refresh(db_sim)

    # 4. Déclencher la campagne réelle (Gophish ou Email)
    if sim.channel == "email":
        from app.core.communications import create_gophish_campaign
        create_gophish_campaign(db_sim.name, g_targets, db_sim.template or "Default")
    
    # On garde le loop pour les logs internes et le tracking
    for user, target in zip(users, targets_list):
        background_tasks.add_task(send_simulation_message, db_sim, target, user)

    return db_sim

@router.get("/track/{target_id}")
async def track_click(target_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # 1. Trouver la cible et l'utilisateur
    result = await db.execute(
        select(SimulationTarget)
        .where(SimulationTarget.id == target_id)
    )
    target = result.scalar_one_or_none()
    
    if not target:
        raise HTTPException(status_code=404, detail="Cible inconnue")
    
    if not target.has_clicked:
        target.has_clicked = True
        target.clicked_at = datetime.utcnow()
        
        # Mettre à jour les stats globales de la simulation
        await db.execute(
            update(Simulation)
            .where(Simulation.id == target.simulation_id)
            .values(total_clicks=Simulation.total_clicks + 1)
        )
        
        # Déduire des points pour le département
        user_result = await db.execute(select(User).where(User.id == target.user_id))
        user = user_result.scalar_one_or_none()
        if user and user.department_id:
            await db.execute(
                update(Department)
                .where(Department.id == user.department_id)
                .values(points=Department.points - 5)
            )

        await db.commit()
        
        # Diffusion WebSocker pour le temps réel
        await manager.broadcast({
            "type": "SIMULATION_UPDATE",
            "simulation_id": target.simulation_id,
            "total_clicks": target.simulation.total_clicks if hasattr(target, 'simulation') else None # Note: On pourrait re-fetcher si besoin, mais Simulation.total_clicks + 1 est connu
        })
        
        # Vérification si l'utilisateur doit suivre une formation
        background_tasks.add_task(check_repeat_offender, target.user_id)
    
    # Redirection vers la page de sensibilisation (Front-end)
    return RedirectResponse(url="http://localhost:5173/awareness", status_code=302) # On redirige vers la page de sensibilisation dédiée

@router.get("/{id}/stats", response_model=List[SimulationTargetResponse])
async def get_simulation_targets(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SimulationTarget)
        .where(SimulationTarget.simulation_id == id)
        .order_by(SimulationTarget.created_at.desc())
    )
    return result.scalars().all()

@router.delete("/{id}")
async def delete_simulation(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Simulation).where(Simulation.id == id))
    sim = result.scalar_one_or_none()
    
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation non trouvée")
        
    await db.delete(sim)
    await db.commit()
    return {"message": "Simulation supprimée avec succès"}
