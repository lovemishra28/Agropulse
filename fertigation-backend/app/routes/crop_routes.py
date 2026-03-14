from fastapi import APIRouter
from app.models.crop_model import CropProfile
from app.database import crop_collection

router = APIRouter()

@router.post("/crop-profile")
def create_crop_profile(data: CropProfile):
    crop_dict = data.dict()
    # Converts the date object to a string so MongoDB can store it easily
    crop_dict["seed_date"] = str(crop_dict["seed_date"])
    crop_collection.insert_one(crop_dict)
    return {"message": "Crop profile saved"}

@router.get("/crop-profile")
def get_crop_profile():
    data = list(crop_collection.find({}, {"_id": 0}))
    return data