from fastapi import APIRouter
from app.services.simulator_service import start_simulator, stop_simulator, get_simulator_status

router = APIRouter(prefix="/simulator", tags=["Simulator"])

@router.post("/start")
def start(interval: int = 5):
    """Start the sensor data simulator. Interval is in seconds (default: 5)."""
    return start_simulator(interval)

@router.post("/stop")
def stop():
    """Stop the sensor data simulator."""
    return stop_simulator()

@router.get("/status")
def status():
    """Check if the simulator is currently running."""
    return get_simulator_status()
