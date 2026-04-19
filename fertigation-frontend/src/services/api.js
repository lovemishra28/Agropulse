import axios from "axios"

const BASE = "http://127.0.0.1:8000"

const API = axios.create({ baseURL: BASE })

// Sensor data
export const getSensorData = (hours) =>
  API.get("/sensor-data", { params: hours ? { hours } : {} })

// AI recommendation
export const getRecommendation = (cropType, seedDate) => 
  API.get("/recommendation", { params: { crop_type: cropType, seed_date: seedDate } })

// Crop profile
export const getCropProfile = () => API.get("/crop-profile")
export const setCropProfile = (data) => API.post("/crop-profile", data)
export const getSupportedCrops = () => API.get("/supported-crops")
export const getGrowthStage = (cropType, seedDate) => 
  API.get("/growth-stage", { params: { crop_type: cropType, seed_date: seedDate } })

// Alerts
export const getAlerts = () => API.get("/alerts")

// Fertigation
export const startFertigation = () => API.post("/fertigate")
export const getFertigationHistory = () => API.get("/fertigation-history")

// Simulator
export const startSimulator = (interval = 5) =>
  API.post(`/simulator/start?interval=${interval}`)
export const stopSimulator = () => API.post("/simulator/stop")
export const getSimulatorStatus = () => API.get("/simulator/status")

// History
export const getRecommendationHistory = (hours, limit = 50) =>
  API.get("/recommendation-history", { params: { hours, limit } })

// Export URLs
export const EXPORT_SENSOR_URL = `${BASE}/export/sensor-data`
export const EXPORT_RECOMMENDATIONS_URL = `${BASE}/export/recommendations`