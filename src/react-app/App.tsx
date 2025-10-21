import "./index.css";
import "./site.css";

import { Routes, Route, Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturesGrid from "../components/FeaturesGrid";
import StatusDashboard from "../components/StatusDashboard";
import Devlog from "../components/Devlog";
import CommunityLinks from "../components/CommunityLinks";
import SiteFooter from "../components/SiteFooter";

/** ========== ROUTER SHELL ========== */
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}

/** ========== TVOJE PŮVODNÍ HOMEPAGE ========== */
function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <StatusDashboard />
      <Devlog />
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <CommunityLinks />
        </div>
      </section>
    </>
  );
}

/** ========== /blog – archiv se seznamem, filtrem a hledáním ========== */
type Category = "updates" | "technical" | "art";
type Row = {
  slug: string;
  title: string;
  category: Category;
  excerpt: string;
  thumbnail?: string;
  published_at?: number;
};

function BlogListPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"" | Category>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);
        params.set("limit", "100");
        const res = await fetch(`/api/posts?${params.toString()}`, {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Row[];
        if (!alive) return;
        setRows(data);
      } catch {
        if (!alive) return;
        setErr("Nepodařilo se načíst články.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [q, category]);

  const fmtDate = (unix?: number) =>
    unix ? new Date(unix * 1000).toLocaleDateString() : "—";

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="section-title">Blog</h1>

      {/* vyhledávání + filtry */}
      <div
        className="devlog-filters"
        style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hledat v názvu a perexu…"
          className="glass"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            minWidth: 280,
            outline: "none",
            border: "1px solid #2a2a2a",
            background: "rgba(255,255,255,.03)",
          }}
        />
        {(["", "updates", "technical", "art"] as const).map((cat) => (
          <button
            key={cat || "all"}
            onClick={() => setCategory(cat as any)}
            className={`filter-btn ${category === cat ? "active" : ""}`}
          >
            {cat ? cat[0].toUpperCase() + cat.slice(1) : "All"}
          </button>
        ))}
      </div>

      {err && (
        <p className="small" style={{ color: "#fca5a5", marginTop: 8 }}>
          {err}
        </p>
      )}

      {/* karty */}
      <div className="devlog-grid" id="devlog-grid" style={{ marginTop: 16 }}>
        {loading ? (
          [0, 1, 2].map((i) => (
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
          ))
        ) : (
          <div className="devlog-card">
            <div className="devlog-thumbnail">🕳️</div>
            <div className="devlog-content">
              <h4 className="devlog-title">Nic nenalezeno</h4>
              <p className="devlog-excerpt">
                Zkus změnit vyhledávání nebo filtr.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** ========== /blog/:slug – detail (jednoduchý Markdown render bez knihoven) ========== */
type PostDetail = {
  slug: string;
  title: string;
  category: Category;
  excerpt: string;
  body_md: string;
  thumbnail?: string;
  published_at?: number;
};

function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/posts/${slug}`, {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as PostDetail;
        if (!alive) return;
        setPost(data);
      } catch {
        if (!slug) return;
        setErr("Článek nenalezen.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const fmtDate = (unix?: number) =>
    unix ? new Date(unix * 1000).toLocaleDateString() : "—";

  // velmi jednoduchý markdown → html (bez závislostí)
  const html = useMemo(() => {
    if (!post?.body_md) return "";
    let s = post.body_md;

    // headingy
    s = s.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    s = s.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    s = s.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    // tučné
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // odrážky
    s = s.replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>");
    s = s.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
    // odstavce a řádky
    s = s.replace(/\n{2,}/g, "</p><p>");
    s = `<p>${s.replace(/\n/g, "<br/>")}</p>`;

    return s;
  }, [post?.body_md]);

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <Link className="link" to="/blog">
        ← Zpět na blog
      </Link>

      {loading && <p style={{ marginTop: 12 }}>Načítám…</p>}
      {err && (
        <p className="small" style={{ color: "#fca5a5", marginTop: 8 }}>
          {err}
        </p>
      )}

      {post && (
        <article className="glass card" style={{ marginTop: 16, padding: 20 }}>
          <div className="devlog-meta" style={{ marginBottom: 8 }}>
            <span className="devlog-date">{fmtDate(post.published_at)}</span>
            <span className="devlog-category" style={{ marginLeft: 8 }}>
              {post.category[0].toUpperCase() + post.category.slice(1)}
            </span>
          </div>

          <h1 style={{ fontSize: 28, marginBottom: 16 }}>{post.title}</h1>

          <div
