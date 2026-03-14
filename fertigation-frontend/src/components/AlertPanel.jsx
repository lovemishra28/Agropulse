import { useEffect, useState } from "react"
import { getAlerts } from "../services/api"

function AlertPanel() {

  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const res = await getAlerts()
      setAlerts(res.data.alerts)
    } catch (error) {
      console.error(error)
    }
  }

  if (alerts.length === 0) return null

  return (
    <div className="alert-panel">
      <h3 className="alert-panel-title">🚨 Active Alerts</h3>
      {alerts.map((alert, index) => (
        <div key={index} className="alert-item">{alert}</div>
      ))}
    </div>
  )
}

export default AlertPanel