from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError
from app.database import sensor_collection, is_database_available, DB_UNAVAILABLE_MESSAGE
from app.services.alert_service import generate_alerts

router = APIRouter()

@router.get("/alerts")
def get_alerts():
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    try:
        latest_data = sensor_collection.find_one(
            sort=[("timestamp", -1)],
            projection={"_id": 0}
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    if not latest_data:
        return {"alerts": []}

    alerts = generate_alerts(latest_data)

    return {"alerts": alerts}