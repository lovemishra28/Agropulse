import { useEffect, useState } from "react"
import { startSimulator, stopSimulator, getSimulatorStatus } from "../services/api"

function SimulatorPanel() {

  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const res = await getSimulatorStatus()
      setRunning(res.data.running)
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (running) {
        await stopSimulator()
        setRunning(false)
      } else {
        await startSimulator(5)
        setRunning(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
      <div>
        <h3 className="card-title">🔬 Pico W Sensor Simulator</h3>
        <p style={{ fontSize: "0.82em", color: "var(--text-muted)", marginTop: "4px" }}>
          {running
            ? "Simulator is running — generating realistic sensor data every 5 seconds"
            : "Start the simulator to auto-generate sensor data for demo purposes"
          }
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{
          width: "10px", height: "10px", borderRadius: "50%",
          background: running ? "var(--color-success)" : "var(--text-muted)",
          boxShadow: running ? "0 0 8px var(--color-success)" : "none",
          transition: "all 0.3s"
        }}></span>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`btn ${running ? "btn-danger" : "btn-success"}`}
          style={running ? { background: "var(--color-danger)" } : {}}
        >
          {loading ? "..." : running ? "⏹ Stop" : "▶ Start"}
        </button>
      </div>
    </div>
  )
}

export default SimulatorPanel
