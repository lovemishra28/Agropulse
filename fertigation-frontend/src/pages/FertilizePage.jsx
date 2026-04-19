import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { FaCheckCircle, FaLeaf, FaTint } from "react-icons/fa"
import { getRecommendation, startFertigation, getFertigationHistory, EXPORT_RECOMMENDATIONS_URL } from "../services/api"

export default function FertilizePage({ selectedCrop, showSnackbar }) {
  const [rec, setRec] = useState(null)
  const [fertilizing, setFertilizing] = useState(false)
  const [done, setDone] = useState(false)
  const [logs, setLogs] = useState([])
  const [plantBouncing, setPlantBouncing] = useState(false)
  const [showWater, setShowWater] = useState(false)
  const npkRef = useRef(null)
  const [npkVisible, setNpkVisible] = useState(false)

  useEffect(() => {
    if (selectedCrop) {
        getRecommendation(selectedCrop.crop_type, selectedCrop.seed_date).then(r => setRec(r.data)).catch(() => {})
    } else {
        getRecommendation().then(r => setRec(r.data)).catch(() => {})
    }
    getFertigationHistory().then(r => setLogs(r.data.history || [])).catch(() => {})
  }, [selectedCrop])

  /* IntersectionObserver for NPK bars animation */
  useEffect(() => {
    if (!npkRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setNpkVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(npkRef.current)
    return () => obs.disconnect()
  }, [rec])

  const handleFertilize = async () => {
    /* Water drops + plant shake animation */
    setShowWater(true)
    setTimeout(() => {
      setPlantBouncing(true)
      setTimeout(() => {
        setShowWater(false)
        setPlantBouncing(false)
      }, 1500)
    }, 800)

    setFertilizing(true); setDone(false)
    try {
      await startFertigation()
      setTimeout(() => {
        setFertilizing(false); setDone(true)
        showSnackbar?.("✅ Fertigation complete — next recommended in ~6 hours")
        getFertigationHistory().then(r => setLogs(r.data.history || [])).catch(() => {})
        if (selectedCrop) {
            getRecommendation(selectedCrop.crop_type, selectedCrop.seed_date).then(r => setRec(r.data)).catch(() => {})
        } else {
            getRecommendation().then(r => setRec(r.data)).catch(() => {})
        }
        setTimeout(() => setDone(false), 5000)
      }, 4000)
    } catch { setFertilizing(false) }
  }

  const nutrients = rec ? [
    { name: "Nitrogen", key: "nitrogen", amount: rec.nitrogen_kg_per_acre },
    { name: "Phosphorus", key: "phosphorus", amount: rec.phosphorus_kg_per_acre },
    { name: "Potassium", key: "potassium", amount: rec.potassium_kg_per_acre },
  ] : []
  const maxAmt = Math.max(...nutrients.map(n => n.amount), 1)

  return (
    <section id="fertilize" className="relative z-[2] w-full min-h-screen px-4 sm:px-8 py-16 pb-20">

        {/* ═══ FERTILIZATION OVERLAY (React Portal guarantees full screen) ═══ */}
        {fertilizing && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-md flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease]">
            <div className="glass-panel flex flex-col items-center justify-center p-8 sm:px-12 sm:py-10 rounded-[2rem] border border-white/10 shadow-2xl scale-95 mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-48 h-52">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i}
                    className="absolute text-blue-400 animate-[waterDrop_1.5s_ease-in_infinite]"
                    style={{ left: `${10 + i * 13}%`, animationDelay: `${i * 0.2}s` }}
                  >
                    <FaTint size={20} />
                  </div>
                ))}
                <svg viewBox="0 0 160 200" className="w-40 h-48 mx-auto relative z-10">
                  <path d="M45 155 L55 190 L105 190 L115 155 Z" fill="#E3655B" />
                  <rect x="40" y="148" width="80" height="10" rx="4" fill="#E3655B" />
                  <path d="M80 155 Q78 120 80 70" stroke="#4caf50" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <ellipse cx="58" cy="100" rx="22" ry="10" fill="#4caf50" opacity="0.9" transform="rotate(-30 58 100)" />
                  <ellipse cx="102" cy="90" rx="22" ry="10" fill="#4caf50" opacity="0.9" transform="rotate(25 102 90)" />
                  <ellipse cx="80" cy="62" rx="14" ry="20" fill="#4caf50" opacity="0.95" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white mt-2">Fertilizing…</p>
              <p className="text-white/60 mt-1 text-sm">Delivering nutrients to your crop</p>
            </div>
          </div>,
          document.body
        )}

        {/* ═══ COMPLETION OVERLAY (React Portal guarantees full screen) ═══ */}
        {done && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer animate-[fadeIn_0.3s_ease]" onClick={() => setDone(false)}>
            <div className="glass-panel flex flex-col items-center justify-center p-8 sm:px-16 sm:py-10 rounded-[2rem] border border-white/10 shadow-2xl scale-95 mx-4" onClick={(e) => e.stopPropagation()}>
              <FaCheckCircle className="text-6xl text-green-400 animate-[scaleIn_0.5s_ease]" />
              <p className="text-2xl font-bold text-white mt-4">Complete!</p>
              <p className="text-white/50 mt-1 text-sm">Tap outside to dismiss</p>
            </div>
          </div>,
          document.body
        )}

      <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col items-center gap-6 bg-black/40 backdrop-blur-xs border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl">

        {/* 2-COLUMN LAYOUT: CTA (Left) & NPK Breakdown (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 w-full items-center mt-4">
          
          {/* ═══ INNER LEFT: HERO CTA ═══ */}
          <div className="text-center flex flex-col items-center gap-4 fade-up visible glass-panel p-8 rounded-[2rem] h-full justify-center">
            <span className="ai-label">AI POWERED RECOMMENDATION</span>

            {/* Interactive Plant */}
            <div className="relative flex flex-col items-center justify-center my-2">
              <div className={`absolute top-0 flex gap-1 items-center justify-center transition-opacity duration-300 ${showWater ? 'opacity-100' : 'opacity-0'}`}>
                <FaTint className="text-blue-400 animate-bounce" size={16} />
                <FaTint className="text-blue-400 animate-bounce" style={{ animationDelay: '0.1s' }} size={16} />
                <FaTint className="text-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} size={16} />
              </div>
              <div className={`mt-6 ${plantBouncing ? 'animate-[wiggle_1s_ease-in-out]' : ''}`}>
                 <svg viewBox="0 0 160 160" className="w-24 h-24 mx-auto relative z-10 drop-shadow-2xl">
                    <path d="M45 125 L55 160 L105 160 L115 125 Z" fill="#E3655B" />
                    <rect x="40" y="118" width="80" height="10" rx="4" fill="#E3655B" />
                    <path d="M80 125 Q78 90 80 40" stroke="#4caf50" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <ellipse cx="58" cy="70" rx="22" ry="10" fill="#4caf50" opacity="0.9" transform="rotate(-30 58 70)" />
                    <ellipse cx="102" cy="60" rx="22" ry="10" fill="#4caf50" opacity="0.9" transform="rotate(25 102 60)" />
                    <ellipse cx="80" cy="32" rx="14" ry="20" fill="#4caf50" opacity="0.95" />
                 </svg>
              </div>
            </div>

            <h2 className="gradient-text text-3xl sm:text-4xl font-bold leading-tight">
              Feed your crop right
            </h2>
            <p className="text-sm text-white/80 font-medium" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              Precision N-P-K dosage calculated dynamically
              {selectedCrop && <> for <span className="text-[#A3E635] font-bold block mt-1 text-lg">{selectedCrop.crop_type}</span></>}
            </p>
            <button
              onClick={handleFertilize}
              disabled={fertilizing || !selectedCrop}
              className="btn-action-agro disabled:opacity-40 mt-4"
            >
              Start Fertilizing
            </button>
            {!selectedCrop && (
              <p className="text-xs text-white/40">Select a crop in the Crops section first</p>
            )}
          </div>

          {/* ═══ INNER RIGHT: NPK BREAKDOWN + SIDE PANEL ═══ */}
          {rec ? (
            <div ref={npkRef} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 w-full fade-up visible h-full">
              
              {/* NPK Card */}
              <div className="glass-panel p-6 sm:p-8 flex flex-col gap-6 justify-center">
                <div className="flex flex-col gap-2">
                  <span className="confidence-badge self-start">
                    {rec.recommendation} — {rec.confidence}% confidence
                  </span>
                  <h3 className="text-xl font-semibold text-white mt-1">N-P-K Breakdown</h3>
                </div>

                <div className="flex flex-col gap-5 mt-2">
                  {nutrients.map((n) => (
                    <div key={n.key} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/80 font-medium">{n.name}</span>
                        <span className="text-white font-semibold">{n.amount} kg/acre</span>
                      </div>
                      <div className="npk-bar-track h-2">
                        <div
                          className={`npk-bar-fill ${n.key}`}
                          style={{ width: npkVisible ? `${(n.amount / 50) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Panel */}
              <div className="flex flex-col gap-4">
                {/* Total Card */}
                <div className="total-card-agro h-auto p-5">
                  <h3 className="text-xs text-white/70">Total Fertilizer</h3>
                  <div className="text-3xl font-bold text-[#ff3d77] mt-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {rec.total_kg_per_acre} <span className="text-sm">kg/acre</span>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="glass-panel p-4 text-xs italic text-white/50 leading-relaxed border-white/5">
                  "{rec.reason || 'AI detected stressed conditions — increased dosage applied'}"
                </div>

                {/* Export & Logs */}
                <div className="glass-panel p-4 flex flex-col gap-3 flex-1 border-white/5">
                  <a
                    href={EXPORT_RECOMMENDATIONS_URL}
                    download
                    className="btn-export-agro text-center no-underline py-2 text-xs"
                  >
                    📥 Export CSV
                  </a>
                  
                  <div className="flex-1 mt-1">
                    <h4 className="text-[11px] text-white/70 font-medium mb-2 uppercase tracking-wider">Logs</h4>
                    {logs.length === 0 ? (
                      <p className="text-xs text-white/30 italic">No logs yet.</p>
                    ) : (
                      logs.slice(0, 3).map((l, i) => (
                        <div key={i} className="text-[10px] text-white/60 py-1 border-b border-white/5 last:border-0 flex items-center gap-2">
                          <span>💧</span>
                          {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Done
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 flex items-center justify-center h-full min-h-[300px] text-white/40">
              <p>Waiting for crop data to calculate recommendations...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
