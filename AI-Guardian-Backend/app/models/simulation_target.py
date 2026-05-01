from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import relationship

class SimulationTarget(Base):
    __tablename__ = "simulation_targets"

    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(Integer, ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Tracking
    has_opened = Column(Boolean, default=False)
    has_clicked = Column(Boolean, default=False)
    has_reported = Column(Boolean, default=False)
    
    clicked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    simulation = relationship("Simulation", back_populates="targets")
    user = relationship("User")
