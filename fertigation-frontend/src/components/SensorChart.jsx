import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FiBarChart2 } from "react-icons/fi"

const filters = [
  { label: "All", value: null },
  { label: "1h", value: 1 },
  { label: "6h", value: 6 },
  { label: "24h", value: 24 },
  { label: "7d", value: 168 },
]

const legendItems = [
  { color: "#3b82f6", label: "Humidity %" },
  { color: "#22c55e", label: "Moisture %" },
  { color: "#ef4444", label: "Temp °C" },
]

export default function SensorChart({ data, onFilterChange }) {
  const [active, setActive] = useState(null)

  const pick = (v) => {
    setActive(v)
    onFilterChange?.(v)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with filter buttons (Agropulse style) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-5 shrink-0">
        <h4 className="text-lg sm:text-xl font-medium text-white">Sensor Trends</h4>
        <div className="filter-btn-group scale-95 sm:scale-100 origin-right">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => pick(f.value)}
              className={`filter-btn-agro ${active === f.value ? "active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full rounded-xl flex-1 flex flex-col justify-center min-h-[250px] relative"
           style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '16px' }}>
        {(!data || data.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-2">
            <FiBarChart2 className="text-4xl opacity-40 mb-2" />
            <p className="text-sm">No sensor data available.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.6)' }}
                fontSize={11}
                tickMargin={10}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                fontSize={11} 
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(10, 15, 25, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  color: "#fff",
                  fontSize: 13,
                }}
                labelFormatter={(t) => new Date(t).toLocaleString()}
              />
              <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHumidity)" name="Humidity %" strokeWidth={2} />
              <Area type="monotone" dataKey="soil_moisture" stroke="#22c55e" fillOpacity={1} fill="url(#colorMoisture)" name="Moisture %" strokeWidth={2} />
              <Area type="monotone" dataKey="temperature" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" name="Temp °C" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Custom HTML Legend */}
      <div className="flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 shrink-0">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block" style={{ backgroundColor: item.color }} />
            <span className="text-xs sm:text-sm text-white/80 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}