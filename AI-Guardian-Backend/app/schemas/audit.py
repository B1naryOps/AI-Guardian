from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    action: str
    endpoint: str
    method: str
    ip_address: str
    user_agent: str
    status_code: int
    created_at: datetime

    class Config:
        from_attributes = True
