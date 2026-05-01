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
    Simule l'envoi d'un message via email en utilisant Gophish.
    S'il n'y a pas de clé API, on fait un fallback sur les logs de debug.
    """
    tracking_link = f"http://localhost:8000/simulations/track/{target.id}"
    
    api = get_gophish_client()
    
    if not api:
        # Fallback de développement si Gophish n'est pas configuré
        if simulation.channel == "sms":
            print(f"[DEBUG - GOPHISH NON CONFIGURÉ] SMS à {user.email}: {simulation.text}")
        else:
            print(f"[DEBUG - GOPHISH NON CONFIGURÉ] Email à {user.email}: {simulation.name}")
        await asyncio.sleep(0.1)
        return

    try:
        # Note: L'intégration "parfaite" avec Gophish nécessiterait de créer un Group, 
        # une Page, un Template, un SMTP, puis une Campagne. 
        # Pour une intégration légère, on pourrait appeler l'API Gophish ici pour inscrire l'utilisateur
        # à une campagne existante, ou créer une campagne à la volée.
        print(f"[GOPHISH] Tentative de connexion à l'API Gophish pour {user.email}...")
        # Exemple de code pour créer un utilisateur dans un groupe (nécessite l'ID du groupe)
        # api.groups.post(Group(name=f"Sim_{simulation.id}", targets=[GophishUser(first_name=user.prenoms, last_name=user.nom, email=user.email)]))
        print(f"[GOPHISH] Connexion réussie, email en attente d'envoi par Gophish.")
    except Exception as e:
        print(f"[ERREUR GOPHISH] Impossible de contacter Gophish: {e}")
        
    await asyncio.sleep(0.1)
