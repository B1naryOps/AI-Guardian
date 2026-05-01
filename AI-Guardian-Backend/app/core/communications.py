import asyncio
from app.models.simulation import Simulation
from app.models.simulation_target import SimulationTarget
from app.models.user import User

async def send_simulation_message(simulation: Simulation, target: SimulationTarget, user: User):
    """
    Simule l'envoi d'un message via email ou SMS selon le canal choisi.
    """
    tracking_link = f"http://localhost:8000/simulations/track/{target.id}"
    
    if simulation.channel == "sms":
        print(f"[TWILIO MOCK] Envoi SMS à {user.prenoms} {user.nom} ({user.email})")
        print(f"[TWILIO MOCK] Contenu: {simulation.text}")
        print(f"[TWILIO MOCK] Lien de tracking: {tracking_link}")
        print(f"[TWILIO MOCK] SMS envoyé avec succès !\n")
    else:
        print(f"[SMTP MOCK] Envoi Email à {user.prenoms} {user.nom} ({user.email})")
        print(f"[SMTP MOCK] Sujet: {simulation.name}")
        print(f"[SMTP MOCK] De: {simulation.sending_profile}")
        print(f"[SMTP MOCK] Contenu HTML: {simulation.template}")
        print(f"[SMTP MOCK] Lien de tracking: {tracking_link}")
        print(f"[SMTP MOCK] Email envoyé avec succès !\n")
        
    # Simulate network delay
    await asyncio.sleep(0.1)
