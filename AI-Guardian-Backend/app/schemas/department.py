from typing import Optional
from pydantic import BaseModel, ConfigDict

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    staff_count: Optional[int] = 0
    avg_vigilance: Optional[float] = 100.0
    priority: Optional[str] = "normal"
    points: Optional[int] = 0
    invite_code: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
