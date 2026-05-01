import asyncio
import os
from gophish import Gophish
from gophish.models import Campaign, Template, Group, User as GophishUser, SMTP
from app.models.simulation import Simulation
from app.models.simulation_target import SimulationTarget
from app.models.user import User

# Configuration Gophish (à définir dans le .env)
GOPHISH_API_KEY = os.getenv("GOPHISH_API_KEY", "")
GOPHISH_URL = os.getenv("GOPHISH_URL", "https://localhost:3333")

def get_gophish_client():
    if not GOPHISH_API_KEY:
        return None
    # Disable SSL verify if using self-signed certs (common with Gophish out of the box)
    return Gophish(GOPHISH_API_KEY, host=GOPHISH_URL, verify=False)

async def send_simulation_message(simulation: Simulation, target: SimulationTarget, user: User):
    """
    Cette fonction est appelée pour chaque cible. 
    Pour Gophish, on va plutôt gérer la création globale dans la route,
    mais on garde cette fonction pour le logging et le fallback SMS.
    """
    api = get_gophish_client()
    
    if not api:
        print(f"[DEBUG] Gophish non configuré. Simulation d'envoi pour {user.email}")
        return

    # Si c'est du SMS, Gophish ne gère pas, on reste en mock ou on utilise Twilio
    if simulation.channel == "sms":
        print(f"[SMS] Envoi simulé à {user.email} : {simulation.text}")
        return

    # Pour l'email via Gophish, la campagne est lancée globalement.
    # On log simplement que l'utilisateur fait partie de la simulation.
    print(f"[GOPHISH] Utilisateur {user.email} prêt pour la campagne '{simulation.name}'")

def create_gophish_campaign(simulation_name: str, targets: list, template_name: str):
    """
    Crée un groupe et une campagne dans Gophish.
    """
    api = get_gophish_client()
    if not api:
        return None

    try:
        # 1. Créer le groupe de cibles
        g_targets = [GophishUser(first_name=t['first_name'], last_name=t['last_name'], email=t['email']) for t in targets]
        group = api.groups.post(Group(name=f"Group_{simulation_name}", targets=g_targets))
        
        # 2. On cherche un profil SMTP (Sending Profile) existant. 
        # S'il n'y en a pas, la campagne sera créée mais restera en "Error" dans Gophish.
        smtp_profiles = api.smtp.get()
        smtp_name = smtp_profiles[0].name if smtp_profiles else "Default"

        # 3. On cherche un Template
        templates = api.templates.get()
        t_name = templates[0].name if templates else "Default"

        # 4. Créer et lancer la campagne
        campaign = api.campaigns.post(Campaign(
            name=simulation_name,
            groups=[group],
            template=Template(name=t_name),
            smtp=SMTP(name=smtp_name),
            url="http://192.168.111.128:8000", # L'URL de notre serveur pour le tracking
        ))
        return campaign
    except Exception as e:
        print(f"[ERREUR CREATE GOPHISH] {e}")
        return None
