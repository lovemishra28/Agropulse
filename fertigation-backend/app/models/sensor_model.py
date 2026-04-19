from pydantic import BaseModel, Field
from datetime import datetime

class SensorData(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    soil_moisture: float
    temperature: float
    humidity: float
    light_intensity: float
    nitrogen: float = Field(default=0.0)
    phosphorus: float = Field(default=0.0)
    potassium: float = Field(default=0.0)