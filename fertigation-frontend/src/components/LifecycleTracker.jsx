import { MdEco, MdGrass, MdLocalFlorist, MdSpa, MdDone } from "react-icons/md"

const stages = [
  { key: "Germination", icon: MdEco,          emoji: "🌱" },
  { key: "Vegetative",  icon: MdGrass,         emoji: "🌿" },
  { key: "Flowering",   icon: MdLocalFlorist,   emoji: "🌼" },
  { key: "Fruiting",    icon: MdSpa,            emoji: "🍅" },
  { key: "Harvested",   icon: MdDone,           emoji: "✅" },
]

export default function LifecycleTracker({ growthData }) {
  if (!growthData) return null

  const cur             = stages.findIndex(s => s.key === growthData.growth_stage)
  const progress        = growthData.stage_progress || 0
  const overallProgress = growthData.overall_progress || 0

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* ── Stage Circles + Overall Connecting Line ── */}
      <div className="flex items-center justify-between relative">

        {/* Single dynamic connecting line across all stages */}
        <div
          className="absolute left-[8%] right-[8%] top-[28px] h-[3px] z-0 hidden sm:block"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${Math.min(overallProgress, 100)}%`,
              background: "linear-gradient(90deg, #22c55e, #A3E635)",
              transition: "width 0.7s ease",
            }}
          />
        </div>

        {stages.map((s, i) => {
          const done   = i < cur
          const active = i === cur
          const future = i > cur
          const isHarvested = s.key === "Harvested" && (active || done)
          return (
            <div key={s.key} className="flex flex-col items-center z-10 w-20 sm:w-24 relative">
              <div
                className={`journey-stage-icon flex items-center justify-center ${active ? "active" : ""} ${done ? "done" : ""} ${isHarvested ? "harvested" : ""}`}
                style={{
                  opacity: future ? 0.4 : 1,
                  fontSize: "1.8rem",
                  transform: active ? "scale(1.1)" : undefined,
                  animation: active ? "pulse-ring 2s ease-in-out infinite" : undefined,
                  transition: "all 0.5s ease",
                }}
              >
                {s.emoji}
              </div>
              <span
                className="mt-3 text-xs sm:text-sm font-medium text-center"
                style={{
                  color: active ? "#A3E635" : done ? "#fff" : "rgba(255,255,255,0.35)",
                  transform: active ? "scale(1.05)" : undefined,
                  transition: "all 0.3s ease",
                }}
              >
                {s.key}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Progress Bar ── */}
      <div className="mt-10">
        <div className="flex justify-between text-xs text-white/40 font-medium mb-2">
          <span>Overall growth progress</span>
          <span>{Math.min(overallProgress, 100).toFixed(1)}%</span>
        </div>
        <div className="progress-bar-agro">
          <div
            className="progress-fill-agro"
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
          />
          <span className="progress-text-agro">{Math.min(overallProgress, 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
