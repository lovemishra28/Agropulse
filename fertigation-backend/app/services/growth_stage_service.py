from datetime import date, datetime

# ─────────────────────────────────────────────────────────────
# CROP GROWTH STAGE TIMELINES
# Every stage uses a 1-based day counting system.
# Day 1 is the day the seed is sown.
#
# Lifespan values are derived from agronomic research data:
#   Tomato  → 60-140 days (avg ~130 for field-grown determinate)
#   Wheat   → 100-130 days (spring wheat)
#   Rice    → 90-150 days (medium-duration variety ~130)
#   Corn    → 80-115 days (field corn, mid-season hybrid ~110)
#   Cucumber→ 50-70 days (avg ~65)
#   Pepper  → 90-150 days (bell pepper, green maturity ~120)
#   Lettuce → 45-80 days (head lettuce ~70)
#   Potato  → 70-130 days (mid-season ~100)
# ─────────────────────────────────────────────────────────────

CROP_STAGE_TIMELINES = {

    # Tomato: total lifespan ≈ 130 days (field-grown determinate)
    # Germination 5-10d, Seedling+Vegetative 25-35d, Flowering 20-30d, Fruit Dev+Ripening 40-55d
    "Tomato": [
        {"stage": "Germination",  "start_day": 1,   "end_day": 10},
        {"stage": "Vegetative",   "start_day": 11,  "end_day": 40},
        {"stage": "Flowering",    "start_day": 41,  "end_day": 70},
        {"stage": "Fruiting",     "start_day": 71,  "end_day": 120},
        {"stage": "Harvested",    "start_day": 121, "end_day": 130},
    ],

    # Wheat (spring): total lifespan ≈ 120 days
    # Germination+Emergence 7-15d, Vegetative+Tillering 25-45d, Heading+Flowering 5-15d, Grain Filling 15-30d
    "Wheat": [
        {"stage": "Germination",  "start_day": 1,   "end_day": 12},
        {"stage": "Vegetative",   "start_day": 13,  "end_day": 55},
        {"stage": "Flowering",    "start_day": 56,  "end_day": 70},
        {"stage": "Fruiting",     "start_day": 71,  "end_day": 110},
        {"stage": "Harvested",    "start_day": 111, "end_day": 120},
    ],

    # Rice (medium-duration): total lifespan ≈ 130 days
    # Germination 7-14d, Seedling+Tillering 30-45d, Reproductive+Flowering 20-30d, Grain Filling 25-35d
    "Rice": [
        {"stage": "Germination",  "start_day": 1,   "end_day": 14},
        {"stage": "Vegetative",   "start_day": 15,  "end_day": 55},
        {"stage": "Flowering",    "start_day": 56,  "end_day": 85},
        {"stage": "Fruiting",     "start_day": 86,  "end_day": 120},
        {"stage": "Harvested",    "start_day": 121, "end_day": 130},
    ],

    # Corn (field corn, mid-season): total lifespan ≈ 110 days
    # Emergence 4-14d, Vegetative V1-VT 30-40d, Flowering R1 5-10d, Grain Fill R2-R6 40-55d
    "Corn": [
        {"stage": "Germination",  "start_day": 1,   "end_day": 12},
        {"stage": "Vegetative",   "start_day": 13,  "end_day": 50},
        {"stage": "Flowering",    "start_day": 51,  "end_day": 60},
        {"stage": "Fruiting",     "start_day": 61,  "end_day": 100},
        {"stage": "Harvested",    "start_day": 101, "end_day": 110},
    ],

    # Cucumber: total lifespan ≈ 65 days
    # Germination 3-10d, Seedling+Vegetative 14-25d, Flowering 10-15d, Fruiting 8-12d
    "Cucumber": [
        {"stage": "Germination",  "start_day": 1,   "end_day": 8},
        {"stage": "Vegetative",   "start_day": 9,   "end_day": 30},
        {"stage": "Flowering",    "start_day": 31,  "end_day": 45},
        {"stage": "Fruiting",     "start_day": 46,  "end_day": 58},
        {"stage": "Harvested",    "start_day": 59,  "end_day": 65},
    ],

    # Bell Pepper: total lifespan ≈ 120 days
    # Germination 7-21d, Seedling+Vegetative 28-50d, Flowering 14-21d, Fruiting 28-42d
    "Pepper": [
        {"stage": "Germination",  "start_day": 1,   "end_day": 14},
        {"stage": "Vegetative",   "start_day": 15,  "end_day": 50},
        {"stage": "Flowering",    "start_day": 51,  "end_day": 70},
        {"stage": "Fruiting",     "start_day": 71,  "end_day": 110},
        {"stage": "Harvested",    "start_day": 111, "end_day": 120},
    ],

    # Lettuce (head lettuce): total lifespan ≈ 70 days
    # Germination 2-10d, Seedling+Vegetative(Rosette) 20-35d, Cupping/Heading 15-20d, Maturity ~5-10d
    "Lettuce": [
        {"stage": "Germination",  "start_day": 1,   "end_day": 8},
        {"stage": "Vegetative",   "start_day": 9,   "end_day": 35},
        {"stage": "Flowering",    "start_day": 36,  "end_day": 52},
        {"stage": "Fruiting",     "start_day": 53,  "end_day": 63},
        {"stage": "Harvested",    "start_day": 64,  "end_day": 70},
    ],

    # Potato (mid-season): total lifespan ≈ 100 days
    # Sprout Development 14-30d, Vegetative+Stolons 21-35d, Tuber Init 10-14d, Bulking+Maturation 30-45d
    "Potato": [
        {"stage": "Germination",  "start_day": 1,   "end_day": 20},
        {"stage": "Vegetative",   "start_day": 21,  "end_day": 45},
        {"stage": "Flowering",    "start_day": 46,  "end_day": 55},
        {"stage": "Fruiting",     "start_day": 56,  "end_day": 90},
        {"stage": "Harvested",    "start_day": 91,  "end_day": 100},
    ],
}

