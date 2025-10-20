import { useCallback, useEffect, useState } from "react"

type UnityStatus = {
  online: boolean
  mode: "working" | "break" | "offline"
  activity?: string
  scene?: string
  lastUpdate: number
}

function prettySince(ts: number) {
  if (!ts || ts < Date.now() - 1000 * 60 * 60 * 24 * 14) return "—"; // staré/offline
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "před chvílí";
  if (m < 60) return `před ${m} min`;
  const h = Math.floor(m / 60);
  return `před ${h} h`;
}

export default function UnityStatusCard() {
  const [status, setStatus] = useState<UnityStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/unity-status", { headers: { accept: "application/json" } })
      if (!res.ok) throw new Error(res.statusText)
      const s = await res.json() as UnityStatus
      setStatus(s); setError(null)
    } catch (e: any) {
      // fallback pro DEV, když neběží worker
      setStatus({
        online: false, mode: "offline", activity: "", scene: "", lastUpdate: Date.now()
      })
      setError("API nedostupné (dev fallback)")
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [load])

  const badge = (m: UnityStatus["mode"]) => {
    if (m === "working") return <span className="badge green">🟢 Pracuji</span>
    if (m === "break")   return <span className="badge yellow">🟡 Pauza</span>
    return <span className="badge gray">⚫ Offline</span>
  }

  return (
    <div className="glass card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h2>Unity status</h2>
          <p className="small">Živý indikátor práce v Unity</p>
        </div>
        {status && badge(status.mode)}
      </div>

      {error && <p className="small" style={{ color: "#fca5a5", marginTop: 8 }}>{error}</p>}

      <div style={{ marginTop: 12, lineHeight: "1.6" }}>
        <div><span className="small">Aktivita:</span> {status?.activity || "—"}</div>
        <div><span className="small">Scéna:</span> {status?.scene || "—"}</div>
        <div><span className="small">Naposledy:</span> {status ? prettySince(status.lastUpdate) : "—"}</div>
      </div>
    </div>
  )
}
