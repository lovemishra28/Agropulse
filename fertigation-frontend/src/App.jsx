import { useState, useEffect, useRef, lazy, Suspense } from "react"
import s2Video from "./assets/s2.mp4"
import { getCropProfile } from "./services/api"

const HomePage = lazy(() => import("./pages/HomePage"))
const CropPage = lazy(() => import("./pages/CropPage"))
const FertilizePage = lazy(() => import("./pages/FertilizePage"))

/* SVG icon paths (inline to avoid extra dep for nav) */
const icons = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  insights: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 12H3"/><path d="M12 3v18"/>
    </svg>
  ),
  crops: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  fertilize: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>
    </svg>
  ),
}

const navItems = [
  { id: "home", label: "Home", icon: icons.home },
  { id: "insights", label: "Insights", icon: icons.insights },
  { id: "crops", label: "Crops", icon: icons.crops },
  { id: "fertilize", label: "Fertilize", icon: icons.fertilize },
]

function App() {
  const [activeSection, setActiveSection] = useState("home")
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [snackbar, setSnackbar] = useState("")
  const sectionRefs = useRef({})

  /* Fetch last sown crop on initial load so that other components have dynamic data ready */
  useEffect(() => {
    getCropProfile().then(r => {
      if (r.data?.length) {
        // Most recent at top, assign unique IDs based on index
        const historyData = [...r.data].reverse()
        setSelectedCrop(historyData[0])
      }
    }).catch(() => {})
  }, [])

  /* Scroll-spy replaced with dynamic scroll handler */
  useEffect(() => {
    const handleScroll = () => {
      // Background scroll tracking
      setScrolled(window.scrollY > 50)
      
      const ids = ["home", "insights", "crops", "fertilize"]
      let currentSection = "home" // default
      // check backwards so we find the lowest section currently in view
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 3) {
            currentSection = ids[i]
            break
          }
        }
      }
      
      setActiveSection((prev) => (prev !== currentSection ? currentSection : prev))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    
    // Periodically re-check for 2 seconds to catch lazy-loaded sections popping in
    const interval = setInterval(handleScroll, 500)
    setTimeout(() => clearInterval(interval), 3000)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearInterval(interval)
    }
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const showSnackbar = (msg) => {
    setSnackbar(msg)
    setTimeout(() => setSnackbar(""), 4000)
  }

  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden relative z-0">

      {/* Global Background Video (s2.mp4) - Placed under all sections except hero which covers it */}
      <video
        className="fixed top-0 left-0 w-full h-full object-cover -z-20"
        style={{ transform: "scale(1.08)" }}
        src={s2Video}
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Global overlay for contrast on top of global video */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/25 backdrop-blur-[2px] -z-10" />

      {/* ═══ NAVBAR (Minimal Sleek Style) ═══ */}
      <nav
        className={`fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 sm:px-12 py-3 lg:py-4 transition-all duration-500 ${
          scrolled ? "bg-black/75 backdrop-blur-md shadow-sm border-b border-white/5" : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
          onClick={() => scrollTo("home")}
        >
          <span className="hindi-text text-[1.75rem] font-light leading-none tracking-wide text-white/90">एग्रो</span>
          <span className="english-text text-[1.75rem] font-light leading-none tracking-wide opacity-90 mt-1">Pulse</span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-1 sm:gap-6 bg-black/20 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm shadow-inner">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-normal tracking-wide transition-all duration-300 cursor-pointer ${
                activeSection === n.id
                  ? "text-red-400 bg-red-400/10 shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`hidden sm:flex transition-opacity duration-300 ${activeSection === n.id ? "opacity-100" : "opacity-60"}`}>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ═══ SNACKBAR ═══ */}
      <div className={`snackbar ${snackbar ? "visible" : ""}`}>
        {snackbar}
      </div>

      {/* ═══ CONTENT ═══ */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-lg text-white/50">Loading…</div>
          </div>
        }
      >
        <HomePage showSnackbar={showSnackbar} />
        <CropPage
          selectedCrop={selectedCrop}
          onCropSelected={setSelectedCrop}
          showSnackbar={showSnackbar}
        />
        <FertilizePage
          selectedCrop={selectedCrop}
          showSnackbar={showSnackbar}
        />
      </Suspense>
    </div>
  )
}

export default App
