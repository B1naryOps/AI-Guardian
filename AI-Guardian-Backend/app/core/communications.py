import asyncio
import os
from datetime import datetime
from gophish import Gophish
from gophish.models import Campaign, Template, Group, User as GophishUser, SMTP
from app.models.simulation import Simulation
from app.models.simulation_target import SimulationTarget
from app.models.user import User
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Configuration Gophish (à définir dans le .env)
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
GOPHISH_API_KEY = os.getenv("GOPHISH_API_KEY", "")
GOPHISH_URL = os.getenv("GOPHISH_URL", "https://localhost:3333")

def get_gophish_client():
    if not GOPHISH_API_KEY:
        return None
    # Disable SSL verify if using self-signed certs (common with Gophish out of the box)
    return Gophish(GOPHISH_API_KEY, host=GOPHISH_URL, verify=False)

async def send_simulation_message(email: str, simulation_name: str, channel: str, text: str = "", target_id: int = None):
    """
    Cette fonction est appelée en arrière-plan. On utilise des types simples 
    pour éviter les erreurs de session SQLAlchemy (MissingGreenlet).
    """
    api = get_gophish_client()
    
    if not api:
        print(f"[DEBUG] Gophish non configuré. Simulation d'envoi pour {email}")
        return

    # Si c'est du SMS
    if channel == "sms":
        print(f"[SMS] Envoi simulé à {email} : {text}")
        return

    # Pour l'email via Gophish
    print(f"[GOPHISH] Campagne en cours pour {email}")

import time

def create_gophish_campaign(simulation_name: str, targets: list, template_name: str):
    """
    Crée un groupe et une campagne dans Gophish avec vérifications de sécurité.
    """
    api = get_gophish_client()
    if not api:
        print("[GOPHISH] API non configurée.")
        return None

    if not targets:
        print("[GOPHISH] Aucune cible pour cette campagne. Annulation.")
        return None

    try:
        from gophish.models import Page
        # 1. Créer le groupe de cibles
        g_targets = [GophishUser(first_name=t['first_name'], last_name=t['last_name'], email=t['email']) for t in targets]
        # On ajoute un timestamp pour éviter les collisions de noms de groupes
        group_name = f"Group_{simulation_name}_{int(time.time())}"
        group = api.groups.post(Group(name=group_name, targets=g_targets))
        
        # 2. Vérifier les profils SMTP
        smtp_profiles = api.smtp.get()
        if not smtp_profiles:
            print("[GOPHISH] ERREUR : Aucun 'Sending Profile' trouvé. Créez-en un dans Gophish !")
            return None
        smtp_name = smtp_profiles[0].name

        # 3. Vérifier les Templates
        templates = api.templates.get()
        if not templates:
            print("[GOPHISH] ERREUR : Aucun 'Email Template' trouvé. Créez-en un dans Gophish !")
            return None
        t_name = templates[0].name

        # 4. Vérifier les Landing Pages
        pages = api.pages.get()
        if not pages:
            print("[GOPHISH] Aucune 'Landing Page' trouvée. Création automatique d'une page par défaut...")
            try:
                default_page = Page(
                    name="Default_AI_Guardian_Landing",
                    html="<html><body><h1>Accès Interdit</h1><p>Ceci était une simulation de phishing par AI-Guardian.</p></body></html>",
                    capture_credentials=False,
                    capture_passwords=False
                )
                api.pages.post(default_page)
                pages = api.pages.get()
            except Exception as e:
                print(f"[GOPHISH] ERREUR lors de la création de la Landing Page : {e}")
                return None
            
        p_name = pages[0].name

        # 5. Créer et lancer la campagne
        campaign = api.campaigns.post(Campaign(
            name=f"{simulation_name}_{int(time.time())}",
            groups=[Group(name=group.name)],
            template=Template(name=t_name),
            smtp=SMTP(name=smtp_name),
            page=Page(name=p_name),
            url="http://192.168.111.128:8080",
        ))
        print(f"[GOPHISH] Campagne '{campaign.name}' lancée avec succès.")
        return campaign
    except Exception as e:
        print(f"[ERREUR GOPHISH DETAIL] {e}")
        return None

async def sync_gophish_results(db):
    """
    Récupère les clics depuis Gophish et met à jour AI-Guardian.
    """
    api = get_gophish_client()
    if not api: return

    try:
        campaigns = api.campaigns.get()
        from app.models.simulation_target import SimulationTarget
        from app.models.department import Department
        from app.models.user import User
        from sqlalchemy import select, update

        for camp in campaigns:
            for event in camp.timeline:
                # Évènement de CLIC
                if event.message == "Clicked Link":
                    email = event.email
                    user_res = await db.execute(select(User).where(User.email == email))
                    user = user_res.scalar_one_or_none()
                    
                    if user:
                        # 1. Update SimulationTarget (has_clicked = True)
                        target_res = await db.execute(
                            select(SimulationTarget)
                            .where(SimulationTarget.user_id == user.id)
                            .where(SimulationTarget.has_clicked == False)
                        )
                        target = target_res.scalar_one_or_none()

                        if target:
                            target.has_clicked = True
                            target.clicked_at = datetime.utcnow()
                            
                            # 2. Update Global Simulation Counter
                            await db.execute(
                                update(Simulation)
                                .where(Simulation.id == target.simulation_id)
                                .values(total_clicks=Simulation.total_clicks + 1)
                            )
                        
                        # 3. Baisser le score du département (Malus de vigilance)
                        if user.department_id:
                            dept_res = await db.execute(select(Department).where(Department.id == user.department_id))
                            dept = dept_res.scalar_one_or_none()
                            if dept:
                                new_vigilance = max(0, (dept.avg_vigilance or 100) - 10) # -10% par clic
                                await db.execute(
                                    update(Department).where(Department.id == dept.id).values(avg_vigilance=new_vigilance)
                                )
                        
                        # 4. Baisser le score de l'utilisateur
                        new_user_vigilance = max(0, (user.vigilance_score or 100) - 10)
                        await db.execute(
                            update(User).where(User.id == user.id).values(vigilance_score=new_user_vigilance)
                        )

                # Évènement d'OUVERTURE
                elif event.message == "Email Opened":
                    email = event.email
                    user_res = await db.execute(select(User).where(User.email == email))
                    user = user_res.scalar_one_or_none()
                    if user:
                        await db.execute(
                            update(SimulationTarget)
                            .where(SimulationTarget.user_id == user.id)
                            .values(has_opened=True)
                        )
            
            # Après avoir traité tous les évènements d'une campagne, on recalcule le total réel
            # Cela corrige les compteurs si des clics ont été synchronisés partiellement
            from sqlalchemy import func
            sim_res = await db.execute(select(Simulation).where(Simulation.name.like(f"%{camp.name}%")))
            sim = sim_res.scalar_one_or_none()
            if sim:
                count_res = await db.execute(
                    select(func.count(SimulationTarget.id))
                    .where(SimulationTarget.simulation_id == sim.id)
                    .where(SimulationTarget.has_clicked == True)
                )
                real_clicks = count_res.scalar()
                sim.total_clicks = real_clicks

        await db.commit()
        print("[GOPHISH SYNC] Synchronisation et recalcul terminés avec succès.")
    except Exception as e:
        print(f"[GOPHISH SYNC ERROR] {e}")
