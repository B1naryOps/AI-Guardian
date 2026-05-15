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
    Les designs sont optimisés pour paraître authentiques (logos CDN, typographie, structure).
    """
    templates = {
        "Microsoft 365 Login": {
            "subject": "Action requise : Vérification de sécurité de votre compte Microsoft 365",
            "html": """
<div style="background-color: #f2f2f2; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd;">
        <div style="padding: 20px;">
            <img src="https://img.icons8.com/color/48/000000/microsoft.png" alt="Microsoft" style="width: 32px; vertical-align: middle; margin-right: 10px;">
            <span style="font-size: 18px; color: #737373; vertical-align: middle;">Microsoft</span>
        </div>
        <div style="padding: 0 40px 40px 40px;">
            <h2 style="color: #262626; font-size: 24px; font-weight: 400; margin-bottom: 20px;">Vérification de sécurité</h2>
            <p style="font-size: 14px; line-height: 20px; color: #262626;">Nous avons détecté une activité inhabituelle lors d'une connexion récente à votre compte Microsoft 365. Pour garantir la sécurité de vos données, nous avons temporairement restreint l'accès à certaines fonctionnalités.</p>
            <p style="font-size: 14px; line-height: 20px; color: #262626;">Détails de la connexion :<br>
            <strong>Appareil :</strong> Chrome sur Windows 10<br>
            <strong>Lieu :</strong> Moscou, Fédération de Russie (IP: 95.161.224.12)</p>
            <div style="margin: 30px 0;">
                <a href="{{.URL}}" style="background-color: #0067b8; color: #ffffff; padding: 10px 20px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">Reconnaître l'activité</a>
            </div>
            <p style="font-size: 14px; line-height: 20px; color: #262626;">Si vous n'êtes pas à l'origine de cette connexion, un tiers essaie peut-être d'accéder à votre compte. Veuillez cliquer sur le bouton ci-dessus pour sécuriser votre compte immédiatement.</p>
            <p style="font-size: 14px; line-height: 20px; color: #262626; margin-top: 40px;">Merci,<br>L'équipe des comptes Microsoft</p>
        </div>
        <div style="background-color: #f2f2f2; padding: 20px; font-size: 11px; color: #737373; line-height: 15px;">
            Ce message vous a été envoyé pour vous informer de modifications importantes apportées à votre compte et à vos services Microsoft.<br>
            Microsoft Corporation, One Microsoft Way, Redmond, WA 98052 USA
        </div>
    </div>
</div>
            """
        },
        "Facture Urgente": {
            "subject": "Facture en attente de paiement - Action requise sous 24h",
            "html": """
<div style="font-family: Arial, sans-serif; color: #333333; max-width: 600px; margin: 0 auto; border: 1px solid #eeeeee;">
    <div style="background-color: #f8f9fa; padding: 30px; border-bottom: 2px solid #007bff;">
        <table width="100%">
            <tr>
                <td><h1 style="margin: 0; color: #007bff; font-size: 28px;">SERVICE FACTURATION</h1></td>
                <td align="right"><span style="color: #666; font-size: 14px;">FACTURE #INV-2024-0514</span></td>
            </tr>
        </table>
    </div>
    <div style="padding: 30px;">
        <p>Cher collaborateur,</p>
        <p>Sauf erreur ou omission de notre part, le paiement de la facture citée en référence n'est pas parvenu à nos services. À ce jour, votre compte présente un solde débiteur de <strong>1,249.90 €</strong>.</p>
        <div style="background-color: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; margin: 20px 0;">
            <strong>Avertissement :</strong> Sans régularisation de votre part sous 24 heures, nous serons au regret de suspendre l'accès à vos outils de travail collaboratifs.
        </div>
        <p>Vous pouvez consulter le détail de la facture et procéder au règlement via notre portail sécurisé :</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{.URL}}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Consulter la facture (PDF)</a>
        </div>
        <p style="font-size: 12px; color: #777;">Note : Pour des raisons de sécurité, vous devrez vous authentifier sur le portail de l'entreprise pour accéder à ce document.</p>
    </div>
    <div style="padding: 20px; background-color: #f4f4f4; text-align: center; font-size: 11px; color: #999;">
        © 2024 Direction Financière - Tous droits réservés.
    </div>
