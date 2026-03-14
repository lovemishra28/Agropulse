function RecommendationCard({ data }) {
  if (!data) return null

  const levelLabels = {
    LOW:    "Low — Reduce Dose",
    MEDIUM: "Medium — Standard Dose",
    HIGH:   "High — Increase Dose",
  }

  const nutrients = [
    { name: "Nitrogen (N)",   amount: data.nitrogen_kg_per_acre,   color: "var(--color-nitrogen)",   colorLight: "var(--color-nitrogen-light)",   desc: "Leaf & stem growth" },
    { name: "Phosphorus (P)", amount: data.phosphorus_kg_per_acre, color: "var(--color-phosphorus)", colorLight: "var(--color-phosphorus-light)", desc: "Root & flower development" },
    { name: "Potassium (K)",  amount: data.potassium_kg_per_acre,  color: "var(--color-potassium)",  colorLight: "var(--color-potassium-light)",  desc: "Fruit quality & disease resistance" },
  ]

  const maxAmount = Math.max(...nutrients.map(n => n.amount), 1)

  return (
    <div className="card section">

      {/* Header */}
      <div className="card-header">
        <h3 className="card-title">🧪 Hybrid Fertigation Recommendation</h3>
        <span className="card-badge">{levelLabels[data.recommendation] || data.recommendation}</span>
      </div>

      {/* Meta info */}
      <div className="info-row">
        <div className="info-item">
          <span className="info-label">AI Confidence</span>
          <span className="info-value">{data.confidence}%</span>
        </div>
        <div className="info-item">
          <span className="info-label">Adjustment Factor</span>
          <span className="info-value">{data.adjustment_factor}×</span>
        </div>
        <div className="info-item">
          <span className="info-label">Formula</span>
          <span className="info-value" style={{ fontSize: "0.88em" }}>Base × {data.adjustment_factor} = Final</span>
        </div>
      </div>

      {/* N-P-K Breakdown */}
      <div className="nutrient-section">
        <p className="nutrient-section-title"><strong>N-P-K Breakdown</strong> (kg/acre)</p>

        {nutrients.map((n, i) => (
          <div key={i} className="nutrient-row">
            <div className="nutrient-label">
              <div className="nutrient-name">{n.name}</div>
              <div className="nutrient-desc">{n.desc}</div>
            </div>
            <div className="nutrient-bar-bg">
              <div
                className="nutrient-bar-fill"
                style={{
                  width: `${(n.amount / maxAmount) * 100}%`,
                  background: `linear-gradient(90deg, ${n.colorLight}, ${n.color})`,
                }}
              ></div>
            </div>
            <div className="nutrient-amount">{n.amount} kg</div>
          </div>
        ))}

        {/* Total */}
        <div className="total-row">
          <span className="total-label">Total Fertilizer</span>
          <span className="total-value">{data.total_kg_per_acre} kg/acre</span>
        </div>
      </div>

      {/* Reason */}
      <p className="reason-text">💡 {data.reason}</p>

    </div>
  )
}

export default RecommendationCard