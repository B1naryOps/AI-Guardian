from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
