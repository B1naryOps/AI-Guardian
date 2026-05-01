from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from app.database import Base

class MLAnalysis(Base):
    __tablename__ = "ml_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    content = Column(String, nullable=False)
    is_phishing = Column(Boolean, nullable=False)
    probability = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
