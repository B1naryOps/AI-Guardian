import imaplib
import email
from email.header import decode_header
import os
import asyncio
from datetime import datetime
from app.database import SessionLocal
from app.models.real_threat import RealThreat
from app.ml.service import analyze_text_ml
from dotenv import load_dotenv

load_dotenv()

# Configuration IMAP (à mettre dans le .env)
IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
IMAP_USER = os.getenv("IMAP_USER", "")
IMAP_PASSWORD = os.getenv("IMAP_PASSWORD", "")

async def scan_mailbox():
    """
    Scanne la boîte mail configurée et analyse les nouveaux messages.
    """
    if not IMAP_USER or not IMAP_PASSWORD:
        print("[SCANNER] IMAP non configuré. En attente de credentials...")
        return

    try:
        # Connexion au serveur
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(IMAP_USER, IMAP_PASSWORD)
        mail.select("inbox")

        # Recherche des mails non lus
        status, messages = mail.search(None, 'UNSEEN')
        if status != "OK":
            return

        for num in messages[0].split():
            # Récupération du mail
            status, data = mail.fetch(num, '(RFC822)')
            if status != "OK":
                continue

            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email)

            # Extraction des infos
            subject, encoding = decode_header(msg["Subject"])[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding or "utf-8")
            
            sender = msg.get("From")
            
            # Extraction du corps du mail
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        body = part.get_payload(decode=True).decode()
                        break
            else:
                body = msg.get_payload(decode=True).decode()

            # --- ANALYSE IA ---
            analysis = analyze_text_ml(body)
            risk_score = analysis["confidence"] / 100.0
            
            if risk_score > 0.5:
                print(f"[SCANNER] MENACE DÉTECTÉE : {subject} de {sender} (Score: {risk_score})")
                
                # Enregistrement en base de données
                db = SessionLocal()
                try:
                    new_threat = RealThreat(
                        sender=sender,
                        subject=subject,
                        content_preview=body[:500],
                        risk_score=risk_score,
                        threat_type="Phishing" if risk_score > 0.7 else "Suspect",
                        status="quarantined" if risk_score > 0.8 else "blocked"
                    )
                    db.add(new_threat)
                    db.commit()
                finally:
                    db.close()

        mail.logout()
    except Exception as e:
        print(f"[SCANNER ERROR] {e}")

async def start_periodic_scanner(interval_seconds=60):
    """
    Lance le scanner en boucle.
    """
    print(f"[SCANNER] Démarrage du bouclier de protection (Intervalle: {interval_seconds}s)")
    while True:
        await scan_mailbox()
        await asyncio.sleep(interval_seconds)
