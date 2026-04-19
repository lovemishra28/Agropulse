# ─────────────────────────────────────────────────────────────
# HYBRID RECOMMENDATION ENGINE
#
# Implements the PDF formula:
#   Final Dose = Base Stage Requirement × AI Adjustment Factor
#
# The AI model classifies the requirement level (LOW/MEDIUM/HIGH),
# and agronomy-based rules define the base N-P-K needs per stage.
# The two are combined to produce the final recommendation.
# ─────────────────────────────────────────────────────────────


# ── Base N-P-K requirements per growth stage (kg/acre) ──
# These are standard agronomic baselines for field crops.
# N = Nitrogen (leaf/stem growth)
# P = Phosphorus (root/flower development)
# K = Potassium (fruit quality, disease resistance)

BASE_STAGE_REQUIREMENTS = {

    "Germination": {
        "nitrogen":   5,
        "phosphorus": 10,
        "potassium":  5,
        "description": "Seeds use stored energy; minimal fertilizer needed to avoid root burn."
    },

    "Vegetative": {
        "nitrogen":   25,
        "phosphorus": 10,
        "potassium":  15,
        "description": "Heavy nitrogen demand for rapid leaf and stem development."
    },

    "Flowering": {
        "nitrogen":   10,
        "phosphorus": 25,
        "potassium":  15,
        "description": "High phosphorus need for flower initiation and pollination support."
    },

    "Fruiting": {
        "nitrogen":   15,
        "phosphorus": 10,
        "potassium":  30,
        "description": "Potassium-heavy to support fruit sizing, sweetness, and disease resistance."
    },

    "Harvested": {
        "nitrogen":   0,
        "phosphorus": 0,
        "potassium":  0,
        "description": "Crop lifecycle complete — no fertilization required post-harvest."
    },
}


# ── AI Adjustment Factors ──
# The ML model predicts how sensor conditions modify the base dose.
# LOW    = conditions are favorable → reduce fertilizer
# MEDIUM = conditions are normal    → apply standard dose
# HIGH   = stress detected          → increase fertilizer

AI_ADJUSTMENT_FACTORS = {
    "LOW":    0.5,
    "MEDIUM": 1.0,
    "HIGH":   1.5,
}


def calculate_hybrid_recommendation(growth_stage: str, ai_prediction: str, confidence: float) -> dict:
    """
    Combines agronomic base requirements with AI-predicted adjustment factor
    to produce the final N-P-K fertilizer recommendation.

    Parameters:
        growth_stage  (str):   Current crop stage — "Germination", "Vegetative", "Flowering", or "Fruiting"
        ai_prediction (str):   ML model output — "LOW", "MEDIUM", or "HIGH"
        confidence    (float): ML model confidence — e.g., 82.5

    Returns:
        dict: Complete hybrid recommendation with individual N-P-K amounts
    """

    # ── Look up base requirements ──
    base = BASE_STAGE_REQUIREMENTS.get(growth_stage)
    if not base:
        # Fallback to Vegetative if unknown stage
        base = BASE_STAGE_REQUIREMENTS["Vegetative"]

    # ── Look up AI adjustment factor ──
    factor = AI_ADJUSTMENT_FACTORS.get(ai_prediction, 1.0)

    # ── Calculate final doses: Final = Base × Factor ──
    final_nitrogen   = round(base["nitrogen"]   * factor, 1)
    final_phosphorus = round(base["phosphorus"] * factor, 1)
    final_potassium  = round(base["potassium"]  * factor, 1)
    total_amount     = round(final_nitrogen + final_phosphorus + final_potassium, 1)

    # ── Build a human-readable reason ──
    factor_label = {
        "LOW":    "favorable (reduced dose)",
        "MEDIUM": "normal (standard dose)",
        "HIGH":   "stressed (increased dose)",
    }

    reason = (
        f"{base['description']} "
        f"AI detected {factor_label.get(ai_prediction, 'normal')} conditions "
        f"(confidence: {confidence}%), applying {factor}× adjustment."
    )

    return {
        # ── Core recommendation ──
        "recommendation": ai_prediction,
        "confidence": confidence,
        "reason": reason,

        # ── Hybrid engine details ──
        "growth_stage_used": growth_stage,
        "adjustment_factor": factor,

        # ── Base requirements (before AI adjustment) ──
        "base_nitrogen_kg_per_acre":   base["nitrogen"],
        "base_phosphorus_kg_per_acre": base["phosphorus"],
        "base_potassium_kg_per_acre":  base["potassium"],

        # ── Final recommendations (after AI adjustment) ──
        "nitrogen_kg_per_acre":   final_nitrogen,
        "phosphorus_kg_per_acre": final_phosphorus,
        "potassium_kg_per_acre":  final_potassium,
        "total_kg_per_acre":      total_amount,
    }
