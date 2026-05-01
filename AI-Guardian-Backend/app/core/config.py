import os
from datetime import timedelta

DATABASE_URL = "sqlite+aiosqlite:///./app.db"

print("USING DB:", DATABASE_URL)


SECRET_KEY = "CHANGE_ME_SUPER_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60