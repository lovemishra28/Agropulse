import { EXPORT_SENSOR_URL, EXPORT_RECOMMENDATIONS_URL } from "../services/api"

function ExportPanel() {
  return (
    <div className="card section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
      <div>
        <h3 className="card-title">📥 Export Data</h3>
        <p style={{ fontSize: "0.82em", color: "var(--text-muted)", marginTop: "4px" }}>
          Download sensor readings and recommendation history as CSV files for offline analysis
        </p>
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <a
          href={EXPORT_SENSOR_URL}
          download
          className="btn btn-primary"
          style={{ textDecoration: "none" }}
        >
          📊 Sensor Data
        </a>
        <a
          href={EXPORT_RECOMMENDATIONS_URL}
          download
          className="btn btn-primary"
          style={{ textDecoration: "none" }}
        >
          🧪 Recommendations
        </a>
      </div>
    </div>
  )
}

export default ExportPanel
