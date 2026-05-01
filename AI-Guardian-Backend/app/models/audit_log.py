from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from datetime import datetime


class AuditLogs(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String, nullable=False)
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=False)
    status_code = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)