</div>
            """
        },
        "Mise à jour RH": {
            "subject": "URGENT : Mise à jour obligatoire de votre dossier personnel (Conformité 2024)",
            "html": """
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <tr>
            <td style="background-color: #2c3e50; padding: 20px; text-align: center; color: #ffffff;">
                <h2 style="margin: 0; text-transform: uppercase; letter-spacing: 2px;">Direction des Ressources Humaines</h2>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px;">
                <p style="font-size: 16px; color: #34495e;">Bonjour,</p>
                <p style="font-size: 16px; color: #34495e; line-height: 1.6;">Dans le cadre de la mise en conformité annuelle avec les nouvelles réglementations fiscales et sociales, chaque employé doit valider ses informations personnelles avant le 20 du mois en cours.</p>
                <p style="font-size: 16px; color: #34495e; line-height: 1.6;"><strong>Attention :</strong> Le non-respect de cette procédure pourrait entraîner un retard dans le versement de votre prochain salaire ou des erreurs de calcul sur vos cotisations.</p>
                <div style="text-align: center; margin-top: 40px;">
                    <a href="{{.URL}}" style="background-color: #e74c3c; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; transition: background 0.3s;">Accéder au Portail RH de l'Entreprise</a>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; background-color: #ecf0f1; text-align: center; font-size: 12px; color: #7f8c8d;">
                Ce mail est généré automatiquement par le SIRH. Merci de ne pas y répondre.<br>
                &copy; 2024 HR Global Services
            </td>
        </tr>
    </table>
</div>
            """
        },
        "Alerte Sécurité Compte": {
            "subject": "Alerte de sécurité critique : Connexion non autorisée détectée",
            "html": """
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffcccc; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #ff0000; color: white; padding: 15px; text-align: center;">
        <h2 style="margin: 0;">ALERTE DE SÉCURITÉ CRITIQUE</h2>
    </div>
    <div style="padding: 30px; line-height: 1.5;">
        <p>Une tentative de connexion suspecte a été détectée sur votre compte professionnel depuis une adresse IP inconnue en dehors de votre zone géographique habituelle.</p>
        <table style="width: 100%; background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <tr><td><strong>IP :</strong></td><td>185.244.149.23</td></tr>
            <tr><td><strong>Navigateur :</strong></td><td>Opera 94.0 (Linux)</td></tr>
            <tr><td><strong>Date :</strong></td><td>Aujourd'hui, 23:14:02</td></tr>
        </table>
        <p>Si ce n'est pas vous, votre mot de passe a probablement été compromis. Vous devez réinitialiser vos accès immédiatement pour protéger les données de l'entreprise.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{.URL}}" style="background-color: #333; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe maintenant</a>
        </div>
    </div>
</div>
            """
        },
        "Invitation Réunion Teams": {
            "subject": "URGENT : Réunion d'urgence - Changement d'organisation",
            "html": """
<div style="background-color: #f3f2f1; padding: 30px; font-family: 'Segoe UI', Tahoma, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color: #464eb8; padding: 15px 25px; display: flex; align-items: center;">
            <img src="https://img.icons8.com/color/48/ffffff/microsoft-teams.png" style="width: 24px; margin-right: 15px;">
            <span style="color: white; font-weight: 600; font-size: 16px;">Microsoft Teams</span>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 18px; color: #252423; font-weight: 600;">Vous avez été ajouté à une réunion urgente</p>
            <p style="color: #616161; font-size: 14px;">Une réunion exceptionnelle a été programmée par la direction pour discuter des récents changements organisationnels.</p>
            <div style="border-left: 4px solid #464eb8; padding-left: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Sujet :</strong> Restructuration des services Q3/Q4</p>
                <p style="margin: 5px 0 0 0;"><strong>Heure :</strong> Immédiatement</p>
            </div>
            <a href="{{.URL}}" style="background-color: #464eb8; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 14px; border-radius: 2px;">Cliquez ici pour rejoindre la réunion</a>
            <p style="margin-top: 30px; font-size: 12px; color: #828282;">Besoin d'aide ? Contactez le support informatique via le portail habituel.</p>
        </div>
    </div>
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
            template=Template(name=template_name),
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
