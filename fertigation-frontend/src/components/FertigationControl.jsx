import { startFertigation as triggerFertigation } from "../services/api"

function FertigationControl() {

  const handleStart = async () => {
    try {
      const response = await triggerFertigation()
      alert(response.data.status)
    } catch (error) {
      console.error(error)
      alert("Error starting fertigation")
    }
  }

  return (
    <div className="section">
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 className="card-title">💧 Fertigation Control</h3>
          <p style={{ fontSize: "0.82em", color: "var(--text-muted)", marginTop: "4px" }}>
            Manually trigger the fertigation pump system
          </p>
        </div>
        <button onClick={handleStart} className="btn btn-success">
          ▶ Start Fertigation
        </button>
      </div>
    </div>
  )
}

export default FertigationControl