from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from app.database import get_db
from app.models.audit_log import AuditLogs
from app.models.user import User
from app.schemas.audit import AuditLogOut

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("/", response_model=List[AuditLogOut])
async def get_audit_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLogs).order_by(desc(AuditLogs.created_at)).limit(100))
    logs = result.scalars().all()

    user_ids = list(set([log.user_id for log in logs if log.user_id]))
    users_dict = {}
    if user_ids:
        users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        for u in users_result.scalars().all():
            users_dict[u.id] = u

    out_logs = []
    for log in logs:
        log_dict = {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "endpoint": log.endpoint,
            "method": log.method,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "status_code": log.status_code,
            "created_at": log.created_at
        }
        if log.user_id and log.user_id in users_dict:
            user = users_dict[log.user_id]
            log_dict["user_name"] = f"{user.prenoms} {user.nom}"
            log_dict["user_email"] = user.email
            
        out_logs.append(AuditLogOut(**log_dict))

    return out_logs
