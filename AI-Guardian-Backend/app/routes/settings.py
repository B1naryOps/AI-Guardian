from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.company import CompanySettings
from app.schemas.settings import CompanySettingsResponse, CompanySettingsUpdate
from fastapi import UploadFile, File
import os
import aiofiles
import uuid

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/", response_model=CompanySettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompanySettings).where(CompanySettings.id == 1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        # Créer des paramètres par défaut si rien n'existe
        default_settings = CompanySettings(id=1, name="Mon Entreprise", industry="", is_configured=False)
        db.add(default_settings)
        await db.commit()
        await db.refresh(default_settings)
        return default_settings
        
    return settings

@router.patch("/", response_model=CompanySettingsResponse)
async def update_settings(payload: CompanySettingsUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompanySettings).where(CompanySettings.id == 1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = CompanySettings(id=1)
        db.add(settings)
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
        
    await db.commit()
    await db.refresh(settings)
    return settings

@router.post("/upload-logo")
async def upload_logo(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    ext = file.filename.split('.')[-1]
    filename = f"logo_{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join("app", "static", filename)
    
    async with aiofiles.open(filepath, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
        
    logo_url = f"/static/{filename}"
    
    # Update settings
    result = await db.execute(select(CompanySettings).where(CompanySettings.id == 1))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = CompanySettings(id=1, logo_url=logo_url)
        db.add(settings)
    else:
        settings.logo_url = logo_url
        
    await db.commit()
    
    return {"logo_url": logo_url}
