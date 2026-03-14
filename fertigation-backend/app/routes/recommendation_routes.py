from fastapi import APIRouter
from datetime import datetime
from app.database import sensor_collection, crop_collection, recommendation_history_collection
from app.services.ml_model_service import predict_fertilizer
from app.services.growth_stage_service import calculate_growth_stage, get_supported_crops
from app.services.hybrid_recommendation_service import calculate_hybrid_recommendation

router = APIRouter()

@router.get("/recommendation")
def get_recommendation():

    latest_sensor = sensor_collection.find_one(
        sort=[("timestamp", -1)],
        projection={"_id": 0}
    )

    crop = crop_collection.find_one({}, {"_id": 0})

    if not latest_sensor or not crop:
        return {"error": "Missing sensor or crop data"}

    # ── Step 1: Calculate the real growth stage from crop_type + seed_date ──
    growth_info = calculate_growth_stage(crop["crop_type"], crop["seed_date"])
    current_stage = growth_info["growth_stage"]  # e.g., "Vegetative"

    # ── Step 2: Pass the calculated growth stage to the ML model ──
    result = predict_fertilizer(latest_sensor, current_stage)

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
    recommendation_history_collection.insert_one(log_entry)

    return response


@router.get("/supported-crops")
def get_crops():
    """Returns the list of crop types that have growth stage timelines defined."""
    return {"crops": get_supported_crops()}