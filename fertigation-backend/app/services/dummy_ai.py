def generate_recommendation(soil_moisture):
    if soil_moisture < 30:
        return {
            "recommendation": "HIGH",
            "fertilizer_amount": 25,
            "confidence": 0.85,
            "reason": "Soil moisture critically low"
        }
    elif soil_moisture < 50:
        return {
            "recommendation": "MEDIUM",
            "fertilizer_amount": 15,
            "confidence": 0.75,
            "reason": "Moderate soil moisture level"
        }
    else:
        return {
            "recommendation": "LOW",
            "fertilizer_amount": 5,
            "confidence": 0.65,
            "reason": "Soil moisture sufficient"
        }