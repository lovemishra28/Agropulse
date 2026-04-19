from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from app.models.sensor_model import SensorData
from pymongo.errors import PyMongoError
from app.database import sensor_collection, is_database_available, DB_UNAVAILABLE_MESSAGE

router = APIRouter()

@router.post("/sensor-data")
def add_sensor_data(data: SensorData):
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    # Converts the Pydantic model to a Python dictionary
    sensor_dict = data.dict()
    try:
        sensor_collection.insert_one(sensor_dict)
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    return {"message": "Sensor data stored successfully"}

@router.get("/sensor-data")
def get_sensor_data(
    hours: Optional[int] = Query(None, description="Filter by last N hours"),
    limit: int = Query(200, description="Max records to return"),
):
    """
    Returns sensor data from MongoDB.
    Optional: pass ?hours=1 to get only the last 1 hour of data.
    """
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    query = {}
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query["timestamp"] = {"$gte": since}

    try:
        data = list(
            sensor_collection.find(
                query, {"_id": 0}
            ).sort("timestamp", -1).limit(limit)
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    # Return in chronological order (oldest → newest) for the charts
    data.reverse()
    return data