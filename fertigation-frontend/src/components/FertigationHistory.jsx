import { useEffect, useState } from "react"
import { getFertigationHistory } from "../services/api"

function FertigationHistory() {

  const [history, setHistory] = useState([])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await getFertigationHistory()
      setHistory(res.data.history)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="history-card">
      <h3 className="history-title">📋 Fertigation History</h3>

      {history.length === 0 && (
        <p className="history-empty">No fertigation events recorded yet.</p>
      )}

      {history.map((item, index) => (
        <div key={index} className="history-item">
          <span>💧</span>
          <span>
            {new Date(item.timestamp).toLocaleString()} — Fertigation Started
          </span>
        </div>
      ))}
    </div>
  )
}

export default FertigationHistory