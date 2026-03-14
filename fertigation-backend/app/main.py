from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    sensor_routes, crop_routes, recommendation_routes,
    control_routes, alert_routes, simulator_routes,
    history_routes, export_routes
)

app = FastAPI()

# --- CORS FIX START ---
# This allows your React app (running on localhost:5173) 
# to talk to your FastAPI backend safely.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- CORS FIX END ---

app.include_router(sensor_routes.router)
app.include_router(crop_routes.router)
app.include_router(recommendation_routes.router)
app.include_router(control_routes.router)
app.include_router(alert_routes.router)
app.include_router(simulator_routes.router)
app.include_router(history_routes.router)
app.include_router(export_routes.router)

@app.get("/")
def root():
    return {"message": "Fertigation backend running"}