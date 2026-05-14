from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.core.roles import require_admin
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password
import re

def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 8 caractères.")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins une majuscule.")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins une minuscule.")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins un chiffre.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins un caractère spécial.")


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    validate_password(user.mot_de_passe)
    
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Recherche du département via invite_code
    assigned_dept_id = user.department_id
    if user.invite_code:
        from app.models.department import Department
        dept_result = await db.execute(select(Department).where(Department.invite_code == user.invite_code))
        dept = dept_result.scalars().first()
        if not dept:
            raise HTTPException(status_code=404, detail="Code d'invitation invalide")
        assigned_dept_id = dept.id

    hashed_password = hash_password(user.mot_de_passe)
    new_user = User(
        email=user.email,
        nom=user.nom,
        prenoms=user.prenoms,
        mot_de_passe=hashed_password,
        role=user.role,
        department_id=assigned_dept_id
    )

    db.add(new_user)
    
    from sqlalchemy.exc import IntegrityError
    try:
        await db.commit()
        await db.refresh(new_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    return new_user


@router.get("/", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()


@router.get("/me", response_model=UserResponse)
async def read_me(current_user: User = Depends(get_current_user)):
    return current_user

from pydantic import BaseModel

class UserUpdate(BaseModel):
    nom: str | None = None
    prenoms: str | None = None
    mot_de_passe: str | None = None

@router.patch("/me", response_model=UserResponse)
async def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user_update.nom:
        current_user.nom = user_update.nom
    if user_update.prenoms:
        current_user.prenoms = user_update.prenoms
    if user_update.mot_de_passe:
        validate_password(user_update.mot_de_passe)
        current_user.mot_de_passe = hash_password(user_update.mot_de_passe)
        current_user.requires_password_change = False
    
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/admin/dashboard")
async def admin_dashboard(admin = Depends(require_admin)):
    return {"message": "Bienvenue admin"}
