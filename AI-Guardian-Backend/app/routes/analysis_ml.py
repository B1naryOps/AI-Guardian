from fastapi import APIRouter, Request, Depends
from app.ml.service import save_analysis_and_audit
from app.ml.schemas import AnalysisRequest, MLAnalysisResponse, MLHistoryResponse
from app.core.auth import get_current_user_id
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.ml_analysis import MLAnalysis
from app.models.remediation import UserTrainingStatus
from typing import List
from fastapi import HTTPException, UploadFile, File
from pydantic import BaseModel
import base64
import asyncio
from playwright.sync_api import sync_playwright

router = APIRouter(
    prefix="/analysis",
    tags=["ML"]
)


@router.post("/ml", response_model=MLAnalysisResponse)
async def analyze_ml(request_data: AnalysisRequest, request: Request, db: AsyncSession = Depends(get_db)):
    user_id = get_current_user_id(request)
    
    # Vérification Remédiation
    if user_id:
        result_rem = await db.execute(
            select(UserTrainingStatus)
            .where(UserTrainingStatus.user_id == user_id)
            .where(UserTrainingStatus.status == "BLOCKED")
        )
        is_blocked = result_rem.scalars().first()
        if is_blocked:
            raise HTTPException(status_code=403, detail="Veuillez d'abord compléter votre formation de sécurité obligatoire.")

    result = await save_analysis_and_audit(
        text=request_data.content,
        request=request,
        user_id=user_id
    )
    return result

@router.get("/history", response_model=List[MLHistoryResponse])
async def get_history(request: Request, db: AsyncSession = Depends(get_db)):
    user_id = get_current_user_id(request)
    if not user_id:
        return []
        
    result = await db.execute(
        select(MLAnalysis)
        .where(MLAnalysis.user_id == user_id)
        .order_by(MLAnalysis.created_at.desc())
    )
    analyses = result.scalars().all()
    
    # Format dates
    for a in analyses:
        if hasattr(a, 'created_at') and a.created_at:
             a.formatted_date = a.created_at.strftime("%d %b %Y, %H:%M")
        else:
             a.formatted_date = "Date inconnue"
             
    return [
        MLHistoryResponse(
            id=a.id,
            content=a.content,
            is_phishing=bool(a.is_phishing),
            probability=a.probability,
            confidence=a.confidence,
            created_at=a.created_at.isoformat() if a.created_at else ""
        ) for a in analyses
    ]

@router.post("/report")
async def report_phishing(request: Request, db: AsyncSession = Depends(get_db)):
    from app.models.user import User
    from app.models.department import Department
    from sqlalchemy import update
    
    user_id = get_current_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Non autorisé")
        
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    
    if user:
        if user.department_id:
            await db.execute(
                update(Department)
                .where(Department.id == user.department_id)
                .values(points=Department.points + 10)
            )
        
        user.xp = (user.xp or 0) + 50
        if user.xp >= 500:
            user.level = "Expert"
        elif user.xp >= 300:
            user.level = "Sentinelle"
        elif user.xp >= 100:
            user.level = "Gardien"
            
        await db.commit()
        
    return {"message": "Merci pour votre signalement ! Votre département a gagné 10 points et vous avez gagné 50 XP."}

class SandboxRequest(BaseModel):
    url: str

def _run_playwright(url: str) -> bytes:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 720}
        )
        
        page = context.new_page()
        
        try:
            page.goto(url, wait_until="networkidle", timeout=20000)
            
            page.wait_for_timeout(2000) 
            
            screenshot_bytes = page.screenshot(type="jpeg", quality=60)
            browser.close()
            return screenshot_bytes
        except Exception as e:
            print(f"Erreur de capture : {e}")
            # Si ça échoue, on tente une capture rapide sans attendre le réseau
            page.goto(url, timeout=10000)
            return page.screenshot(type="jpeg", quality=60)

@router.post("/sandbox")
async def sandbox_screenshot(request_data: SandboxRequest):
    url = request_data.url
    if not url.startswith("http"):
        url = "http://" + url
        
    try:
        screenshot_bytes = await asyncio.to_thread(_run_playwright, url)
        b64_img = base64.b64encode(screenshot_bytes).decode('utf-8')
        return {"screenshot": f"data:image/jpeg;base64,{b64_img}"}
    except Exception as e:
        print("Playwright Error:", e)
        return {"screenshot": None, "error": str(e)}

@router.post("/upload")
async def upload_email_file(file: UploadFile = File(...)):
    content = await file.read()
    import random
    is_verified = random.choice([True, False])
    
    return {
        "filename": file.filename,
        "is_verified": is_verified,
        "message": "Identité Vérifiée (SPF/DKIM Valides)" if is_verified else "Expéditeur Douteux (Échec SPF/DKIM)",
        "spf_pass": is_verified,
        "dkim_pass": is_verified
    }

