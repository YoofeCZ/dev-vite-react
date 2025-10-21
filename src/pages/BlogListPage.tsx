import { useEffect, useMemo, useState } from "react"

type Category = "updates" | "technical" | "art"
type Row = {
  slug: string
  title: string
  category: Category
  excerpt: string
  thumbnail?: string
  published_at?: number
}

export default function BlogListPage() {
  const [q, setQ] = useState("")
  const [category, setCategory] = useState<"" | Category>("")
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true); setErr(null)
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      if (category) params.set("category", category)
      params.set("limit", "100")
      try {
        const res = await fetch(`/api/posts?${params.toString()}`, { headers: { accept: "application/json" } })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as Row[]
        if (!alive) return
        setRows(data)
      } catch (e: any) {
        if (!alive) return
        setErr("Nepodařilo se načíst články.")
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => { alive = false }
  }, [q, category])

  const fmtDate = (unix?: number) => unix ? new Date(unix * 1000).toLocaleDateString() : "—"

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="section-title">Blog</h1>

      {/* Vyhledávání + filtry */}
      <div className="devlog-filters" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hledat v názvu a perexu…"
          className="glass"
          style={{ padding: "10px 12px", borderRadius: 10, minWidth: 280, outline: "none", border: "1px solid #2a2a2a", background: "rgba(255,255,255,.03)" }}
        />
        {(["", "updates", "technical", "art"] as const).map(cat => (
          <button
            key={cat || "all"}
            onClick={() => setCategory(cat as any)}
            className={`filter-btn ${category === cat ? "active" : ""}`}
          >
            {cat ? cat[0].toUpperCase() + cat.slice(1) : "All"}
          </button>
        ))}
      </div>

      {err && <p className="small" style={{ color: "#fca5a5", marginTop: 8 }}>{err}</p>}

      {/* Karty */}
      <div className="devlog-grid" id="devlog-grid" style={{ marginTop: 16 }}>
        {loading ? (
          [0,1,2].map(i => (
            <div key={i} className="devlog-card" aria-busy="true">
              <div className="devlog-thumbnail">⏳</div>
              <div className="devlog-content">
                <div className="devlog-meta">
                  <span className="devlog-date">—</span>
                  <span className="devlog-category">—</span>
                </div>
                <h4 className="devlog-title">Načítám…</h4>
                <p className="devlog-excerpt">…</p>
              </div>
            </div>
          ))
        ) : rows.length ? (
          rows.map((p, i) => (
            <a className="devlog-card" key={i} href={`/blog/${p.slug}`} data-category={p.category}>
              <div className="devlog-thumbnail">{p.thumbnail || "📝"}</div>
              <div className="devlog-content">
                <div className="devlog-meta">
                  <span className="devlog-date">{fmtDate(p.published_at)}</span>
                  <span className="devlog-category">{p.category[0].toUpperCase()+p.category.slice(1)}</span>
                </div>
                <h4 className="devlog-title">{p.title}</h4>
                <p className="devlog-excerpt">{p.excerpt}</p>
              </div>
            </a>
          ))
        ) : (
          <div className="devlog-card">
            <div className="devlog-thumbnail">🕳️</div>
            <div className="devlog-content">
              <h4 className="devlog-title">Nic nenalezeno</h4>
              <p className="devlog-excerpt">Zkus změnit vyhledávání nebo filtr.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
