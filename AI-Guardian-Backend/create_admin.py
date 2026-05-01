"""
Script de création du compte administrateur.
Usage : python create_admin.py
"""
import sys
import os
import asyncio

# S'assurer qu'on est dans le bon répertoire
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from sqlalchemy import select
from app.models.user import User
from app.core.security import hash_password

# ─── Configuration du compte admin ───────────────────────────────────────────
ADMIN_EMAIL    = "admin@aiguardian.com"
ADMIN_PASSWORD = "Admin@2024!"
ADMIN_NOM      = "Administrateur"
ADMIN_PRENOMS  = "AI Guardian"
ADMIN_ROLE     = "ADMIN"
# ─────────────────────────────────────────────────────────────────────────────

async def create_admin():
    # Les tables sont gérées par Alembic
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.email == ADMIN_EMAIL))
        existing = result.scalars().first()
        if existing:
            print(f"[INFO] Un compte admin existe déjà pour : {ADMIN_EMAIL}")
            print(f"       Rôle actuel : {existing.role}")
            return

        admin = User(
            email=ADMIN_EMAIL,
            nom=ADMIN_NOM,
            prenoms=ADMIN_PRENOMS,
            mot_de_passe=hash_password(ADMIN_PASSWORD),
            role=ADMIN_ROLE,
        )
        db.add(admin)
        await db.commit()
        print("Compte administrateur créé avec succès !")
        print(f"   Email    : {ADMIN_EMAIL}")
        print(f"   Password : {ADMIN_PASSWORD}")
        print(f"   Rôle     : {ADMIN_ROLE}")
        print("\n Pensez à changer le mot de passe après la première connexion.")

if __name__ == "__main__":
    asyncio.run(create_admin())
