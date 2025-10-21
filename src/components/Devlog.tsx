// src/components/Devlog.tsx
import { useEffect, useMemo, useState } from "react";

type Category = "updates" | "technical" | "art";
type Post = {
  slug: string;
  title: string;
  category: Category;
  excerpt: string;
  thumbnail?: string;
  published_at?: number; // unix (s)
};

export default function Devlog() {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/posts", { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        const rows = (await res.json()) as any[];
        if (!alive) return;
        // mapujeme jen to, co opravdu potřebujeme
        const mapped: Post[] = rows.map(r => ({
          slug: r.slug,
          title: r.title,
          category: r.category,
          excerpt: r.excerpt ?? "",
          thumbnail: r.thumbnail ?? undefined,
          published_at: r.published_at ?? undefined,
        }));
        setData(mapped);
      } catch (e: any) {
        if (!alive) return;
        setErr("Nepodařilo se načíst Devlog.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? data : data.filter((p) => p.category === filter)),
    [filter, data]
  );

  const fmtDate = (unix?: number) =>
    unix ? new Date(unix * 1000).toLocaleDateString() : "—";

  return (
    <section id="devlog" className="devlog">
      <div className="container">
        <h2 className="section-title">Development Blog</h2>

        <div className="devlog-filters">
          {(["all", "updates", "technical", "art"] as const).map((k) => (
            <button
              key={k}
              className={`filter-btn ${filter === k ? "active" : ""}`}
              onClick={() => setFilter(k as any)}
              data-filter={k}
            >
              {k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        {err && (
          <p className="small" style={{ color: "#fca5a5", marginTop: 8 }}>
            {err}
          </p>
        )}

        {loading ? (
          <div className="devlog-grid" id="devlog-grid">
            {/* jednoduchý skeleton (3 boxy) */}
            {[0, 1, 2].map((i) => (
              <div key={i} className="devlog-card" aria-busy="true">
                <div className="devlog-thumbnail">⏳</div>
                <div className="devlog-content">
                  <div className="devlog-meta">
                    <span className="devlog-date">Načítám…</span>
                    <span className="devlog-category">—</span>
                  </div>
                  <h4 className="devlog-title">Načítám…</h4>
                  <p className="devlog-excerpt">Prosím čekejte…</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="devlog-grid" id="devlog-grid">
            {filtered.map((p, i) => (
              <a
                className="devlog-card"
                key={i}
                href={`/blog/${p.slug}`}
                data-category={p.category}
              >
                <div className="devlog-thumbnail">{p.thumbnail || "📝"}</div>
                <div className="devlog-content">
                  <div className="devlog-meta">
                    <span className="devlog-date">{fmtDate(p.published_at)}</span>
                    <span className="devlog-category">
                      {p.category[0].toUpperCase() + p.category.slice(1)}
                    </span>
                  </div>
                  <h4 className="devlog-title">{p.title}</h4>
                  <p className="devlog-excerpt">{p.excerpt}</p>
                </div>
              </a>
            ))}
            {!filtered.length && !err && (
              <div className="devlog-card">
                <div className="devlog-thumbnail">🕳️</div>
                <div className="devlog-content">
                  <div className="devlog-meta">
                    <span className="devlog-date">—</span>
                    <span className="devlog-category">—</span>
                  </div>
                  <h4 className="devlog-title">Žádné příspěvky</h4>
                  <p className="devlog-excerpt">Zatím tu nic není.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
