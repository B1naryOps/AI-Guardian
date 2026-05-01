from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Mon Entreprise")
    industry = Column(String, nullable=True)
    is_configured = Column(Boolean, default=False)
    logo_url = Column(String, nullable=True)
    dashboard_layout = Column(String, nullable=True, default='["stats", "passport", "charts", "threats"]')
