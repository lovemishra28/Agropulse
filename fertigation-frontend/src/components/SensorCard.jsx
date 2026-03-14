function SensorCard({ title, value, unit }) {
  return (
    <div className="sensor-card">
      <h4 className="sensor-card-label">{title}</h4>
      <h2 className="sensor-card-value">
        {value}
        <span className="sensor-card-unit">{unit}</span>
      </h2>
    </div>
  )
}

export default SensorCard