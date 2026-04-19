function GrowthStageCard({ growthData }) {
  if (!growthData) return null

  const {
    crop_type,
    seed_date,
    days_after_sowing,
    growth_stage,
    stage_day,
    stage_total_days,
    stage_progress,
    all_stages,
  } = growthData

  const stageIcons = {
    Germination: "🌱",
    Vegetative:  "🌿",
    Flowering:   "🌸",
    Fruiting:    "🍅",
    Harvested:   "✅",
  }

  const icon = stageIcons[growth_stage] || "🌾"

  return (
    <div className="card section">

      {/* Header */}
      <div className="card-header">
        <h3 className="card-title">{icon} Growth Stage Tracker</h3>
        <span className="card-badge">{growth_stage}</span>
      </div>

      {/* Info row */}
      <div className="info-row">
        <div className="info-item">
          <span className="info-label">Crop</span>
          <span className="info-value">{crop_type}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Sown On</span>
          <span className="info-value">{seed_date}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Days After Sowing</span>
          <span className="info-value">{days_after_sowing} days</span>
        </div>
        <div className="info-item">
          <span className="info-label">Stage Day</span>
          <span className="info-value">Day {stage_day} of {stage_total_days}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-labels">
          <span>Stage Progress</span>
          <span>{Math.min(stage_progress, 100)}%</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(stage_progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline dots */}
      <div className="stage-timeline">
        {all_stages && all_stages.map((stage, index) => {
          const isActive = stage.stage === growth_stage
          const isPast = all_stages.indexOf(stage) < all_stages.findIndex(s => s.stage === growth_stage)
          return (
            <div key={index} className="stage-dot-group">
              <div className={`stage-dot ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}></div>
              <span className={`stage-dot-label ${isActive ? 'active' : ''}`}>{stage.stage}</span>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default GrowthStageCard
