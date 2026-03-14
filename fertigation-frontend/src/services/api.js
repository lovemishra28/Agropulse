import axios from "axios"

// This creates a shortcut to your FastAPI backend
const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
})

// Sensor data (supports ?hours= for date range filtering)
export const getSensorData = (hours) =>
  API.get("/sensor-data", { params: hours ? { hours } : {} })

// AI + Hybrid recommendation
export const getRecommendation = () => API.get("/recommendation")

// Crop profile management
export const getCropProfile = () => API.get("/crop-profile")
export const setCropProfile = (data) => API.post("/crop-profile", data)
export const getSupportedCrops = () => API.get("/supported-crops")

// Alerts
export const getAlerts = () => API.get("/alerts")

// Fertigation control
export const startFertigation = () => API.post("/fertigate")
export const getFertigationHistory = () => API.get("/fertigation-history")

// Simulator
export const startSimulator = (interval = 5) =>
  API.post(`/simulator/start?interval=${interval}`)
export const stopSimulator = () => API.post("/simulator/stop")
export const getSimulatorStatus = () => API.get("/simulator/status")

// Recommendation history
export const getRecommendationHistory = (hours, limit = 50) =>
  API.get("/recommendation-history", { params: { hours, limit } })

// CSV Export — returns the download URL (browser handles the download)
export const EXPORT_SENSOR_URL = "http://127.0.0.1:8000/export/sensor-data"
export const EXPORT_RECOMMENDATIONS_URL = "http://127.0.0.1:8000/export/recommendations"