import { useCallback, useEffect, useRef, useState } from "react"

type UnityStatus = {
  online: boolean
  mode: "working" | "break" | "offline"
  activity?: string
  scene?: string
  lastUpdate: number
  // Optional extension that the Unity plugin can send:
  totalMs?: number          // cumulative time worked on the project
  sessionMs?: number        // length of the current session
  project?: {
    name?: string
    startedAt?: number      // timestamp when the project was first launched
    tenureMs?: number       // if the user specifies they've been on the project for X time
  }
  editor?: {
    version?: string
  }
}

type Props = {
  compact?: boolean
  /** Full URL or relative path. If omitted, NEXT_PUBLIC_UNITY_STATUS_URL or /api/unity-status will be used */
  endpoint?: string
  /** Polling interval in ms (default 10s, min 2s) */
  pollMs?: number
}

function prettySince(ts: number) {
  if (!ts || ts < Date.now() - 1000 * 60 * 60 * 24 * 14) return "—"
  const diff = Date.now() - ts
  const s = Math.max(0, Math.floor(diff / 1000))
  if (s < 5) return "live"
  if (s < 60) return `${s} s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  return `${h} h ago`
}

function fmtDur(ms?: number) {
  if (!ms || ms <= 0) return "0 min"
  const totalMin = Math.floor(ms / 60000)
  const years = Math.floor(totalMin / (60 * 24 * 365))
  const daysTotal = Math.floor(totalMin / (60 * 24)) - years * 365
  const months = Math.floor(daysTotal / 30)
  const days = daysTotal % 30
  const hours = Math.floor((totalMin % (60 * 24)) / 60)
  const minutes = totalMin % 60

  const parts: string[] = []
  if (years) parts.push(`${years} y`)
  if (months) parts.push(`${months} mo`)
  if (days) parts.push(`${days} d`)
  if (hours) parts.push(`${hours} h`)
  if (minutes || parts.length === 0) parts.push(`${minutes} min`)
  return parts.join(" ")
}

function calcTenureMs(s?: UnityStatus) {
  // Prefer explicit tenureMs from the plugin. Otherwise compute from startedAt.
  const t = s?.project?.tenureMs
  if (t && t > 0) return t
  const started = s?.project?.startedAt
  if (started && started > 0) {
    const diff = Date.now() - started
    return diff > 0 ? diff : 0
  }
  return 0
}

export default function UnityStatusCard({
  compact = false,
  endpoint,
  pollMs = 10000,
}: Props) {
  const [status, setStatus] = useState<UnityStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const resolvedEndpoint =
    endpoint ||
    (typeof process !== "undefined"
      ? // @ts-ignore — available at build time in Next.js
        process.env.NEXT_PUBLIC_UNITY_STATUS_URL
      : undefined) ||
    "/api/unity-status"

  const load = useCallback(async () => {
    try {
      const res = await fetch(resolvedEndpoint, { headers: { accept: "application/json" } })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const s = (await res.json()) as UnityStatus
      setStatus(s)
      setError(null)
    } catch (e) {
      // local fallback so the UI isn't empty
      setStatus({
        online: false,
        mode: "offline",
        activity: "",
        scene: "",
        lastUpdate: Date.now(),
        totalMs: 0,
        project: undefined,
      })
      setError("API unavailable (dev fallback)")
    }
  }, [resolvedEndpoint])

  useEffect(() => {
    load()
    timerRef.current = window.setInterval(load, Math.max(2000, pollMs))
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [load, pollMs])

  const badge = (m: UnityStatus["mode"]) => {
    if (m === "working") return <span className="badge green">🟢 Working</span>
    if (m === "break") return <span className="badge yellow">🟡 Break</span>
    return <span className="badge gray">⚫ Offline</span>
  }

  const wrapperClass = compact ? "card-inner" : "glass card"
  const tenureMs = status ? calcTenureMs(status) : 0

  return (
    <div className={wrapperClass}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h2>Unity status</h2>
          <p className="small">Live indicator of Unity work</p>
        </div>
        {status ? badge(status.mode) : badge("offline")}
      </div>

      {error && (
        <p className="small" style={{ color: "#fca5a5", marginTop: 8 }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 12, lineHeight: "1.6" }}>
        <div>
          <span className="small">Project:</span>{" "}
          {status?.project?.name || "—"}
        </div>
        <div>
          <span className="small">Activity:</span>{" "}
          {status?.activity || "—"}
        </div>
        <div>
          <span className="small">Scene:</span>{" "}
          {status?.scene || "—"}
        </div>
        <div>
          <span className="small">Last update:</span>{" "}
          {status ? prettySince(status.lastUpdate) : "—"}
        </div>
        <div>
          <span className="small">Project duration:</span>{" "}
          {fmtDur(tenureMs)}
        </div>
        <div>
          <span className="small">Total time worked:</span>{" "}
          {fmtDur(status?.totalMs)}
        </div>
        {typeof status?.sessionMs === "number" && (
          <div>
            <span className="small">Current session:</span>{" "}
            {fmtDur(status?.sessionMs)}
          </div>
        )}
        {status?.editor?.version && (
          <div>
            <span className="small">Unity:</span>{" "}
            {status.editor.version}
          </div>
        )}
      </div>

      {!compact && (
        <p className="tiny" style={{ opacity: 0.6, marginTop: 10 }}>
          Endpoint: <code>{resolvedEndpoint}</code>
        </p>
      )}
    </div>
  )
}
