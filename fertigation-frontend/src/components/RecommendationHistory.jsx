import { useEffect, useState } from "react"
import { getRecommendationHistory } from "../services/api"

function RecommendationHistory() {

  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState(null) // null = all, or number of hours

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 15000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchHistory = async () => {
    try {
      const res = await getRecommendationHistory(filter, 20)
      setHistory(res.data.history)
    } catch (e) {
      console.error(e)
    }
  }

  const filterOptions = [
    { label: "All", value: null },
    { label: "1h", value: 1 },
    { label: "6h", value: 6 },
    { label: "24h", value: 24 },
    { label: "7d", value: 168 },
  ]

  const levelColors = {
    LOW: "var(--color-success)",
    MEDIUM: "var(--color-warning)",
    HIGH: "var(--color-danger)",
  }

  return (
    <div className="history-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
        <h3 className="history-title" style={{ margin: 0 }}>📊 Recommendation History</h3>
        <div style={{ display: "flex", gap: "6px" }}>
          {filterOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setFilter(opt.value)}
              className="btn"
              style={{
                padding: "4px 12px",
                fontSize: "0.75em",
                background: filter === opt.value ? "var(--color-primary)" : "var(--bg-card-alt)",
                color: filter === opt.value ? "var(--text-inverse)" : "var(--text-secondary)",
                border: `1px solid ${filter === opt.value ? "var(--color-primary)" : "var(--border-color)"}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 && (
        <p className="history-empty">No recommendation history recorded yet.</p>
      )}

      {/* Scrollable table */}
      {history.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82em" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Crop</th>
                <th style={thStyle}>Stage</th>
                <th style={thStyle}>Level</th>
                <th style={thStyle}>N</th>
                <th style={thStyle}>P</th>
                <th style={thStyle}>K</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Factor</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={tdStyle}>{new Date(item.timestamp).toLocaleString()}</td>
                  <td style={tdStyle}>{item.crop_type}</td>
                  <td style={tdStyle}>{item.growth_stage}</td>
                  <td style={{ ...tdStyle, color: levelColors[item.recommendation] || "var(--text-primary)", fontWeight: 600 }}>
                    {item.recommendation}
                  </td>
                  <td style={tdStyle}>{item.nitrogen_kg_per_acre}</td>
                  <td style={tdStyle}>{item.phosphorus_kg_per_acre}</td>
                  <td style={tdStyle}>{item.potassium_kg_per_acre}</td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{item.total_kg_per_acre}</td>
                  <td style={tdStyle}>{item.adjustment_factor}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  textAlign: "left",
  padding: "8px 10px",
  color: "var(--text-muted)",
  fontWeight: 600,
  fontSize: "0.9em",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  whiteSpace: "nowrap",
}

const tdStyle = {
  padding: "8px 10px",
  color: "var(--text-secondary)",
  whiteSpace: "nowrap",
}

export default RecommendationHistory
