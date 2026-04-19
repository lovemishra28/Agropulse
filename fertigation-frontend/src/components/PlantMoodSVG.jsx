/**
 * PlantMoodSVG — Agropulse-style cute SVG plant with face.
 * States: happy (bouncing, leaf wiggle, smile, blush)
 *         medium (gentle sway, neutral face)
 *         sad (droopy leaves, frown, tears)
 */
import { useState, useEffect } from "react"

export default function PlantMoodSVG({ mood = "happy", healthScore = 85, simOn = false }) {
  const [dancing, setDancing] = useState(false)
  const [crying, setCrying] = useState(false)

  /* Simulator click triggers dance/cry animation */
  useEffect(() => {
    if (simOn && mood === "happy") {
      setDancing(true)
      const t = setTimeout(() => setDancing(false), 2000)
      return () => clearTimeout(t)
    }
    if (simOn && mood === "sad") {
      setCrying(true)
      const t = setTimeout(() => setCrying(false), 4000)
      return () => clearTimeout(t)
    }
  }, [simOn])

  const effectiveMood = crying ? "crying" : mood
  const leafColor = effectiveMood === "happy" ? "#A3E635" : effectiveMood === "sad" || effectiveMood === "crying" ? "#22c55e" : "#4ade80"
  const stemColor = effectiveMood === "happy" ? "#A3E635" : "#22c55e"

  /* Animation class for the plant wrapper */
  let wrapperAnim = "animate-[plantSway_4s_ease-in-out_infinite]"
  if (effectiveMood === "happy") wrapperAnim = "animate-[happyBounce_3s_ease-in-out_infinite]"
  if (effectiveMood === "sad") wrapperAnim = ""
  if (effectiveMood === "crying") wrapperAnim = "animate-[shakeSway_3s_ease-in-out_infinite]"
  if (dancing) wrapperAnim = "animate-[plantDance_0.5s_ease-in-out_3]"

  return (
    <div className="flex flex-col items-center mb-6">
      <div
        className={`origin-bottom ${wrapperAnim}`}
        style={{
          width: 220,
          height: 220,
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
          transition: effectiveMood === "sad" ? "transform 0.5s ease" : undefined,
          transform: effectiveMood === "sad" ? "translateY(5px)" : undefined,
        }}
      >
        <svg viewBox="0 0 100 130" className="w-full h-full overflow-visible">
          {/* Pot */}
          <g>
            <path d="M 30 85 L 70 85 L 63 115 L 37 115 Z" fill="#D2691E" />
            <rect x="25" y="75" width="50" height="10" rx="4" fill="#A0522D" />
          </g>

          {/* Stem */}
          <g>
            <path d="M 50 75 Q 45 40 50 20" fill="none" stroke={stemColor} strokeWidth="5" strokeLinecap="round"
              style={{ transition: "stroke 0.5s ease" }} />
          </g>

          {/* Leaves */}
          <g>
            <path
              className={effectiveMood === "happy" ? "animate-[leafWiggleLeft_2s_ease-in-out_infinite]" : ""}
              d="M 47 50 Q 15 35 25 15 Q 45 25 47 50"
              fill={leafColor}
              style={{
                transition: "fill 0.5s ease, transform 0.5s ease",
                transformOrigin: "30px 45px",
                transform: effectiveMood === "sad" ? "rotate(-15deg)" : effectiveMood === "crying" ? "rotate(-25deg)" : undefined,
              }}
            />
            <path
              className={effectiveMood === "happy" ? "animate-[leafWiggleRight_2s_ease-in-out_infinite]" : ""}
              d="M 53 45 Q 85 30 75 10 Q 55 20 53 45"
              fill={leafColor}
              style={{
                transition: "fill 0.5s ease, transform 0.5s ease",
                transformOrigin: "70px 45px",
                transform: effectiveMood === "sad" ? "rotate(15deg)" : effectiveMood === "crying" ? "rotate(25deg)" : undefined,
              }}
            />
          </g>

          {/* Face */}
          <g>
            {/* Eyes */}
            <ellipse cx="41" cy="94" rx="3.5" ry={effectiveMood === "sad" ? 2.5 : effectiveMood === "crying" ? 3 : 4.5} fill="#000"
              style={{ transition: "all 0.3s ease", transform: effectiveMood === "sad" ? "translateY(2px)" : undefined }} />
            <ellipse cx="59" cy="94" rx="3.5" ry={effectiveMood === "sad" ? 2.5 : effectiveMood === "crying" ? 3 : 4.5} fill="#000"
              style={{ transition: "all 0.3s ease", transform: effectiveMood === "sad" ? "translateY(2px)" : undefined }} />
            
            {/* Eye shine */}
            <circle cx="42" cy="92.5" r="1.2" fill="#fff" />
            <circle cx="60" cy="92.5" r="1.2" fill="#fff" />

            {/* Blush */}
            <ellipse cx="34" cy="98" rx="3.5" ry="2" fill="#ff8a8a" opacity={effectiveMood === "happy" ? 0.7 : 0} style={{ transition: "opacity 0.3s" }} />
            <ellipse cx="66" cy="98" rx="3.5" ry="2" fill="#ff8a8a" opacity={effectiveMood === "happy" ? 0.7 : 0} style={{ transition: "opacity 0.3s" }} />

            {/* Mouth */}
            {effectiveMood === "happy" && (
              <path d="M 45 99 Q 50 104 55 99" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            )}
            {effectiveMood === "medium" && (
              <path d="M 46 101 L 54 101" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            )}
            {(effectiveMood === "sad" || effectiveMood === "crying") && (
              <path d="M 46 102 Q 50 99 54 102" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>

          {/* Tears (crying state only) */}
          <g opacity={effectiveMood === "crying" ? 1 : 0} style={{ transition: "opacity 0.3s" }}>
            <ellipse className={effectiveMood === "crying" ? "animate-[fallTear_1.2s_infinite_ease-in]" : ""}
              cx="41" cy="100" rx="2.5" ry="4" fill="#4FC3F7" />
            <ellipse className={effectiveMood === "crying" ? "animate-[fallTear_1.2s_infinite_ease-in_0.3s]" : ""}
              cx="59" cy="100" rx="2.5" ry="4" fill="#4FC3F7" style={{ animationDelay: "0.3s" }} />
            <ellipse className={effectiveMood === "crying" ? "animate-[fallTear_1.2s_infinite_ease-in_0.6s]" : ""}
              cx="39" cy="106" rx="2" ry="3.5" fill="#4FC3F7" style={{ animationDelay: "0.6s" }} />
            <ellipse className={effectiveMood === "crying" ? "animate-[fallTear_1.2s_infinite_ease-in_0.9s]" : ""}
              cx="61" cy="106" rx="2" ry="3.5" fill="#4FC3F7" style={{ animationDelay: "0.9s" }} />
          </g>

          {/* Ripples (crying) */}
          <g opacity={effectiveMood === "crying" ? 1 : 0} style={{ transition: "opacity 0.3s" }}>
            <ellipse className={effectiveMood === "crying" ? "animate-[rippleEffect_1.2s_infinite_ease-out_0.8s]" : ""}
              cx="41" cy="125" rx="8" ry="3" fill="none" stroke="#4FC3F7" strokeWidth="1.5" />
            <ellipse className={effectiveMood === "crying" ? "animate-[rippleEffect_1.2s_infinite_ease-out_1.1s]" : ""}
              cx="59" cy="125" rx="8" ry="3" fill="none" stroke="#4FC3F7" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  )
}
