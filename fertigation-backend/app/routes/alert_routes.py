from fastapi import APIRouter
from app.database import sensor_collection
from app.services.alert_service import generate_alerts

router = APIRouter()

@router.get("/alerts")
def get_alerts():

    latest_data = sensor_collection.find_one(
        sort=[("timestamp", -1)],
        projection={"_id": 0}
    )

    if not latest_data:
        return {"alerts": []}

    alerts = generate_alerts(latest_data)

    return {"alerts": alerts}