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

@router.get("/sync")
async def sync_simulations(db: AsyncSession = Depends(get_db)):
    """
    Déclenche manuellement la synchronisation avec Gophish.
    """
    from app.core.communications import sync_gophish_results
    await sync_gophish_results(db)
    return {"message": "Synchronisation terminée"}

from pydantic import BaseModel

class ThreatTemplateRequest(BaseModel):
    name: str
    subject: str
    html_content: str

@router.post("/threat-template")
async def create_threat_template(req: ThreatTemplateRequest):
    """
    Crée dynamiquement un template dans Gophish pour une menace.
    """
    from app.core.communications import get_gophish_client
    api = get_gophish_client()
    if not api:
        # Gophish non configuré, on simule la création
        return {"message": "Gophish non configuré, simulation de création réussie"}
        
    from gophish.models import Template
    try:
        template = Template(name=req.name, subject=req.subject, html=req.html_content)
        api.templates.post(template)
        return {"message": "Modèle créé avec succès dans Gophish"}
    except Exception as e:
        # Ignore errors if it already exists or other issues
        print(f"[GOPHISH TEMPLATE ERROR] {e}")
        return {"message": f"Erreur ou modèle déjà existant: {e}"}

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
    
    # 3. Préparer TOUTES les données nécessaires avant le commit
    # On extrait tout dans des listes simples car les objets 'user' et 'target' expirent après le commit
    simulation_targets_data = []
    for user, target in zip(users, targets_list):
        simulation_targets_data.append({
            "email": user.email,
            "first_name": user.prenoms,
            "last_name": user.nom,
            "target_id": target.id
        })
    
    await db.commit()
    await db.refresh(db_sim)

    # 4. Déclencher la campagne réelle (Gophish ou Email)
    if sim.channel == "email":
        from app.core.communications import create_gophish_campaign
        g_targets = [{"first_name": t['first_name'], "last_name": t['last_name'], "email": t['email']} for t in simulation_targets_data]
        create_gophish_campaign(db_sim.name, g_targets, db_sim.template or "Default", db_sim.sending_profile)
    
    # On lance les tâches de fond avec les données extraites
    for target_data in simulation_targets_data:
        background_tasks.add_task(
            send_simulation_message, 
            email=target_data["email"],
            simulation_name=db_sim.name,
            channel=db_sim.channel,
            text=db_sim.text or "",
            target_id=target_data["target_id"]
        )

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
        select(SimulationTarget, User.prenoms, User.nom)
        .join(User, SimulationTarget.user_id == User.id)
        .where(SimulationTarget.simulation_id == id)
        .order_by(SimulationTarget.created_at.desc())
    )
    targets = []
    for row in result.all():
        target, prenoms, nom = row
        target_dict = SimulationTargetResponse.model_validate(target)
        target_dict.user_name = f"{prenoms} {nom}"
        targets.append(target_dict)
    return targets

@router.delete("/{id}")
async def delete_simulation(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Simulation).where(Simulation.id == id))
    sim = result.scalar_one_or_none()
    
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation non trouvée")
        
    await db.delete(sim)
    await db.commit()
    return {"message": "Simulation supprimée avec succès"}
