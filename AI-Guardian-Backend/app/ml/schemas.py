from pydantic import BaseModel, ConfigDict
from typing import List

class AnalysisRequest(BaseModel):
    content: str


class MLAnalysisResponse(BaseModel):
    is_phishing: bool
    probability: float
    confidence: float
    explanation: List[str] = []

class MLHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    is_phishing: bool
    probability: float
    confidence: float
    created_at: str # will be formatted
