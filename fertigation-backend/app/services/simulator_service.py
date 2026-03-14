import threading
import time
import math
import random
from datetime import datetime
from app.database import sensor_collection

# ─────────────────────────────────────────────────────────────
# PICO W SENSOR SIMULATOR
# Generates realistic, gradually-changing sensor readings
# so you can demo the dashboard without real hardware.
# ─────────────────────────────────────────────────────────────

_simulator_thread = None
_simulator_running = False
_interval_seconds = 5  # How often to generate data


def _generate_reading(tick: int) -> dict:
    """
    Produces a realistic sensor reading that changes smoothly over time.
    Uses sine waves + small random noise to simulate a real field environment.
    """
    # Base values oscillate throughout the "day" (one full cycle = 120 ticks ≈ 10 min)
    t = tick / 120.0 * 2 * math.pi

    soil_moisture = round(
        50 + 15 * math.sin(t * 0.7) + random.uniform(-2, 2), 1
    )

    temperature = round(
        28 + 7 * math.sin(t) + random.uniform(-1, 1), 1
    )

    humidity = round(
        60 + 12 * math.sin(t * 0.5 + 1) + random.uniform(-2, 2), 1
    )

    # Light intensity follows a day/night pattern
    light_raw = 400 + 300 * math.sin(t * 0.3)
    light_intensity = max(0, round(light_raw + random.uniform(-20, 20), 0))

    # Clamp values to realistic ranges
    soil_moisture = max(10, min(95, soil_moisture))
    temperature = max(10, min(45, temperature))
    humidity = max(20, min(98, humidity))

    return {
        "timestamp": datetime.utcnow(),
        "soil_moisture": soil_moisture,
        "temperature": temperature,
        "humidity": humidity,
        "light_intensity": light_intensity,
    }


def _simulator_loop():
    """Background loop that inserts sensor data at regular intervals."""
    global _simulator_running
    tick = 0
    while _simulator_running:
        reading = _generate_reading(tick)
        sensor_collection.insert_one(reading)
        tick += 1
        time.sleep(_interval_seconds)


def start_simulator(interval: int = 5):
    """Start the background simulator thread."""
    global _simulator_thread, _simulator_running, _interval_seconds

    if _simulator_running:
        return {"status": "already_running"}

    _interval_seconds = interval
    _simulator_running = True
    _simulator_thread = threading.Thread(target=_simulator_loop, daemon=True)
    _simulator_thread.start()

    return {"status": "started", "interval_seconds": interval}


def stop_simulator():
    """Stop the background simulator thread."""
    global _simulator_running

    if not _simulator_running:
        return {"status": "already_stopped"}

    _simulator_running = False
    return {"status": "stopped"}


def get_simulator_status():
    """Check if the simulator is currently running."""
    return {
        "running": _simulator_running,
        "interval_seconds": _interval_seconds,
    }
