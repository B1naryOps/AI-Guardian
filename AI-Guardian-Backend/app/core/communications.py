import asyncio
import os
from gophish import Gophish
from gophish.models import Campaign, Template, Group, User as GophishUser, SMTP
from app.models.simulation import Simulation
from app.models.simulation_target import SimulationTarget
from app.models.user import User
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Configuration Gophish (à définir dans le .env)
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
            print("[GOPHISH] ERREUR : Aucune 'Landing Page' trouvée. Créez-en une dans Gophish !")
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
            # On ne traite que les évènements de type "Clicked Link"
            for event in camp.timeline:
                if event.message == "Clicked Link":
                    email = event.email
                    
                    # 1. Marquer la cible comme 'clicked' dans AI-Guardian
                    # On cherche la cible par email de l'utilisateur
                    user_res = await db.execute(select(User).where(User.email == email))
                    user = user_res.scalar_one_or_none()
                    
                    if user:
                        # Update SimulationTarget
                        await db.execute(
                            update(SimulationTarget)
                            .where(SimulationTarget.user_id == user.id)
                            .where(SimulationTarget.status == 'sent')
                            .values(status='clicked')
                        )
                        
                        # 2. Baisser le score du département (Malus de vigilance)
                        if user.department_id:
                            dept_res = await db.execute(select(Department).where(Department.id == user.department_id))
                            dept = dept_res.scalar_one_or_none()
                            if dept:
                                # On baisse la vigilance (ex: -5% par clic)
                                new_vigilance = max(0, (dept.avg_vigilance or 100) - 5)
                                await db.execute(
                                    update(Department)
                                    .where(Department.id == dept.id)
                                    .values(avg_vigilance=new_vigilance)
                                )
        await db.commit()
        print("[GOPHISH SYNC] Synchronisation terminée.")
    except Exception as e:
        print(f"[GOPHISH SYNC ERROR] {e}")
