from pydantic import BaseModel

class Recommendation(BaseModel):
    recommendation: str
    fertilizer_amount: float
    confidence: float
    reason: str