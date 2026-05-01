from pydantic import BaseModel
from typing import Optional

class CompanySettingsBase(BaseModel):
    name: str
    industry: Optional[str] = None
    is_configured: bool = False
    logo_url: Optional[str] = None
    dashboard_layout: Optional[str] = '["stats", "passport", "charts", "threats"]'

class CompanySettingsUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    is_configured: Optional[bool] = None
    logo_url: Optional[str] = None
    dashboard_layout: Optional[str] = None

class CompanySettingsResponse(CompanySettingsBase):
    id: int

    class Config:
        from_attributes = True
