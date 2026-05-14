from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    nom: str
    prenoms: str
    mot_de_passe: str
    role: Optional[str] = "EMPLOYEE"
    department_id: Optional[int] = None
    invite_code: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    nom: str
    prenoms: str
    role: str
    department_id: Optional[int] = None
    xp: Optional[int] = 0
    level: Optional[str] = "Novice"
    vigilance_score: Optional[float] = 100.0
    requires_password_change: Optional[bool] = False
