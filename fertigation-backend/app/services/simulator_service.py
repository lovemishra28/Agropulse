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
    # Cycle through all moods over a 2.5 minute period (30 ticks = 150 seconds)
    t = (tick % 30) / 30.0 * 2 * math.pi
    
    # We want conditions to smoothly go from perfect to terrible and back.
    # Perfect values (Yields ~100 Health Score -> Happy)
    ideal_sm = 55
    ideal_temp = 27
    ideal_hum = 60
    ideal_light = 400
    ideal_n = 45
    ideal_p = 25
    ideal_k = 30

    # Terrible values (Yields ~10 Health Score -> Sad)
    bad_sm = 10
    bad_temp = 45
    bad_hum = 20
    bad_light = 50
    bad_n = 10
    bad_p = 5
    bad_k = 5

    # sin(t) naturally goes from 0 -> 1 -> 0 -> -1 -> 0
    sin_val = math.sin(t)
    
    # Map [-1, 1] to [0, 1] as an interpolation factor (1 is ideal, 0 is bad)
    factor = (sin_val + 1) / 2.0
    
    soil_moisture = round(bad_sm + (ideal_sm - bad_sm) * factor + random.uniform(-2, 2), 1)
    temperature = round(bad_temp + (ideal_temp - bad_temp) * factor + random.uniform(-1, 1), 1)
    humidity = round(bad_hum + (ideal_hum - bad_hum) * factor + random.uniform(-2, 2), 1)
    light_intensity = round(bad_light + (ideal_light - bad_light) * factor + random.uniform(-10, 10), 0)
    nitrogen = round(bad_n + (ideal_n - bad_n) * factor + random.uniform(-1, 2), 1)
    phosphorus = round(bad_p + (ideal_p - bad_p) * factor + random.uniform(-1, 1), 1)
    potassium = round(bad_k + (ideal_k - bad_k) * factor + random.uniform(-1, 2), 1)

    # Clamp values to logical realistic ranges just in case
    soil_moisture = max(0, min(100, soil_moisture))
    temperature = max(0, min(60, temperature))
    humidity = max(0, min(100, humidity))
    nitrogen = max(0, min(100, nitrogen))
    phosphorus = max(0, min(100, phosphorus))
    potassium = max(0, min(100, potassium))

    return {
        "timestamp": datetime.utcnow(),
        "soil_moisture": soil_moisture,
        "temperature": temperature,
        "humidity": humidity,
        "light_intensity": light_intensity,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
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
