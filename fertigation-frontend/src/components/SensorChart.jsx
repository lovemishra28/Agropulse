import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"

function SensorChart({ data, onFilterChange }) {

  const [activeFilter, setActiveFilter] = useState(null)

  const filterOptions = [
    { label: "All", value: null },
    { label: "1h", value: 1 },
    { label: "6h", value: 6 },
    { label: "24h", value: 24 },
    { label: "7d", value: 168 },
  ]

  const handleFilter = (value) => {
    setActiveFilter(value)
    if (onFilterChange) onFilterChange(value)
  }

  if (!data || data.length === 0) return null

  return (
    <div className="chart-card">

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
        <h3 className="chart-title" style={{ margin: 0 }}>📈 Sensor Trends Over Time</h3>
        <div style={{ display: "flex", gap: "6px" }}>
          {filterOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleFilter(opt.value)}
              className="btn"
              style={{
                padding: "4px 12px",
                fontSize: "0.75em",
                background: activeFilter === opt.value ? "var(--color-primary)" : "var(--bg-card-alt)",
                color: activeFilter === opt.value ? "var(--text-inverse)" : "var(--text-secondary)",
                border: `1px solid ${activeFilter === opt.value ? "var(--color-primary)" : "var(--border-color)"}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
            stroke="var(--text-muted)"
            fontSize={12}
          />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              color: "var(--text-primary)",
              fontSize: "0.85em",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="soil_moisture" stroke="var(--color-nitrogen)" name="Soil Moisture (%)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="temperature" stroke="var(--color-danger)" name="Temp (°C)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="humidity" stroke="var(--color-phosphorus)" name="Humidity (%)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

    </div>
  )
}

export default SensorChart