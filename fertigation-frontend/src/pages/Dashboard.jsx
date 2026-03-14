import { useEffect, useState, useCallback } from "react"
import { getSensorData, getRecommendation } from "../services/api"
import SensorCard from "../components/SensorCard"
import RecommendationCard from "../components/RecommendationCard"
import SensorChart from "../components/SensorChart"
import FertigationControl from "../components/FertigationControl"
import AlertPanel from "../components/AlertPanel"
import FertigationHistory from "../components/FertigationHistory"
import CropSetup from "../components/CropSetup"
import GrowthStageCard from "../components/GrowthStageCard"
import SimulatorPanel from "../components/SimulatorPanel"
import RecommendationHistory from "../components/RecommendationHistory"
import ExportPanel from "../components/ExportPanel"

function Dashboard() {

  const [sensorData, setSensorData] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [sensorHistory, setSensorHistory] = useState([])
  const [growthStage, setGrowthStage] = useState(null)
  const [sensorFilter, setSensorFilter] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const sensorResponse = await getSensorData(sensorFilter)
      const recommendationResponse = await getRecommendation()

      const data = sensorResponse.data
      const latestSensor = data.length > 0 ? data[data.length - 1] : null

      setSensorData(latestSensor)
      setSensorHistory(data)

      const recData = recommendationResponse.data
      setRecommendation(recData)

      if (recData && recData.growth_stage) {
        setGrowthStage(recData.growth_stage)
      }
    } catch (error) {
      console.error("API Error:", error)
    }
  }, [sensorFilter])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => { fetchData() }, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleSensorFilter = (hours) => {
    setSensorFilter(hours)
  }

  return (
    <div className="dashboard">

      <h2 className="dashboard-title">📊 Smart Fertigation Dashboard</h2>
      <p className="dashboard-subtitle">Real-time monitoring, AI-powered recommendations, and precision fertigation control</p>

      {/* Simulator — for demo without hardware */}
      <SimulatorPanel />

      {/* Crop Profile Setup */}
      <CropSetup onProfileSaved={fetchData} />

      {/* Sensor Cards */}
      {sensorData && (
        <div className="sensor-grid">
          <SensorCard title="Soil Moisture" value={sensorData.soil_moisture} unit="%" />
          <SensorCard title="Temperature" value={sensorData.temperature} unit="°C" />
          <SensorCard title="Humidity" value={sensorData.humidity} unit="%" />
          <SensorCard title="Light" value={sensorData.light_intensity} unit="lux" />
        </div>
      )}

      {/* Growth Stage Tracker */}
      <GrowthStageCard growthData={growthStage} />

      {/* AI Recommendation */}
      <RecommendationCard data={recommendation} />

      {/* Sensor Chart with Time Filter */}
      <SensorChart data={sensorHistory} onFilterChange={handleSensorFilter} />

      {/* Controls */}
      <FertigationControl />

      {/* Alerts */}
      <AlertPanel />

      {/* Export Data */}
      <ExportPanel />

      {/* Recommendation History */}
      <RecommendationHistory />

      {/* Fertigation History */}
      <FertigationHistory />

    </div>
  )
}

export default Dashboard