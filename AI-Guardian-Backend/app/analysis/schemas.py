from pydantic import BaseModel

class AnalysisRequest(BaseModel):
    content: str

class MLAnalysisResponse(BaseModel):
    is_phishing: bool
    probability: float
    confidence: float