# Fallback timeline used when a crop type isn't in the dictionary above
DEFAULT_TIMELINE = [
    {"stage": "Germination",  "start_day": 1,   "end_day": 12},
    {"stage": "Vegetative",   "start_day": 13,  "end_day": 45},
    {"stage": "Flowering",    "start_day": 46,  "end_day": 65},
    {"stage": "Fruiting",     "start_day": 66,  "end_day": 90},
    {"stage": "Harvested",    "start_day": 91,  "end_day": 100},
]


def get_supported_crops():
    """Returns a list of all crop types that have defined timelines."""
    return list(CROP_STAGE_TIMELINES.keys())


def calculate_growth_stage(crop_type: str, seed_date) -> dict:
    """
    Calculates the current growth stage based on crop type and sowing date.

    Parameters:
        crop_type (str): The name of the crop (e.g., "Tomato", "Wheat")
        seed_date (str | date | datetime): The date when seeds were sown

    Returns:
        dict: {
            "crop_type":       "Tomato",
            "seed_date":       "2026-01-15",
            "days_after_sowing": 59,
            "growth_stage":    "Flowering",
            "stage_start_day": 41,
            "stage_end_day":   65,
            "max_lifespan":    130,
            "stage_day":       19,       # days into current stage (1-based)
            "stage_total_days": 25,      # total days in current stage
            "stage_progress":  76.0,     # percentage through current stage
            "overall_progress": 45.4,    # plant age / total lifespan * 100
            "lifecycle_complete": False, # True when crop exceeds final stage
            "all_stages":      [...]     # full timeline for reference
        }
    """

    # ── Parse seed_date into a date object ──
    if isinstance(seed_date, str):
        # Handle both "2026-01-15" and "2026-01-15T00:00:00" formats
        seed_date = datetime.fromisoformat(seed_date).date()
    elif isinstance(seed_date, datetime):
        seed_date = seed_date.date()

    # ── Calculate days after sowing ──
    today = date.today()
    # 1-based counting: the day the seed is planted is Day 1
    days_after_sowing = (today - seed_date).days + 1

    # Clamp to 1 if seed_date is somehow in the future
    if days_after_sowing < 1:
        days_after_sowing = 1

    # ── Look up the crop timeline (fall back to default) ──
    timeline = CROP_STAGE_TIMELINES.get(crop_type, DEFAULT_TIMELINE)

    # ── Determine the maximum lifespan from the last stage ──
    max_lifespan = timeline[-1]["end_day"]

    # ── Check if the lifecycle is complete (past final stage) ──
    lifecycle_complete = days_after_sowing > max_lifespan

    # ── Find the current stage ──
    current_stage = timeline[-1]  # default to last stage (Harvested)
    for stage_info in timeline:
        if days_after_sowing <= stage_info["end_day"]:
            current_stage = stage_info
            break

    # ── Calculate progress within the current stage ──
    stage_start = current_stage["start_day"]
    stage_end = current_stage["end_day"]

    # Simple delta: if currently on start_day, you've completed 1 day of this stage
    stage_day = days_after_sowing - stage_start + 1

    stage_total_days = stage_end - stage_start + 1

    if lifecycle_complete:
        # Crop is past the final stage — clamp everything to completion
        stage_day = stage_total_days
        stage_progress = 100.0
    else:
        stage_progress = min(round((stage_day / stage_total_days) * 100, 1), 100.0)

    # ── Calculate overall progress for UI visualization ──
    # Real-world logical percentage: Plant Age / Total Lifespan
    if lifecycle_complete:
        overall_progress = 100.0
    else:
        overall_progress = min(round((days_after_sowing / max_lifespan) * 100, 1), 100.0)

    return {
        "crop_type": crop_type,
        "seed_date": str(seed_date),
        "days_after_sowing": days_after_sowing,
        "growth_stage": current_stage["stage"],
        "stage_start_day": stage_start,
        "stage_end_day": stage_end,
        "max_lifespan": max_lifespan,
        "stage_day": min(stage_day, stage_total_days),
        "stage_total_days": stage_total_days,
        "stage_progress": stage_progress,
        "overall_progress": overall_progress,
        "lifecycle_complete": lifecycle_complete,
        "all_stages": timeline,
    }
