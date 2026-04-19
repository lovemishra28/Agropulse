from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime, timedelta
from pymongo.errors import PyMongoError
from app.database import (
    sensor_collection,
    recommendation_history_collection,
    is_database_available,
    DB_UNAVAILABLE_MESSAGE,
)
import io
import csv

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/sensor-data")
def export_sensor_data(hours: Optional[int] = Query(None)):
    """Download sensor data as a CSV file."""
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    query = {}
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query["timestamp"] = {"$gte": since}

    try:
        data = list(
            sensor_collection.find(query, {"_id": 0}).sort("timestamp", -1)
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["Timestamp", "Soil Moisture (%)", "Temperature (°C)", "Humidity (%)", "Light (lux)"])

    # Rows
    for row in data:
        writer.writerow([
            row.get("timestamp", ""),
            row.get("soil_moisture", ""),
            row.get("temperature", ""),
            row.get("humidity", ""),
            row.get("light_intensity", ""),
        ])

    output.seek(0)
    filename = f"agropulse_sensor_data_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/recommendations")
def export_recommendations(hours: Optional[int] = Query(None)):
    """Download recommendation history as a CSV file."""
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    query = {}
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query["timestamp"] = {"$gte": since}

    try:
        data = list(
            recommendation_history_collection.find(query, {"_id": 0}).sort("timestamp", -1)
        )
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Timestamp", "Crop", "Growth Stage", "Recommendation", "Confidence (%)",
        "Adjustment Factor", "Nitrogen (kg/acre)", "Phosphorus (kg/acre)",
        "Potassium (kg/acre)", "Total (kg/acre)", "Soil Moisture", "Temperature"
    ])

    # Rows
    for row in data:
        writer.writerow([
            row.get("timestamp", ""),
            row.get("crop_type", ""),
            row.get("growth_stage", ""),
            row.get("recommendation", ""),
            row.get("confidence", ""),
            row.get("adjustment_factor", ""),
            row.get("nitrogen_kg_per_acre", ""),
            row.get("phosphorus_kg_per_acre", ""),
            row.get("potassium_kg_per_acre", ""),
            row.get("total_kg_per_acre", ""),
            row.get("soil_moisture", ""),
            row.get("temperature", ""),
        ])

    output.seek(0)
    filename = f"agropulse_recommendations_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
