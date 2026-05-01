from typing import Optional
from passlib.context import CryptContext
from app.core.config import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__time_cost=2,
    argon2__memory_cost=1024,
    argon2__parallelism=2,
)

def hash_password(password: str) -> str:
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        return None