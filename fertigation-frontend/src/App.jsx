import { useState, useEffect } from "react"
import Dashboard from "./pages/Dashboard"

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("agropulse-theme") || "dark"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("agropulse-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark")
  }

  return (
    <>
      {/* ── Header / Navbar ── */}
      <header className="app-header">
        <div className="app-header-brand">
          <span className="app-header-logo">🌱</span>
          <div>
            <div className="app-header-title">AgroPulse</div>
            <div className="app-header-subtitle">Smart Fertigation System</div>
          </div>
        </div>

        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="theme-toggle-icon">
            {theme === "dark" ? "☀️" : "🌙"}
          </span>
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </header>

      {/* ── Dashboard ── */}
      <Dashboard />
    </>
  )
}

export default App