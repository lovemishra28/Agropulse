/**
 * PlantMood — Large, refined SVG plant as the hero element.
 * Mood: happy (>70), okay (40-70), sad (<40) based on sensor health.
 */
export default function PlantMood({ sensorData }) {
  if (!sensorData) return null

  const score = (val, lo, ideal, hi) => {
    if (val >= ideal - 5 && val <= ideal + 5) return 100
    if (val < lo || val > hi) return 10
    return val < ideal
      ? Math.max(10, ((val - lo) / (ideal - lo)) * 100)
      : Math.max(10, ((hi - val) / (hi - ideal)) * 100)
  }

  const health = Math.round(
    (score(sensorData.soil_moisture, 20, 55, 85) +
      score(sensorData.temperature, 15, 27, 38) +
      score(sensorData.humidity, 30, 60, 85) +
      score(sensorData.light_intensity, 100, 400, 800)) / 4
  )

  const happy = health > 70
  const sad = health < 40

  const anim = happy ? "animate-[plantBounce_3s_ease-in-out_infinite]"
    : sad ? "animate-[plantDroop_5s_ease-in-out_infinite]"
    : "animate-[plantSway_4s_ease-in-out_infinite]"

  const leafMain = happy ? "#43a047" : sad ? "#827717" : "#66bb6a"
  const leafSecondary = happy ? "#66bb6a" : sad ? "#9e9d24" : "#81c784"
  const leafHighlight = happy ? "#a5d6a7" : sad ? "#c0ca33" : "#c8e6c9"
  const stemColor = happy ? "#2e7d32" : sad ? "#6d6d00" : "#388e3c"
  const potMain = "#c0564e"
  const potLight = "#d4746c"
  const potDark = "#9e3f38"
  const soilColor = "#4e342e"
  const soilLight = "#5d4037"

  const label = happy ? "Thriving — your crop is happy!" : sad ? "Struggling — needs attention" : "Doing okay — room to improve"
  const labelColor = happy ? "text-green-500" : sad ? "text-red-400" : "text-amber-500"

  return (
    <div className="flex flex-col items-center">
      <div className={`origin-bottom ${anim}`}>
        <svg viewBox="0 0 280 360" className="w-56 h-72 sm:w-72 sm:h-[360px] md:w-80 md:h-[400px]">
          <defs>
            <radialGradient id="potGrad" cx="50%" cy="30%">
              <stop offset="0%" stopColor={potLight} />
              <stop offset="100%" stopColor={potMain} />
            </radialGradient>
            <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={leafSecondary} />
              <stop offset="100%" stopColor={leafMain} />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={leafSecondary} />
              <stop offset="100%" stopColor={leafMain} />
            </linearGradient>
            <linearGradient id="stemGrad" x1="0.5" y1="1" x2="0.5" y2="0">
              <stop offset="0%" stopColor={stemColor} />
              <stop offset="100%" stopColor={leafMain} />
            </linearGradient>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="140" cy="330" rx="80" ry="6" fill="rgba(0,0,0,0.08)" />

          {/* Pot - trapezoid shape with rim */}
          <g filter="url(#softShadow)">
            <path d="M85 270 L98 328 L182 328 L195 270 Z" fill="url(#potGrad)" />
            {/* Pot rim */}
            <rect x="78" y="262" width="124" height="12" rx="6" fill={potLight} />
            <rect x="78" y="262" width="124" height="5" rx="3" fill="rgba(255,255,255,0.2)" />
            {/* Pot stripe */}
            <rect x="100" y="288" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
          </g>

          {/* Soil with texture */}
          <ellipse cx="140" cy="270" rx="52" ry="10" fill={soilColor} />
          <ellipse cx="130" cy="268" rx="6" ry="2" fill={soilLight} opacity="0.6" />
          <ellipse cx="150" cy="269" rx="4" ry="1.5" fill={soilLight} opacity="0.4" />
          <ellipse cx="140" cy="271" rx="3" ry="1" fill={soilLight} opacity="0.3" />

          {/* Main stem — curved */}
          <path d="M140 268 Q138 230 136 190 Q134 155 140 110"
            stroke="url(#stemGrad)" strokeWidth="7" fill="none" strokeLinecap="round" />

          {/* Small branch left */}
          <path d="M137 200 Q120 190 105 178" stroke={stemColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Small branch right */}
          <path d="M138 175 Q155 165 170 158" stroke={stemColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* ── Leaves ── */}
          {/* Left large leaf */}
          <g className="animate-[leafFloat_6s_ease-in-out_infinite]" style={{ transformOrigin: "105px 178px" }}>
            <path d="M105 178 Q75 155 65 130 Q85 140 105 160 Q95 148 85 130 Q105 155 110 175 Z"
              fill="url(#leafGrad1)" opacity="0.92" />
            <path d="M105 178 Q90 160 80 145" stroke={leafHighlight} strokeWidth="1" fill="none" opacity="0.5" />
          </g>

          {/* Right large leaf */}
          <g className="animate-[leafFloat_5s_ease-in-out_infinite]" style={{ transformOrigin: "170px 158px", animationDelay: "1s" }}>
            <path d="M170 158 Q200 135 210 110 Q190 120 170 140 Q180 128 190 110 Q170 135 165 155 Z"
              fill="url(#leafGrad2)" opacity="0.92" />
            <path d="M170 158 Q185 140 195 125" stroke={leafHighlight} strokeWidth="1" fill="none" opacity="0.5" />
          </g>

          {/* Left mid leaf */}
          <g className="animate-[leafFloat_7s_ease-in-out_infinite]" style={{ transformOrigin: "120px 165px", animationDelay: "0.5s" }}>
            <path d="M130 160 Q105 145 90 155 Q110 152 125 162 Z"
              fill={leafSecondary} opacity="0.8" />
          </g>

          {/* Right mid leaf */}
          <g className="animate-[leafFloat_5.5s_ease-in-out_infinite]" style={{ transformOrigin: "155px 145px", animationDelay: "1.5s" }}>
            <path d="M148 142 Q175 130 185 140 Q165 132 150 145 Z"
              fill={leafSecondary} opacity="0.8" />
          </g>

          {/* Top crown leaf */}
          <g className="animate-[leafFloat_4s_ease-in-out_infinite]" style={{ transformOrigin: "140px 110px" }}>
            <ellipse cx="140" cy="90" rx="18" ry="30" fill={leafMain} opacity="0.95" transform="rotate(-3 140 90)" />
            <path d="M140 110 Q140 90 140 65" stroke={leafHighlight} strokeWidth="1.2" fill="none" opacity="0.4" />
          </g>

          {/* Left upper leaf */}
          <g className="animate-[leafFloat_6.5s_ease-in-out_infinite]" style={{ transformOrigin: "125px 130px", animationDelay: "2s" }}>
            <ellipse cx="110" cy="120" rx="20" ry="12" fill={leafSecondary} opacity="0.88" transform="rotate(-30 110 120)" />
          </g>

          {/* Right upper leaf */}
          <g className="animate-[leafFloat_5s_ease-in-out_infinite]" style={{ transformOrigin: "155px 125px", animationDelay: "0.8s" }}>
            <ellipse cx="168" cy="115" rx="18" ry="11" fill={leafSecondary} opacity="0.88" transform="rotate(25 168 115)" />
          </g>

          {/* ── Face ── */}
          {/* Eyes */}
          <circle cx="130" cy={sad ? 137 : 134} r={sad ? 3.5 : 4} fill="#2d2d2d" />
          <circle cx="150" cy={sad ? 137 : 134} r={sad ? 3.5 : 4} fill="#2d2d2d" />
          {/* Eye glints */}
          <circle cx="131.5" cy={sad ? 135.5 : 132.5} r="1.5" fill="rgba(255,255,255,0.8)" />
          <circle cx="151.5" cy={sad ? 135.5 : 132.5} r="1.5" fill="rgba(255,255,255,0.8)" />

          {/* Mouth */}
          {happy && <path d="M133 145 Q140 153 147 145" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
          {!happy && !sad && <line x1="133" y1="146" x2="147" y2="146" stroke="#2d2d2d" strokeWidth="2.5" strokeLinecap="round" />}
          {sad && <path d="M133 150 Q140 143 147 150" stroke="#2d2d2d" strokeWidth="2.5" fill="none" strokeLinecap="round" />}

          {/* Blush */}
          {happy && <>
            <circle cx="122" cy="142" r="6" fill="#ef9a9a" opacity="0.3" />
            <circle cx="158" cy="142" r="6" fill="#ef9a9a" opacity="0.3" />
          </>}

          {/* Sparkles for happy */}
          {happy && <>
            <g className="animate-[shimmer_2s_ease-in-out_infinite]">
              <circle cx="80" cy="100" r="2" fill="#ffd54f" />
              <line x1="80" y1="95" x2="80" y2="105" stroke="#ffd54f" strokeWidth="1" />
              <line x1="75" y1="100" x2="85" y2="100" stroke="#ffd54f" strokeWidth="1" />
            </g>
            <g className="animate-[shimmer_2.5s_ease-in-out_infinite]" style={{ animationDelay: "0.8s" }}>
              <circle cx="200" cy="85" r="1.5" fill="#ffd54f" />
              <line x1="200" y1="81" x2="200" y2="89" stroke="#ffd54f" strokeWidth="0.8" />
              <line x1="196" y1="85" x2="204" y2="85" stroke="#ffd54f" strokeWidth="0.8" />
            </g>
            <g className="animate-[shimmer_3s_ease-in-out_infinite]" style={{ animationDelay: "1.5s" }}>
              <circle cx="95" cy="70" r="1.5" fill="#ffd54f" />
              <line x1="95" y1="66" x2="95" y2="74" stroke="#ffd54f" strokeWidth="0.8" />
              <line x1="91" y1="70" x2="99" y2="70" stroke="#ffd54f" strokeWidth="0.8" />
            </g>
          </>}
        </svg>
      </div>

      {/* Status */}
      <p className={`text-base sm:text-lg font-semibold mt-4 ${labelColor}`}>{label}</p>
      <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
        Health score: <span className="font-bold">{health}%</span>
      </p>
    </div>
  )
}
