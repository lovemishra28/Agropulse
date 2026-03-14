"""
═══════════════════════════════════════════════════════════
  AgroPulse — Verification Script for Gap 1 & Gap 2
═══════════════════════════════════════════════════════════

Run this from the fertigation-backend folder:
    python test_gaps.py

This tests ONLY the new services (no database, no server needed).
If all tests pass, the logic is correct.
"""

import sys
from datetime import date, timedelta

# ── Make sure Python can find our app modules ──
sys.path.insert(0, ".")

from app.services.growth_stage_service import calculate_growth_stage, get_supported_crops
from app.services.hybrid_recommendation_service import calculate_hybrid_recommendation

passed = 0
failed = 0

def test(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  ✅ PASS: {name}")
        passed += 1
    else:
        print(f"  ❌ FAIL: {name} — {detail}")
        failed += 1


# ═══════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  GAP 1: Growth Stage Calculation Engine")
print("="*60)

# Test 1: Supported crops list
crops = get_supported_crops()
test("Supported crops returns a list", isinstance(crops, list) and len(crops) >= 8,
     f"Got {len(crops)} crops, expected at least 8")

# Test 2: Tomato at day 0 should be Germination
seed_today = str(date.today())
result = calculate_growth_stage("Tomato", seed_today)
test("Tomato sowed today → Germination",
     result["growth_stage"] == "Germination",
     f"Got: {result['growth_stage']}")
test("Days after sowing = 0",
     result["days_after_sowing"] == 0,
     f"Got: {result['days_after_sowing']}")

# Test 3: Tomato at day 20 should be Vegetative
seed_20_days_ago = str(date.today() - timedelta(days=20))
result = calculate_growth_stage("Tomato", seed_20_days_ago)
test("Tomato sowed 20 days ago → Vegetative",
     result["growth_stage"] == "Vegetative",
     f"Got: {result['growth_stage']}")
test("Days after sowing = 20",
     result["days_after_sowing"] == 20,
     f"Got: {result['days_after_sowing']}")

# Test 4: Tomato at day 50 should be Flowering
seed_50_days_ago = str(date.today() - timedelta(days=50))
result = calculate_growth_stage("Tomato", seed_50_days_ago)
test("Tomato sowed 50 days ago → Flowering",
     result["growth_stage"] == "Flowering",
     f"Got: {result['growth_stage']}")

# Test 5: Tomato at day 80 should be Fruiting
seed_80_days_ago = str(date.today() - timedelta(days=80))
result = calculate_growth_stage("Tomato", seed_80_days_ago)
test("Tomato sowed 80 days ago → Fruiting",
     result["growth_stage"] == "Fruiting",
     f"Got: {result['growth_stage']}")

# Test 6: Progress percentage makes sense
test("Stage progress is between 0 and 100",
     0 <= result["stage_progress"] <= 100,
     f"Got: {result['stage_progress']}")

# Test 7: Unknown crop falls back to default timeline
result = calculate_growth_stage("Mango", str(date.today()))
test("Unknown crop 'Mango' still returns a result",
     result["growth_stage"] == "Germination",
     f"Got: {result['growth_stage']}")

# Test 8: Future seed date handled gracefully
future_date = str(date.today() + timedelta(days=10))
result = calculate_growth_stage("Tomato", future_date)
test("Future seed date → days_after_sowing = 0",
     result["days_after_sowing"] == 0,
     f"Got: {result['days_after_sowing']}")

# Test 9: All stages are returned
test("all_stages list has 4 entries",
     len(result["all_stages"]) == 4,
     f"Got: {len(result['all_stages'])}")


# ═══════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  GAP 2: Hybrid Recommendation Engine")
print("="*60)

# Test 10: Vegetative + HIGH → factor 1.5
hybrid = calculate_hybrid_recommendation("Vegetative", "HIGH", 85.0)
test("Vegetative + HIGH → adjustment_factor = 1.5",
     hybrid["adjustment_factor"] == 1.5,
     f"Got: {hybrid['adjustment_factor']}")
test("Vegetative + HIGH → nitrogen = 25 * 1.5 = 37.5",
     hybrid["nitrogen_kg_per_acre"] == 37.5,
     f"Got: {hybrid['nitrogen_kg_per_acre']}")
test("Vegetative + HIGH → phosphorus = 10 * 1.5 = 15.0",
     hybrid["phosphorus_kg_per_acre"] == 15.0,
     f"Got: {hybrid['phosphorus_kg_per_acre']}")
test("Vegetative + HIGH → potassium = 15 * 1.5 = 22.5",
     hybrid["potassium_kg_per_acre"] == 22.5,
     f"Got: {hybrid['potassium_kg_per_acre']}")
test("Vegetative + HIGH → total = 75.0",
     hybrid["total_kg_per_acre"] == 75.0,
     f"Got: {hybrid['total_kg_per_acre']}")

# Test 11: Germination + LOW → factor 0.5
hybrid = calculate_hybrid_recommendation("Germination", "LOW", 90.0)
test("Germination + LOW → adjustment_factor = 0.5",
     hybrid["adjustment_factor"] == 0.5,
     f"Got: {hybrid['adjustment_factor']}")
test("Germination + LOW → nitrogen = 5 * 0.5 = 2.5",
     hybrid["nitrogen_kg_per_acre"] == 2.5,
     f"Got: {hybrid['nitrogen_kg_per_acre']}")
test("Germination + LOW → total = 10.0",
     hybrid["total_kg_per_acre"] == 10.0,
     f"Got: {hybrid['total_kg_per_acre']}")

# Test 12: Flowering + MEDIUM → factor 1.0 (no change from base)
hybrid = calculate_hybrid_recommendation("Flowering", "MEDIUM", 75.0)
test("Flowering + MEDIUM → adjustment_factor = 1.0",
     hybrid["adjustment_factor"] == 1.0,
     f"Got: {hybrid['adjustment_factor']}")
test("Flowering + MEDIUM → nitrogen = base 10",
     hybrid["nitrogen_kg_per_acre"] == 10.0,
     f"Got: {hybrid['nitrogen_kg_per_acre']}")
test("Flowering + MEDIUM → phosphorus = base 25",
     hybrid["phosphorus_kg_per_acre"] == 25.0,
     f"Got: {hybrid['phosphorus_kg_per_acre']}")

# Test 13: Fruiting + HIGH → heavy potassium
hybrid = calculate_hybrid_recommendation("Fruiting", "HIGH", 80.0)
test("Fruiting + HIGH → potassium = 30 * 1.5 = 45.0",
     hybrid["potassium_kg_per_acre"] == 45.0,
     f"Got: {hybrid['potassium_kg_per_acre']}")

# Test 14: Reason string is generated
test("Reason string is non-empty",
     len(hybrid["reason"]) > 20,
     f"Got: '{hybrid['reason']}'")

# Test 15: Base values are preserved in response
test("Base nitrogen is present",
     hybrid["base_nitrogen_kg_per_acre"] == 15,
     f"Got: {hybrid.get('base_nitrogen_kg_per_acre')}")


# ═══════════════════════════════════════════════════════════
print("\n" + "="*60)
print(f"  RESULTS: {passed} passed, {failed} failed")
print("="*60)

if failed == 0:
    print("\n  🎉 All tests passed! Gap 1 and Gap 2 are working correctly.\n")
else:
    print(f"\n  ⚠️  {failed} test(s) failed. Review the errors above.\n")
