import asyncio
import os
from datetime import datetime
from gophish import Gophish
from gophish.models import Campaign, Template, Group, User as GophishUser, SMTP, Page
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

def get_template_content(template_name: str):
    """
    Retourne le contenu HTML premium correspondant au nom du template.
    """
    templates = {
        "Microsoft 365 Login": {
            "subject": "Alerte de sécurité de votre compte Microsoft 365",
            "html": """
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; background-color: #ffffff;">
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <div style="width: 32px; height: 32px; background-color: #E81123; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; margin-right: 10px;">M</div>
        <span style="font-weight: 600; font-size: 18px; color: #475569;">Microsoft 365</span>
    </div>
    <p style="font-weight: bold; font-size: 16px; margin-bottom: 12px; color: #1e293b;">Alerte de sécurité de votre compte</p>
    <p style="margin-bottom: 20px; line-height: 1.5;">Nous avons détecté une activité de connexion inhabituelle sur votre compte. Veuillez vérifier votre activité récente immédiatement pour éviter un blocage de l'accès.</p>
    <a href="{{.URL}}" style="display: inline-block; background-color: #0078D4; color: white; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 4px;">Vérifier l'activité</a>
    <p style="margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; pt: 12px;">Ceci est un message automatique de sécurité. Merci de ne pas y répondre.</p>
</div>
            """
        },
        "Facture Urgente": {
            "subject": "URGENT : Facture impayée #9482",
            "html": """
<div style="font-family: sans-serif; color: #334155; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; background-color: #ffffff;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">
        <span style="font-weight: bold; font-size: 18px; color: #64748b;">INVOICE #9482</span>
        <span style="background-color: #fef2f2; color: #ef4444; font-weight: bold; padding: 4px 12px; border-radius: 4px; font-size: 12px;">URGENT</span>
    </div>
    <p style="margin-bottom: 12px;">Veuillez trouver ci-joint la facture pour les services du mois en cours.</p>
    <p style="margin-bottom: 20px; font-weight: 600; color: #dc2626;">Le paiement est attendu sous 24h pour éviter une suspension de vos services.</p>
    <div style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; display: flex; align-items: center; background-color: #f8fafc;">
        <div style="margin-right: 12px; color: #3b82f6;">📄</div>
        <a href="{{.URL}}" style="font-weight: 600; color: #2563eb; text-decoration: underline;">Facture_Avril.pdf</a>
    </div>
</div>
            """
        },
        "Mise à jour RH": {
            "subject": "Action requise : Mise à jour de vos informations RH",
            "html": """
<div style="font-family: sans-serif; color: #334155; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; background-color: #ffffff;">
    <div style="display: flex; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
        <div style="width: 40px; height: 40px; background-color: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; margin-right: 12px;">RH</div>
        <span style="font-weight: bold; font-size: 18px; color: #334155;">Ressources Humaines</span>
    </div>
    <p style="font-weight: bold; font-size: 16px; margin-bottom: 12px;">Mise à jour obligatoire de vos informations</p>
    <p style="margin-bottom: 20px; line-height: 1.5;">Conformément à la nouvelle politique de l'entreprise, merci de valider vos informations de paie avant la fin de la semaine.</p>
    <a href="{{.URL}}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 8px;">Portail RH</a>
</div>
            """
        },
        "Alerte Sécurité Compte": {
            "subject": "Alerte de Sécurité : Activité suspecte détectée",
            "html": """
<div style="font-family: sans-serif; color: #334155; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; background-color: #ffffff;">
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <div style="font-size: 24px; margin-right: 12px;">⚠️</div>
        <span style="font-weight: bold; font-size: 18px; color: #334155;">Alerte de Sécurité</span>
    </div>
    <p style="font-weight: bold; font-size: 16px; margin-bottom: 12px;">Activité suspecte détectée</p>
    <p style="margin-bottom: 20px; line-height: 1.5;">Une connexion depuis une adresse IP inconnue a été bloquée. Veuillez confirmer votre identité pour sécuriser votre compte.</p>
    <a href="{{.URL}}" style="display: inline-block; background-color: #1e293b; color: white; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 8px;">Sécuriser mon compte</a>
</div>
            """
        },
        "Invitation Réunion Teams": {
            "subject": "Invitation : Point d'équipe exceptionnel",
            "html": """
<div style="font-family: sans-serif; color: #334155; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; background-color: #ffffff;">
    <div style="display: flex; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
        <div style="width: 32px; height: 32px; background-color: #5059C9; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-weight: bold; font-size: 14px; margin-right: 10px;">T</div>
        <span style="font-weight: bold; font-size: 18px; color: #334155;">Microsoft Teams</span>
    </div>
    <p style="font-weight: bold; font-size: 16px; margin-bottom: 12px;">Vous avez été invité à une réunion</p>
    <p style="color: #64748b; margin-bottom: 20px; line-height: 1.5;">Sujet : Point d'équipe exceptionnel<br>Heure : Aujourd'hui à 14:00</p>
    <a href="{{.URL}}" style="display: inline-block; background-color: #5059C9; color: white; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 8px;">Rejoindre la réunion</a>
</div>
            """
        }
    }
    return templates.get(template_name, {
        "subject": f"Simulation de sécurité : {template_name}",
        "html": f"<html><body><h2>Alerte Sécurité</h2><p>Ceci est une simulation d'attaque par AI-Guardian.</p><p><a href=\"{{.URL}}\">Lien d'accès</a></p></body></html>"
    })

