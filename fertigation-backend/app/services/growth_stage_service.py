from datetime import date, datetime

# ─────────────────────────────────────────────────────────────
# CROP GROWTH STAGE TIMELINES
# Each crop maps to a list of (stage_name, end_day) tuples.
# The stages are in order; the first stage whose end_day >= DAS
# (Days After Sowing) is the current stage.
# The last stage has no upper bound (uses float('inf')).
#
# Sources: General agronomic references.
# You can add more crops anytime by following the same pattern.
# ─────────────────────────────────────────────────────────────

CROP_STAGE_TIMELINES = {

    "Tomato": [
        {"stage": "Germination",  "start_day": 0,  "end_day": 14},
        {"stage": "Vegetative",   "start_day": 15, "end_day": 40},
        {"stage": "Flowering",    "start_day": 41, "end_day": 65},
        {"stage": "Fruiting",     "start_day": 66, "end_day": float('inf')},
    ],

    "Wheat": [
        {"stage": "Germination",  "start_day": 0,  "end_day": 10},
        {"stage": "Vegetative",   "start_day": 11, "end_day": 55},
        {"stage": "Flowering",    "start_day": 56, "end_day": 75},
        {"stage": "Fruiting",     "start_day": 76, "end_day": float('inf')},
    ],

    "Rice": [
        {"stage": "Germination",  "start_day": 0,  "end_day": 12},
        {"stage": "Vegetative",   "start_day": 13, "end_day": 50},
        {"stage": "Flowering",    "start_day": 51, "end_day": 70},
        {"stage": "Fruiting",     "start_day": 71, "end_day": float('inf')},
    ],

    "Corn": [
        {"stage": "Germination",  "start_day": 0,  "end_day": 10},
        {"stage": "Vegetative",   "start_day": 11, "end_day": 50},
        {"stage": "Flowering",    "start_day": 51, "end_day": 70},
        {"stage": "Fruiting",     "start_day": 71, "end_day": float('inf')},
    ],

    "Cucumber": [
        {"stage": "Germination",  "start_day": 0,  "end_day": 7},
        {"stage": "Vegetative",   "start_day": 8,  "end_day": 30},
        {"stage": "Flowering",    "start_day": 31, "end_day": 45},
        {"stage": "Fruiting",     "start_day": 46, "end_day": float('inf')},
    ],

    "Pepper": [
        {"stage": "Germination",  "start_day": 0,  "end_day": 14},
        {"stage": "Vegetative",   "start_day": 15, "end_day": 45},
        {"stage": "Flowering",    "start_day": 46, "end_day": 65},
        {"stage": "Fruiting",     "start_day": 66, "end_day": float('inf')},
    ],

    "Lettuce": [
        {"stage": "Germination",  "start_day": 0,  "end_day": 7},
        {"stage": "Vegetative",   "start_day": 8,  "end_day": 40},
        {"stage": "Flowering",    "start_day": 41, "end_day": 55},
        {"stage": "Fruiting",     "start_day": 56, "end_day": float('inf')},
    ],

    "Potato": [
        {"stage": "Germination",  "start_day": 0,  "end_day": 15},
        {"stage": "Vegetative",   "start_day": 16, "end_day": 45},
        {"stage": "Flowering",    "start_day": 46, "end_day": 65},
        {"stage": "Fruiting",     "start_day": 66, "end_day": float('inf')},
    ],
}

# Fallback timeline used when a crop type isn't in the dictionary above
DEFAULT_TIMELINE = [
    {"stage": "Germination",  "start_day": 0,  "end_day": 12},
    {"stage": "Vegetative",   "start_day": 13, "end_day": 45},
    {"stage": "Flowering",    "start_day": 46, "end_day": 65},
    {"stage": "Fruiting",     "start_day": 66, "end_day": float('inf')},
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
            "stage_day":       19,       # days into current stage
            "stage_total_days": 25,      # total days in current stage
            "stage_progress":  76.0,     # percentage through current stage
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
    days_after_sowing = (today - seed_date).days

    # Clamp to 0 if seed_date is in the future
    if days_after_sowing < 0:
        days_after_sowing = 0

    # ── Look up the crop timeline (fall back to default) ──
    timeline = CROP_STAGE_TIMELINES.get(crop_type, DEFAULT_TIMELINE)

    # ── Find the current stage ──
    current_stage = timeline[-1]  # default to last stage
    for stage_info in timeline:
        if days_after_sowing <= stage_info["end_day"]:
            current_stage = stage_info
            break

    # ── Calculate progress within the current stage ──
    stage_start = current_stage["start_day"]
    stage_end = current_stage["end_day"]

    stage_day = days_after_sowing - stage_start  # how many days into this stage

    if stage_end == float('inf'):
        # For the last stage, we can't calculate a true percentage
        # Use a reasonable cap (e.g., 120 days total crop cycle)
        estimated_end = stage_start + 60
        stage_total_days = 60
        stage_progress = min(round((stage_day / stage_total_days) * 100, 1), 100.0)
    else:
        stage_total_days = stage_end - stage_start + 1
        stage_progress = round((stage_day / stage_total_days) * 100, 1)

    return {
        "crop_type": crop_type,
        "seed_date": str(seed_date),
        "days_after_sowing": days_after_sowing,
        "growth_stage": current_stage["stage"],
        "stage_start_day": stage_start,
        "stage_end_day": stage_end if stage_end != float('inf') else None,
        "stage_day": stage_day,
        "stage_total_days": stage_total_days,
        "stage_progress": stage_progress,
        "all_stages": [
            {
                "stage": s["stage"],
                "start_day": s["start_day"],
                "end_day": s["end_day"] if s["end_day"] != float('inf') else None,
            }
            for s in timeline
        ],
    }
