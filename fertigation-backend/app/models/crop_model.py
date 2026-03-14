from pydantic import BaseModel
from datetime import date

class CropProfile(BaseModel):
    crop_type: str
    seed_date: date