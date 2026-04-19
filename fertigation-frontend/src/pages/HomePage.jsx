import { useEffect, useState, useCallback, useRef } from "react";
import {
  getSensorData,
  getSimulatorStatus,
  startSimulator,
  stopSimulator,
} from "../services/api";
import SensorChart from "../components/SensorChart";
import PlantMoodSVG from "../components/PlantMoodSVG";

import heroVideo from "../assets/Hero.mp4";
// import happyVideo from "../assets/happyvibe.mp4"
// import mediumVideo from "../assets/mediumvibe.mp4"
// import sadVideo from "../assets/sadvibe.mp4"

import { FiDroplet, FiWind, FiSun } from "react-icons/fi";
import { FaThermometerHalf } from "react-icons/fa";

export default function HomePage({ showSnackbar }) {
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState(null);
  const [simOn, setSimOn] = useState(false);
  const [simBusy, setSimBusy] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const r = await getSensorData(filter);
      if (r.data.length) setSensorData(r.data[r.data.length - 1]);
      setHistory(r.data);
    } catch (e) {
      console.error(e);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
    getSimulatorStatus()
      .then((r) => setSimOn(r.data.running))
      .catch(() => {});
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [fetchData]);

  const toggleSim = async () => {
    setSimBusy(true);
    try {
      if (simOn) {
        await stopSimulator();
        setSimOn(false);
        showSnackbar?.("🛑 Simulator stopped");
      } else {
        await startSimulator(5);
        setSimOn(true);
        showSnackbar?.("▶ Simulator running — generating data");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimBusy(false);
    }
  };

  /* Health calculation */
  const getHealth = () => {
    if (!sensorData) return { score: 85, mood: "happy" };
    const score = (val, lo, ideal, hi) => {
      if (val >= ideal - 5 && val <= ideal + 5) return 100;
      if (val < lo || val > hi) return 10;
      return val < ideal
        ? Math.max(10, ((val - lo) / (ideal - lo)) * 100)
        : Math.max(10, ((hi - val) / (hi - ideal)) * 100);
    };
    const healthScore = Math.round(
      (score(sensorData.soil_moisture, 20, 55, 85) +
        score(sensorData.temperature, 15, 27, 38) +
        score(sensorData.humidity, 30, 60, 85) +
        score(sensorData.light_intensity, 100, 400, 800)) /
        4,
    );
    let mood = "medium";
    if (healthScore > 70) mood = "happy";
    else if (healthScore < 40) mood = "sad";
    return { score: healthScore, mood };
  };

  const { score: healthScore, mood } = getHealth();

  const moodConfig = {
    happy: { text: "Thriving — your crop is happy!", color: "#A3E635" },
    medium: { text: "Moderate — needs attention.", color: "#FFA726" },
    sad: { text: "Critical — your crop is struggling!", color: "#ef4444" },
  };

  const sensorCards = [
    { label: "Soil Moisture", key: "soil_moisture", unit: "%", icon: <FiDroplet className="text-blue-400" /> },
    { label: "Temperature", key: "temperature", unit: "°C", icon: <FaThermometerHalf className="text-red-400" /> },
    { label: "Humidity", key: "humidity", unit: "%", icon: <FiWind className="text-gray-300" /> },
    { label: "Light", key: "light_intensity", unit: "lx", icon: <FiSun className="text-yellow-400" /> },
  ];

  return (
    <>
      {/* ═══════════════════════════════════ */}
      {/*  HERO SECTION (Full-screen Video)  */}
      {/* ═══════════════════════════════════ */}
      <section
        id="home"
        className="relative w-full h-screen flex items-center justify-center bg-black z-20"
        style={{
          clipPath: "url(#hero-curve)",
        }}
      >
        <svg width="0" height="0" className="absolute pointer-events-none">
          <clipPath id="hero-curve" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 1,0 L 1,0.9 C 0.75,1.05 0.35,0.85 0,0.95 Z" />
          </clipPath>
        </svg>

        {/* Background Videos — Hero.mp4 is the primary full-screen background */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          {/* Primary: Hero.mp4 always playing (like original Agropulse) */}
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Mood tint overlay videos (low opacity, cross-fade on top) */}
          {/* <video src={happyVideo} autoPlay loop muted playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ${mood === 'happy' ? 'opacity-30' : 'opacity-0'}`} />
          <video src={sadVideo} autoPlay loop muted playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ${mood === 'sad' ? 'opacity-35' : 'opacity-0'}`} />
          <div className="hero-overlay absolute inset-0 bg-black/20" />
          <div className="hero-overlay-gradient absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-black/60 to-transparent" /> */}
        </div>

        {/* Hero Content (Agropulse Title + Heartbeat Line) */}
        <div
          className="relative z-10 w-full max-w-[1200px] px-[2%] flex flex-col items-start animate-[fadeUp_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0"
          style={{ marginTop: "-12vh" }}
        >
          <div
            className="inline-flex flex-col items-stretch rounded-2xl"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.25), rgba(0,0,0,0))",
              padding: "30px 100px 30px 40px",
              marginLeft: "-120px",
            }}
          >
            <h1 className="flex flex-col md:flex-row items-center md:items-baseline gap-0 md:gap-[15px] pt-[20px] md:pt-[15px] mb-[5px] overflow-visible leading-[1.4]">
              <span className="hindi-text overflow-visible text-[80px] lg:text-[140px] pb-2 md:pb-0">
                एग्रो
              </span>
              <span className="english-text overflow-visible font-semibold text-[80px] lg:text-[145px] pb-2 md:pb-0">
                Pulse
              </span>
            </h1>

            {/* Decorative Heartbeat Line */}
            <div
              className="flex items-center justify-start w-full max-w-[450px] lg:max-w-none opacity-95 overflow-visible md:mx-0"
              style={{ marginTop: "-15px" }}
            >
              <svg
                width="100%"
                height="45"
                viewBox="0 0 600 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M10 30 H250 L260 40 L270 15 L285 50 L300 5 L315 40 L325 30 H590"
                  stroke="#A3E635"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(163, 230, 53, 0.5))",
                    animation: "flowGlow 3s ease-in-out infinite alternate",
                  }}
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ */}
      {/*  INSIGHTS SECTION                  */}
      {/* ═══════════════════════════════════ */}
      <div className="relative">
        <section
          id="insights"
          className="relative z-[2] w-full px-4 sm:px-8 py-10 sm:py-12"
        >
          <div className="relative z-10 w-full max-w-[1400px] mx-auto bg-black/40 backdrop-blur-xs border border-white/10 p-4 sm:p-5 rounded-2xl shadow-2xl">
            {/* 2-Column Main Layout for Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-full max-h-[80vh]">
              
              {/* Left Column: Plant Mood & Status (Smaller width) */}
              <div className="lg:col-span-3 glass-panel p-5 flex flex-col items-center justify-between text-center relative overflow-hidden h-full">
                {/* Subtle background glow effect based on mood */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${moodConfig[mood].color}, transparent 60%)`,
                  }}
                />

                {/* Animated Pot in a Circle (Top) */}
                <div
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex-shrink-0 flex items-center justify-center relative shadow-[inset_0_4px_20px_rgba(0,0,0,0.5),_0_4px_20px_rgba(0,0,0,0.3)] border border-white/10 z-10 mt-2"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {/* Center the plant directly within the circle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="scale-[0.8] sm:scale-[0.95] origin-center translate-y-5">
                      <PlantMoodSVG
                        mood={mood}
                        healthScore={healthScore}
                        simOn={simOn}
                      />
                    </div>
                  </div>
                </div>

                {/* Health Status & Score (Middle) */}
                <div className="flex flex-col items-center justify-center w-full gap-1 z-10 my-auto">
                  <h2
                    className="text-base sm:text-lg font-bold leading-tight drop-shadow-lg"
                    style={{
                      color: moodConfig[mood].color,
                      textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                    }}
                  >
                    {moodConfig[mood].text}
                  </h2>
                  <p className="text-sm text-white/80 font-medium">
                    Health Score:{" "}
                    <span className="font-bold text-white text-base sm:text-lg ml-1">
                      {healthScore}%
                    </span>
                  </p>
                </div>
                  
                {/* Simulator Button (Bottom) */}
                <div className="w-full z-10 mb-1 mt-2">
                  <button
                    onClick={toggleSim}
                    disabled={simBusy}
                    className={`btn-primary-agro text-sm px-4 py-3 w-full ${simOn ? "" : "sim-btn-pulse"} ${simOn ? "!bg-red-500/20 !text-red-400 !border !border-red-500/30 !shadow-none" : ""} disabled:opacity-50 shadow-lg shrink-0`}
                  >
                    {simOn ? "⏹ Stop Sim" : "▶ Start Sim"}
                  </button>
                </div>
              </div>

              {/* Right Column: Sensors & Chart (Larger width) */}
              <div className="lg:col-span-9 flex flex-col gap-3 sm:gap-4 h-full min-h-0">
                
                {/* Top: 4 Sensor Boxes + NPK Circles */}
                <div className="flex flex-col gap-3 shrink-0">
                  {/* The 4 main sensors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {sensorCards.map((c) => (
                      <div key={c.key} className="glass-panel p-3 flex flex-col justify-center items-center text-center">
                        <div className="flex items-center gap-2 mb-1 text-white/80">
                          <span className="text-lg">{c.icon}</span>
                          <h4 className="text-xs sm:text-sm font-medium whitespace-nowrap">{c.label}</h4>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-xl sm:text-2xl font-bold text-white leading-none tracking-tight"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {sensorData ? sensorData[c.key] : "--"}
                          </span>
                          <span className="text-xs text-white/50 shrink-0">
                            {c.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* NPK Tiny Rounded Pill Indicators */}
                  <div className="flex justify-between w-full gap-3">
                    {[
                      { label: "N", full: "Nitrogen", key: "nitrogen", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
                      { label: "P", full: "Phosphorus", key: "phosphorus", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
                      { label: "K", full: "Potassium", key: "potassium", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" }
                    ].map((npk) => {
                      const val = sensorData ? sensorData[npk.key] : 0;
                      const totalNPK = sensorData ? (sensorData.nitrogen + sensorData.phosphorus + sensorData.potassium) : 1;
                      const percentage = sensorData && totalNPK > 0 ? Math.round((val / totalNPK) * 100) : 0;
                      
                      return (
                        <div key={npk.key} 
                             className="flex-1 flex items-center justify-between glass-panel p-2 pl-3 pr-4" 
                             style={{ borderRadius: '9999px' }} 
                             title={npk.full}>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" 
                                      style={{ backgroundColor: npk.bg, color: npk.color }}>
                                    {npk.label}
                                </span>
                                <span className="text-sm text-white/80 font-medium hidden sm:block">{npk.full}</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: npk.color }}>
                                {sensorData ? `${percentage}%` : "--"}
                            </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Bottom: Chart Section */}
                <div className="glass-panel p-4 flex-1 min-h-[300px] relative flex flex-col overflow-hidden">
                  <SensorChart data={history} onFilterChange={setFilter} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
