# app/core/auth.py
from fastapi import Request, HTTPException
from app.core.security import decode_access_token

def get_current_user_id(request: Request):
    auth = request.headers.get("Authorization")

    if not auth or not auth.startswith("Bearer "):
        return None

    token = auth.replace("Bearer ", "")
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Session expirée ou token invalide")

    return payload.get("sub")  

