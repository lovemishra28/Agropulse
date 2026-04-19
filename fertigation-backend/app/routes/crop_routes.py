from fastapi import APIRouter, Query, HTTPException
from app.models.crop_model import CropProfile
from pymongo.errors import PyMongoError
from app.database import crop_collection, is_database_available, DB_UNAVAILABLE_MESSAGE
from app.services.growth_stage_service import calculate_growth_stage

router = APIRouter()

@router.post("/crop-profile")
def create_crop_profile(data: CropProfile):
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    crop_dict = data.dict()
    # Converts the date object to a string so MongoDB can store it easily
    crop_dict["seed_date"] = str(crop_dict["seed_date"])
    try:
        crop_collection.insert_one(crop_dict)
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    return {"message": "Crop profile saved"}

@router.get("/crop-profile")
def get_crop_profile():
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    try:
        data = list(crop_collection.find({}, {"_id": 0}))
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    return data

@router.get("/growth-stage")
def get_growth_stage(crop_type: str = Query(...), seed_date: str = Query(...)):
    """Returns the growth stage and journey data for any given crop and sowing date."""
    return calculate_growth_stage(crop_type, seed_date)