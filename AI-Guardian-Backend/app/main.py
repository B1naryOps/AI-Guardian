import sys
import asyncio
from app.ml.trainer import check_and_train_models

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
# from app.database import engine, Base  <-- Supprimé car géré par Alembic
from app.routes.users import router as users_router
from app.routes.auth import router as auth_router
from app.routes.analysis_ml import router as analysis_ml_router
from app.routes.departments import router as departments_router
from app.routes.simulations import router as simulations_router
from app.routes.audit import router as audit_router
from app.routes.settings import router as settings_router
from app.routes.ws import router as ws_router
from app.routes.remediation import router as remediation_router
from app.routes.threats import router as threats_router
from app.core.scanner import start_periodic_scanner
from app.middleware.audit import AuditMiddleware
# Modèles importés via app.models dans Alembic
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Entraînement des modèles ML
    asyncio.create_task(asyncio.to_thread(check_and_train_models)) 
    # Démarrage du bouclier de protection
    asyncio.create_task(start_periodic_scanner(interval_seconds=60))
    yield

app = FastAPI(title="AI Guardian", lifespan=lifespan)

# Configuration CORS sécurisée pour la production
origins = [
    "http://192.168.111.128",
    "http://192.168.111.128:5173",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


FAVICON_PATH = os.path.join("app", "favicon.png")

# Create static directory if it doesn't exist
os.makedirs(os.path.join("app", "static"), exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join("app", "static")), name="static")

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(departments_router)
app.include_router(simulations_router)
app.include_router(threats_router)
app.include_router(audit_router)
app.include_router(settings_router)
app.include_router(ws_router)
app.include_router(remediation_router)
app.add_middleware(AuditMiddleware)
app.include_router(analysis_ml_router)

@app.get("/favicon.ico")
async def favicon():
    return FileResponse(FAVICON_PATH)

@app.get("/")
def root():
    return {"message": "AI Guardian backend is running"}
