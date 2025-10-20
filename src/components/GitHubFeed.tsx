import { useEffect, useState } from "react"

type LatestCommit = {
  sha: string
  message: string
  author: string
  url: string
  timestamp: number
}

export default function GitHubFeed({ compact = false }: { compact?: boolean }) {
  const [commit, setCommit] = useState<LatestCommit | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/latest-commit", { headers: { accept: "application/json" } })
        if (!res.ok) throw new Error(res.statusText)
        setCommit(await res.json())
      } catch {
        setError("API nedostupné (dev fallback)")
        setCommit(null)
      }
    })()
  }, [])

  const wrapperClass = compact ? "card-inner" : "glass card"

  return (
    <div className={wrapperClass}>
      <h2>Poslední commit</h2>
      <p className="small">Automaticky přes GitHub webhook</p>
      {error && <p className="small" style={{ color: "#fca5a5", marginTop: 8 }}>{error}</p>}
      {commit ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ opacity: .9 }}>{commit.message}</div>
          <div className="small" style={{ marginTop: 6 }}>Autor: {commit.author}</div>
          <a className="link" href={commit.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 6 }}>
            {commit.sha.slice(0, 7)} ↗
          </a>
        </div>
      ) : (
        <p className="small" style={{ marginTop: 10 }}>Zatím žádné commity přijaty webhookem.</p>
      )}
    </div>
  )
}
