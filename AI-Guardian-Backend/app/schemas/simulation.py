from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SimulationBase(BaseModel):
    name: str
    target_department: str
    text: Optional[str] = None # Content of the fake phishing email
    template: str
    sending_profile: str
    target_group: str
    status: Optional[str] = "active"
    scheduled_at: Optional[datetime] = None
    channel: Optional[str] = "email"

class SimulationCreate(SimulationBase):
    pass

class SimulationTargetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_name: Optional[str] = None
    has_opened: bool
    has_clicked: bool
    has_reported: bool
    clicked_at: Optional[datetime]
    created_at: datetime

class SimulationResponse(SimulationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    total_targets: int
    total_clicks: int
    total_opened: int
    total_reported: int
    scheduled_at: Optional[datetime] = None
    created_at: datetime
