import { useCallback, useEffect, useRef, useState } from "react"

type UnityStatus = {
  online: boolean
  mode: "working" | "break" | "offline"
  activity?: string
  scene?: string
  lastUpdate: number
  // Volitelné rozšíření, které může posílat Unity plugin:
  totalMs?: number          // kumulativně odpracovaný čas na projektu
  sessionMs?: number        // délka aktuální session
  project?: {
    name?: string
    startedAt?: number      // timestamp prvního spuštění projektu
    tenureMs?: number       // pokud uživatel vyplní, že na projektu pracuje X času
  }
  editor?: {
    version?: string
  }
}

type Props = {
  compact?: boolean
  /** Plná URL nebo relativní cesta. Když nevyplníš, vezme se NEXT_PUBLIC_UNITY_STATUS_URL nebo /api/unity-status */
  endpoint?: string
  /** Interval pollingu v ms (default 10s, min 2s) */
  pollMs?: number
}

function prettySince(ts: number) {
  if (!ts || ts < Date.now() - 1000 * 60 * 60 * 24 * 14) return "—"
  const diff = Date.now() - ts
  const s = Math.max(0, Math.floor(diff / 1000))
  if (s < 5) return "živě"
  if (s < 60) return `před ${s} s`
  const m = Math.floor(s / 60)
  if (m < 60) return `před ${m} min`
  const h = Math.floor(m / 60)
  return `před ${h} h`
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
  if (years) parts.push(`${years} r`)
  if (months) parts.push(`${months} m`)
  if (days) parts.push(`${days} d`)
  if (hours) parts.push(`${hours} h`)
  if (minutes || parts.length === 0) parts.push(`${minutes} min`)
  return parts.join(" ")
}

function calcTenureMs(s?: UnityStatus) {
  // Preferuj explicitní tenureMs z pluginu. Jinak spočítej z startedAt.
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
      ? // @ts-ignore — v Nextu dostupné v build-time
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
      // fallback lokální hodnota, ať UI není prázdné
      setStatus({
        online: false,
        mode: "offline",
        activity: "",
        scene: "",
        lastUpdate: Date.now(),
        totalMs: 0,
        project: undefined,
      })
      setError("API nedostupné (dev fallback)")
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
    if (m === "working") return <span className="badge green">🟢 Pracuji</span>
    if (m === "break") return <span className="badge yellow">🟡 Pauza</span>
    return <span className="badge gray">⚫ Offline</span>
  }

  const wrapperClass = compact ? "card-inner" : "glass card"
  const tenureMs = status ? calcTenureMs(status) : 0

  return (
    <div className={wrapperClass}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h2>Unity status</h2>
          <p className="small">Živý indikátor práce v Unity</p>
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
          <span className="small">Projekt:</span>{" "}
          {status?.project?.name || "—"}
        </div>
        <div>
          <span className="small">Aktivita:</span>{" "}
          {status?.activity || "—"}
        </div>
        <div>
          <span className="small">Scéna:</span>{" "}
          {status?.scene || "—"}
        </div>
        <div>
          <span className="small">Naposledy:</span>{" "}
          {status ? prettySince(status.lastUpdate) : "—"}
        </div>
        <div>
          <span className="small">Délka projektu:</span>{" "}
          {fmtDur(tenureMs)}
        </div>
        <div>
          <span className="small">Odpracováno celkem:</span>{" "}
          {fmtDur(status?.totalMs)}
        </div>
        {typeof status?.sessionMs === "number" && (
          <div>
            <span className="small">Aktuální seance:</span>{" "}
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
