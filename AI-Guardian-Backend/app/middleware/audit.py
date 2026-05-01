from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.database import SessionLocal
from app.models.audit_log import AuditLogs
from datetime import datetime
from app.core.auth import get_current_user_id 

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = request.client.host
        method = request.method
        endpoint = request.url.path
        user_agent = request.headers.get("user-agent", "unknown")
        user_id = get_current_user_id(request)

        response = await call_next(request)

        async with SessionLocal() as db:
            log = AuditLogs(
                user_id=user_id,
                action="access",
                endpoint=endpoint,
                method=method,
                ip_address=ip,
                user_agent=user_agent,
                status_code=response.status_code
            )
            db.add(log)
            await db.commit()

        return response
