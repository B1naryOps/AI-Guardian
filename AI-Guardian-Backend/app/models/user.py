from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nom = Column(String, nullable=False)
    prenoms = Column(String, nullable=False)
    mot_de_passe = Column(String, nullable=False)
    role = Column(String, default="EMPLOYEE")
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    xp = Column(Integer, default=0)
    level = Column(String, default="Novice")

    department = relationship("Department", back_populates="users")
