import { useEffect, useState } from "react"
import { getCropProfile, setCropProfile, getSupportedCrops } from "../services/api"

function CropSetup({ onProfileSaved }) {

  const [cropType, setCropType] = useState("")
  const [seedDate, setSeedDate] = useState("")
  const [supportedCrops, setSupportedCrops] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchCrops()
    fetchCurrentProfile()
  }, [])

  const fetchCrops = async () => {
    try {
      const res = await getSupportedCrops()
      setSupportedCrops(res.data.crops)
    } catch (error) {
      console.error("Failed to load supported crops:", error)
    }
  }

  const fetchCurrentProfile = async () => {
    try {
      const res = await getCropProfile()
      if (res.data && res.data.length > 0) {
        const latest = res.data[res.data.length - 1]
        setCurrentProfile(latest)
        setCropType(latest.crop_type || "")
        setSeedDate(latest.seed_date || "")
      }
    } catch (error) {
      console.error("Failed to load crop profile:", error)
    }
  }

  const handleSave = async () => {
    if (!cropType || !seedDate) {
      setMessage("warning:⚠ Please select both crop type and sowing date.")
      return
    }

    setSaving(true)
    setMessage("")

    try {
      await setCropProfile({ crop_type: cropType, seed_date: seedDate })
      setMessage("success:✅ Crop profile saved successfully!")
      setCurrentProfile({ crop_type: cropType, seed_date: seedDate })
      if (onProfileSaved) onProfileSaved()
    } catch (error) {
      console.error("Failed to save crop profile:", error)
      setMessage("error:❌ Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const msgType = message.split(":")[0]
  const msgText = message.split(":").slice(1).join(":")

  return (
    <div className="card section">

      <h3 className="card-title">🌾 Crop Profile Setup</h3>
      <p className="card-description">
        Select your crop and sowing date so the system can track growth stages and calculate accurate fertilizer doses.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Crop Type</label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="form-select"
          >
            <option value="">— Select Crop —</option>
            {supportedCrops.map((crop) => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Sowing Date</label>
          <input
            type="date"
            value={seedDate}
            onChange={(e) => setSeedDate(e.target.value)}
            className="form-input"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {message && (
        <p className={`message message-${msgType}`}>{msgText}</p>
      )}

      {currentProfile && (
        <div className="active-profile">
          <strong>Active Profile:</strong>{" "}
          {currentProfile.crop_type} — sown on {currentProfile.seed_date}
        </div>
      )}

    </div>
  )
}

export default CropSetup
