from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta
from app.models.sensor_model import SensorData
from app.database import sensor_collection

router = APIRouter()

@router.post("/sensor-data")
def add_sensor_data(data: SensorData):
    # Converts the Pydantic model to a Python dictionary
    sensor_dict = data.dict()
    sensor_collection.insert_one(sensor_dict)
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
    query = {}
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query["timestamp"] = {"$gte": since}

    data = list(
        sensor_collection.find(
            query, {"_id": 0}
        ).sort("timestamp", -1).limit(limit)
    )

    # Return in chronological order (oldest → newest) for the charts
    data.reverse()
    return data