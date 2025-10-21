import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { marked } from "marked"
import DOMPurify from "dompurify"

type Post = {
  slug: string
  title: string
  category: "updates"|"technical"|"art"
  excerpt: string
  body_md: string
  thumbnail?: string
  published_at?: number
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true); setErr(null)
        const res = await fetch(`/api/posts/${slug}`, { headers: { accept: "application/json" } })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as Post
        if (!alive) return
        setPost(data)
      } catch (e: any) {
        if (!alive) return
        setErr("Článek nenalezen.")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [slug])

  const html = useMemo(() => {
    if (!post) return ""
    const raw = marked.parse(post.body_md || "")
    return DOMPurify.sanitize(raw)
  }, [post])

  const fmtDate = (unix?: number) => unix ? new Date(unix * 1000).toLocaleDateString() : "—"

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <Link className="link" to="/blog">← Zpět na blog</Link>

      {loading && <p style={{ marginTop: 12 }}>Načítám…</p>}
      {err && <p className="small" style={{ color: "#fca5a5", marginTop: 8 }}>{err}</p>}

      {post && (
        <article className="glass card" style={{ marginTop: 16, padding: 20 }}>
          <div className="devlog-meta" style={{ marginBottom: 8 }}>
            <span className="devlog-date">{fmtDate(post.published_at)}</span>
            <span className="devlog-category" style={{ marginLeft: 8 }}>
              {post.category[0].toUpperCase()+post.category.slice(1)}
            </span>
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 16 }}>{post.title}</h1>

          {/* Markdown body */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      )}
    </section>
  )
}
