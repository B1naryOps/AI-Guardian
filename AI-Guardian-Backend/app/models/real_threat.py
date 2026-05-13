from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from datetime import datetime
from app.database import Base

class RealThreat(Base):
    __tablename__ = "real_threats"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String)
    subject = Column(String)
    content_preview = Column(Text)
    risk_score = Column(Float) # 0.0 to 1.0
    threat_type = Column(String) # Phishing, Malware, Spam
    detected_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="blocked") # blocked, quarantined
