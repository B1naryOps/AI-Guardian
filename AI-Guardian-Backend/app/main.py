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
from app.middleware.audit import AuditMiddleware
# Modèles importés via app.models dans Alembic
from fastapi.responses import FileResponse
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(asyncio.to_thread(check_and_train_models)) 
    yield

app = FastAPI(title="AI Guardian", lifespan=lifespan)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allows the React dev server (port 5173) and any production domain.
# Adjust origins in production to restrict access.
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FAVICON_PATH = os.path.join("app", "favicon.png")

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(departments_router)
app.include_router(simulations_router)
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
