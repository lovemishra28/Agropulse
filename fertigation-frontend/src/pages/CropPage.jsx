import { useEffect, useState, useRef } from "react"
import { getSupportedCrops, setCropProfile, getCropProfile, getFertigationHistory, getGrowthStage } from "../services/api"

import { FaSeedling, FaLeaf, FaCanadianMapleLeaf, FaAppleAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa"

const stageEmojis = [<FaSeedling key="1" />, <FaLeaf key="2" />, <FaCanadianMapleLeaf key="3" />, <FaAppleAlt key="4" />, <FaCheckCircle key="5" />]
const stageLabels = ["Germination", "Vegetative", "Flowering", "Fruiting", "Harvested"]

export default function CropPage({ selectedCrop, onCropSelected, showSnackbar }) {
  const [crops, setCrops] = useState([])
  const [cropHistory, setCropHistory] = useState([])
  const [cropType, setCropType] = useState(selectedCrop?.crop_type || "")
  const [seedDate, setSeedDate] = useState(selectedCrop?.seed_date || "")
  const [saving, setSaving] = useState(false)
  const [growth, setGrowth] = useState(null)
  const [hist, setHist] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const journeyRef = useRef(null)

  const [historySelectedIdx, setHistorySelectedIdx] = useState(0)

  useEffect(() => {
    getSupportedCrops().then(r => setCrops(r.data.crops)).catch(() => {})
    
    // Load all historical crops
    getCropProfile().then(r => {
      if (r.data?.length) {
        // Most recent at top, assign unique IDs based on index
        const historyData = [...r.data].reverse().map((item, idx) => ({ ...item, list_id: idx }))
        setCropHistory(historyData)
        
        // Auto-select latest if there is no selectedCrop already set globally
        if (!selectedCrop) {
            const p = historyData[0]
            setHistorySelectedIdx(p.list_id)
            setCropType(p.crop_type || "")
            setSeedDate(p.seed_date || "")
            onCropSelected(p)
            // Load its journey dynamically
            if (p.crop_type && p.seed_date) {
                getGrowthStage(p.crop_type, p.seed_date).then(res => setGrowth(res.data)).catch(()=>{})
            }
        } else {
            // Find the matching item in history
            const p = historyData.find(item => item.crop_type === selectedCrop.crop_type && item.seed_date === selectedCrop.seed_date) || historyData[0]
            setHistorySelectedIdx(p.list_id)
            setCropType(p.crop_type || "")
            setSeedDate(p.seed_date || "")
            // Load its journey dynamically
            if (p.crop_type && p.seed_date) {
                getGrowthStage(p.crop_type, p.seed_date).then(res => setGrowth(res.data)).catch(()=>{})
            }
        }
      }
    }).catch(() => {})
    getFertigationHistory().then(r => setHist(r.data.history || [])).catch(() => {})
  }, [])

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])

  const save = async () => {
    if (!cropType || !seedDate) { showSnackbar?.("⚠ Please select both crop and date."); return }
    setSaving(true)
    try {
      await setCropProfile({ crop_type: cropType, seed_date: seedDate })
      onCropSelected({ crop_type: cropType, seed_date: seedDate })
      showSnackbar?.("✅ Crop profile saved!")
      
      // Add to history list UI immediately
      const uniqueId = cropHistory.length > 0 ? cropHistory[0].list_id + 1 : 0
      const newItem = { crop_type: cropType, seed_date: seedDate, list_id: uniqueId }
      setCropHistory(prev => [newItem, ...prev])
      setHistorySelectedIdx(uniqueId)
      
      // Update journey immediately
      const res = await getGrowthStage(cropType, seedDate)
      setGrowth(res.data)
      
      // Scroll to journey
      setTimeout(() => {
        journeyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 400)
    } catch { showSnackbar?.("❌ Failed to save profile.") }
    finally { setSaving(false) }
  }

  const handleHistorySelect = async (item) => {
      setCropType(item.crop_type || "")
      setSeedDate(item.seed_date || "")
      setHistorySelectedIdx(item.list_id)
      
      // Update global selected crop state so AI module updates instantly too!
      onCropSelected({ crop_type: item.crop_type || "", seed_date: item.seed_date || "" })
      
      if (item.crop_type && item.seed_date) {
          try {
              const res = await getGrowthStage(item.crop_type, item.seed_date)
              setGrowth(res.data)
              setTimeout(() => {
                journeyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }, 400)
          } catch (e) {
              console.error(e)
          }
      }
  }

  const handleDropdownSelect = (selectedType) => {
      setCropType(selectedType)
      setDropdownOpen(false)
      setHistorySelectedIdx(null) // deselect history when creating new
      
      // We do NOT call onCropSelected yet. We wait until they hit "Save Crop Profile"
      // otherwise it overrides without hitting the database.
      if (seedDate) {
          getGrowthStage(selectedType, seedDate).then(res => setGrowth(res.data)).catch(()=>{})
      }
  }

  const currentStageIdx = growth ? stageLabels.findIndex(s => s === growth.growth_stage) : -1
  const stageProgress = growth?.stage_progress || 0
  const overallProgress = growth?.overall_progress || stageProgress

  return (
    <section id="crops" className="relative z-[2] w-full px-4 sm:px-8 py-10 sm:py-12">
      <div className="relative z-10 w-full mx-auto flex flex-col gap-4 bg-black/40 backdrop-blur-xs border border-white/10 p-4 sm:p-5 rounded-2xl shadow-2xl max-w-[1400px] h-full max-h-[85vh]">

        {/* Section Title */}
        <h2 className="section-heading-agro text-center text-2xl sm:text-3xl tracking-tight animate-[fadeInRise_0.6s_ease-out_forwards] !mb-2">
          Manage Your Crop
        </h2>

        {/* 2 COLUMN LAYOUT: Form (Left) & Journey (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch w-full h-full min-h-0 overflow-hidden">
          
          {/* ═══ INNER LEFT: CROP SELECTION FORM ═══ */}
          <div className="animate-[fadeInRise_0.6s_ease-out_forwards] flex flex-col h-full min-h-0">
            <div className="w-full max-w-full flex flex-col gap-3 p-4 sm:p-5 rounded-xl flex-1 min-h-0 overflow-hidden"
                 style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', borderRadius: '12px' }}>

            {/* Custom Dropdown (Agropulse) */}
            <div ref={dropdownRef} className={`custom-dropdown ${dropdownOpen ? "open" : ""}`}>
              <div
                className={`dropdown-selected ${cropType ? "has-value" : ""}`}
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
              >
                {cropType || "Select your crop"}
              </div>
              <div className="dropdown-list">
                {crops.map((crop) => {
                  const isSown = cropHistory.some(item => item.crop_type === crop)
                  return (
                    <div
                      key={crop}
                      className={`dropdown-item ${isSown ? 'opacity-40 cursor-not-allowed hidden bg-white/5' : ''}`}
                      style={isSown ? { display: 'flex', justifyContent: 'space-between', opacity: 0.5 } : {}}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isSown) {
                          showSnackbar?.(`⚠ You have already sown ${crop}.`)
                          return
                        }
                        handleDropdownSelect(crop)
                      }}
                    >
                      <span>{crop}</span>
                      {isSown && <span className="text-xs border border-white/20 px-2 py-0.5 rounded-full">Already Sown</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Date Input */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                Select sowing date
              </label>
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-lg opacity-70">📅</span>
                <input
                  type="date"
                  value={seedDate}
                  onChange={(e) => {
                    const newDate = e.target.value
                    setSeedDate(newDate)
                    setHistorySelectedIdx(null) // deselect history item on manual edit
                    if (cropType && newDate) {
                      getGrowthStage(cropType, newDate)
                        .then(res => setGrowth(res.data))
                        .catch(() => {})
                    }
                  }}
                  className="date-input-agro"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={save}
              disabled={saving}
              className="btn-gradient-agro disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save New Crop Profile"}
            </button>
            
            {/* Scrollable Crop List (History) */}
            {cropHistory.length > 0 && (
                <div className="mt-2 pt-3 border-t border-white/10 animate-[fadeInRise_0.8s_ease-out_forwards] flex-1 flex flex-col min-h-0">
                   <h4 className="text-sm text-white/80 mb-2 drop-shadow-md font-medium">Previously Sown Crops</h4>
                   <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                     {cropHistory.map((item) => {
                        const isSelected = historySelectedIdx === item.list_id
                        return (
                          <div 
                             key={item.list_id} 
                             onClick={() => handleHistorySelect(item)}
                             className={`p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all duration-300 flex justify-between items-center shrink-0 ${isSelected ? "bg-white/10 border border-[#A3E635] shadow-[0_0_15px_rgba(163,230,53,0.2)]" : "bg-black/40 border border-white/10 hover:bg-white/10"}`}
                             style={{ borderRadius: '8px' }}
                          >
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-base">
                                     {item.crop_type === "Tomato" ? "🍅" : item.crop_type === "Corn" ? "🌽" : item.crop_type === "Potato" ? "🥔" : item.crop_type === "Cucumber" ? "🥒" : item.crop_type === "Wheat" ? "🌾" : "🌱"}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-white font-medium text-sm">{item.crop_type}</span>
                                    <span className="text-[10px] text-white/50">Sown on {item.seed_date}</span>
                                 </div>
                             </div>
                             <div className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${isSelected ? "bg-[#A3E635] text-black" : "bg-white/10 text-white/80"}`}>
                                {isSelected ? "Viewing" : "Select"}
                             </div>
                          </div>
                        )
                     })}
                   </div>
                </div>
            )}
          </div>
          </div> {/* END LEFT COLUMN */}

          {/* ═══ INNER RIGHT: CROP JOURNEY ═══ */}
          <div className="flex flex-col h-full min-h-0 animate-[fadeInRise_0.6s_ease-out_forwards]">
            {growth ? (
              <div ref={journeyRef} className="p-4 sm:p-5 rounded-xl flex-1 flex flex-col justify-center min-h-0"
                   style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', borderRadius: '12px' }}>
                <h3 className="section-heading-agro text-center text-xl mb-4 sm:mb-6">Crop Journey</h3>

                {/* Stage Grid */}
                <div className="flex items-center justify-between mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl relative shrink-0"
                 style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', borderRadius: '12px' }}>
              
              {/* Dynamic Connecting Line across the whole container */}
              <div className="absolute left-[10%] right-[10%] top-[40%] h-[4px] z-0 hidden sm:block rounded-full bg-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${Math.min(overallProgress, 100)}%`, background: "linear-gradient(90deg, #10b981, #A3E635)", boxShadow: "0 0 12px rgba(163, 230, 53, 0.5)" }} />
              </div>

              {stageLabels.map((stage, i) => {
                const isActive = i === currentStageIdx
                const isDone = i < currentStageIdx
                const isHarvested = stage === "Harvested" && (isActive || isDone)
                return (
                  <div key={stage} className="flex flex-col items-center z-10 w-16 sm:w-20 relative shrink-0">
                      <div
                        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-500 ${isActive ? "border-[#A3E635] bg-[#A3E635]/20 shadow-[0_0_15px_rgba(163,230,53,0.5)] scale-[1.15]" : isDone ? "border-[#2ECC71] bg-[#2ECC71]/20 shadow-[0_0_10px_rgba(46,204,113,0.3)]" : "border-white/20 bg-black/50 backdrop-blur-sm"}`}
                      >
                        <div
                          className={`text-lg sm:text-xl transition-all duration-500 drop-shadow-md`}
                          style={{ opacity: isDone || isActive ? 1 : 0.4, transform: isActive ? "scale(1.1)" : "scale(0.9)" }}
                        >
                          {stageEmojis[i]}
                        </div>
                      </div>
                      <p className={`mt-3 sm:mt-4 text-[10px] sm:text-xs font-semibold text-center transition-colors ${isActive ? "text-[#A3E635] drop-shadow-[0_0_5px_rgba(163,230,53,0.8)]" : isDone ? "text-[#2ECC71]" : "text-white/40"}`}>
                        {stage}
                      </p>
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="mb-2 flex items-center justify-between text-xs sm:text-sm text-white/70 shrink-0">
              <span>Overall growth progress</span>
              <span>{Math.min(overallProgress, 100).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-agro mb-4 sm:mb-6 h-3 sm:h-4 shrink-0">
              <div className="progress-fill-agro" style={{ width: `${Math.min(overallProgress, 100)}%` }} />
              <span className="progress-text-agro hidden">{Math.min(overallProgress, 100).toFixed(1)}%</span>
            </div>

            {/* Crop Details Card */}
            <div className="crop-details-grid gap-2 p-3 min-h-0 shrink-0" style={{ overflow: "hidden" }}>
              {[
                { label: "Crop", value: growth.crop_type },
                { label: "Sown Date", value: growth.seed_date },
                { label: "Total Lifespan", value: `~${growth.max_lifespan || 100} Days` },
                { label: "Plant Age", value: `${growth.days_after_sowing} Days` },
                { label: "Current Stage", value: growth.lifecycle_complete ? "🎉 Harvested" : `${growth.growth_stage} (Day ${growth.stage_day} of ${growth.stage_total_days})` },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-[11px] sm:text-xs text-white/50 leading-tight">{item.label}</span>
                  <strong className="text-sm text-white font-medium truncate">{item.value}</strong>
                </div>
              ))}
            </div>
            </div>
            ) : (
               <div className="p-4 rounded-xl flex-1 flex flex-col items-center justify-center text-center text-white/50 min-h-[250px] border border-white/10 border-dashed"
                    style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderRadius: '12px' }}>
                 <span className="text-3xl mb-3 opacity-50">🌱</span>
                 <p className="text-base">Select a crop from the left to view its journey</p>
               </div>
            )}
          </div> {/* END RIGHT COLUMN */}
        </div> {/* END 2 COLUMN LAYOUT */}

        {/* ═══ FERTIGATION HISTORY ═══ */}
        {/* {hist.length > 0 && (
          <div className="p-6 rounded-2xl animate-[fadeInRise_0.6s_ease-out_forwards]">
            <h3 className="section-heading-agro text-center text-2xl mb-6">Fertigation History</h3>
            <div className="flex flex-col gap-4 w-full"
                 style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '25px', borderRadius: '20px' }}>
              {hist.slice(0, 10).map((item, i) => (
                <div key={i} className="history-item-agro">
                  <span className="text-sm text-white/50">{new Date(item.timestamp).toLocaleString()}</span>
                  <span className="text-sm font-medium text-[#A3E635]">Fertigation completed</span>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </section>
  )
}