import time

def create_gophish_campaign(simulation_name: str, targets: list, template_name: str, sending_profile_name: str = None):
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
        
        # Essayer de trouver un profil qui correspond au nom demandé (ex: "IT Support")
        smtp_name = smtp_profiles[0].name
        if sending_profile_name:
            # On cherche une correspondance partielle (ex: "IT Support" dans "IT Support (support@company.com)")
            clean_name = sending_profile_name.split('(')[0].strip()
            for p in smtp_profiles:
                if clean_name.lower() in p.name.lower():
                    smtp_name = p.name
                    break

        # 3. Vérifier et mettre à jour les Templates
        templates = api.templates.get()
        target_template = None
        for t in templates:
            if t.name == template_name:
                target_template = t
                break
        
        # On récupère le contenu "frais" (celui qui est premium dans le code)
        content = get_template_content(template_name)
        
        if not target_template:
            print(f"[GOPHISH] Template '{template_name}' introuvable. Création automatique...")
            try:
                new_template = Template(
                    name=template_name,
                    subject=content["subject"],
                    html=content["html"],
                    text="Ceci est une simulation de phishing par AI-Guardian. Ne cliquez pas sur les liens suspects. {{.URL}}"
                )
                api.templates.post(new_template)
            except Exception as e:
                print(f"[GOPHISH] ERREUR de création de template: {e}")
                if templates:
                    template_name = templates[0].name
        else:
            # Si le template existe déjà, on le met à jour s'il s'agit d'un template géré par AI-Guardian
            # On vérifie si c'est l'un de nos templates prédéfinis
            managed_templates = ["Microsoft 365 Login", "Facture Urgente", "Mise à jour RH", "Alerte Sécurité Compte", "Invitation Réunion Teams"]
            if template_name in managed_templates:
                print(f"[GOPHISH] Mise à jour du template '{template_name}' pour garantir le design premium...")
                try:
                    target_template.subject = content["subject"]
                    target_template.html = content["html"]
                    api.templates.put(target_template)
                except Exception as e:
                    print(f"[GOPHISH] Erreur lors de la mise à jour du template : {e}")

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
        # On utilise une URL configurable via .env
        campaign_url = os.getenv("GOPHISH_CAMPAIGN_URL", "http://localhost:8080")
        
        campaign = api.campaigns.post(Campaign(
            name=f"{simulation_name}_{int(time.time())}",
            groups=[Group(name=group.name)],
            template=Template(name=t_name),
            smtp=SMTP(name=smtp_name),
            page=Page(name=p_name),
            url=campaign_url,
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
