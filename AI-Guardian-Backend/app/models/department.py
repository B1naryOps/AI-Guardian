from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    staff_count = Column(Integer, default=0)
    avg_vigilance = Column(Float, default=100.0)
    priority = Column(String, default="normal") # normal, high, critical
    points = Column(Integer, default=0)
    invite_code = Column(String(10), unique=True, index=True, nullable=True)
    
    users = relationship("User", back_populates="department")
