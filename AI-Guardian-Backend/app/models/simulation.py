from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_department = Column(String, nullable=False)  # "Tous" ou nom département
    text = Column(String, nullable=True) # Contenu du phishing
    template = Column(String, nullable=False)
    sending_profile = Column(String, nullable=False)
    target_group = Column(String, nullable=False)
    status = Column(String, default="active") # active, scheduled, completed, cancelled
    scheduled_at = Column(DateTime, nullable=True)
    channel = Column(String, default="email") # email, sms
    # Stats globales
    total_targets = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_reported = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    targets = relationship("SimulationTarget", back_populates="simulation", cascade="all, delete-orphan")
