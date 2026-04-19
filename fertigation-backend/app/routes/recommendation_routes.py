from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from pymongo.errors import PyMongoError
from app.database import (
    sensor_collection,
    crop_collection,
    recommendation_history_collection,
    is_database_available,
    DB_UNAVAILABLE_MESSAGE,
)
from app.services.ml_model_service import predict_fertilizer
from app.services.growth_stage_service import calculate_growth_stage, get_supported_crops
from app.services.hybrid_recommendation_service import calculate_hybrid_recommendation

router = APIRouter()

@router.get("/recommendation")
def get_recommendation(crop_type: Optional[str] = Query(None), seed_date: Optional[str] = Query(None)):
    if not is_database_available():
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    try:
        latest_sensor = sensor_collection.find_one(
            sort=[("timestamp", -1)],
            projection={"_id": 0}
        )

        if crop_type and seed_date:
             # Find specific crop if passed in query
             crop = crop_collection.find_one({"crop_type": crop_type, "seed_date": seed_date}, projection={"_id": 0})
             # If doesn't exact match, just use the params directly to construct dynamic crop info
             if not crop:
                 crop = {"crop_type": crop_type, "seed_date": seed_date}
        else:
             # Otherwise default to the latest globally
             crop = crop_collection.find_one({}, projection={"_id": 0}, sort=[("_id", -1)])
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    if not latest_sensor or not crop:
        return {"error": "Missing sensor or crop data"}

    # ── Step 1: Calculate the real growth stage from crop_type + seed_date ──
    growth_info = calculate_growth_stage(crop["crop_type"], crop["seed_date"])
    current_stage = growth_info["growth_stage"]  # e.g., "Vegetative"

    # ── Step 2: Pass the calculated growth stage to the ML model ──
    # The ML model was trained on 4 stages only. If the crop is "Harvested",
    # fall back to "Fruiting" for prediction — the hybrid engine handles the rest.
    ml_stage = "Fruiting" if current_stage == "Harvested" else current_stage
    result = predict_fertilizer(latest_sensor, ml_stage)

    prediction = result["prediction"]    # "LOW", "MEDIUM", or "HIGH"
    confidence = result["confidence"]    # e.g., 82.5

    # ── Step 3: Hybrid Engine — combine agronomic base + AI adjustment ──
    hybrid = calculate_hybrid_recommendation(current_stage, prediction, confidence)

    # ── Build final response ──
    response = {
    # Core recommendation
    "recommendation":    hybrid["recommendation"],
    "confidence":        hybrid["confidence"],
    "reason":            hybrid["reason"],

    # Hybrid N-P-K breakdown
    "adjustment_factor":       hybrid["adjustment_factor"],
    "nitrogen_kg_per_acre":    hybrid["nitrogen_kg_per_acre"],
    "phosphorus_kg_per_acre":  hybrid["phosphorus_kg_per_acre"],
    "potassium_kg_per_acre":   hybrid["potassium_kg_per_acre"],
    "total_kg_per_acre":       hybrid["total_kg_per_acre"],

    # Base values (before adjustment)
    "base_nitrogen":   hybrid["base_nitrogen_kg_per_acre"],
    "base_phosphorus": hybrid["base_phosphorus_kg_per_acre"],
    "base_potassium":  hybrid["base_potassium_kg_per_acre"],

    # Growth stage info (for frontend display)
    "growth_stage": growth_info
    }

    # ── Step 4: Log this recommendation to history ──
    log_entry = {
        "timestamp": datetime.utcnow(),
        "recommendation": hybrid["recommendation"],
        "confidence": hybrid["confidence"],
        "growth_stage": current_stage,
        "crop_type": crop["crop_type"],
        "nitrogen_kg_per_acre": hybrid["nitrogen_kg_per_acre"],
        "phosphorus_kg_per_acre": hybrid["phosphorus_kg_per_acre"],
        "potassium_kg_per_acre": hybrid["potassium_kg_per_acre"],
        "total_kg_per_acre": hybrid["total_kg_per_acre"],
        "adjustment_factor": hybrid["adjustment_factor"],
        "soil_moisture": latest_sensor.get("soil_moisture"),
        "temperature": latest_sensor.get("temperature"),
    }
    try:
        recommendation_history_collection.insert_one(log_entry)
    except PyMongoError:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MESSAGE)

    return response


@router.get("/supported-crops")
def get_crops():
    """Returns the list of crop types that have growth stage timelines defined."""
    return {"crops": get_supported_crops()}