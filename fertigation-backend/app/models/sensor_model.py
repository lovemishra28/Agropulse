from pydantic import BaseModel
from datetime import datetime

class SensorData(BaseModel):
    timestamp: datetime
    soil_moisture: float
    temperature: float
    humidity: float
    light_intensity: float