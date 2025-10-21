import { Hono } from "hono"

type Bindings = {
  KV_STATUS: KVNamespace
  AUTH_TOKEN: string
  DEVLOG_DB: D1Database
}

type UnityStatus = {
  online: boolean
  mode: "working" | "break" | "offline"
  activity?: string
  scene?: string
  lastUpdate: number
  totalMs?: number
  sessionMs?: number
  project?: {
    name?: string
    startedAt?: number
    tenureMs?: number
  }
  editor?: {
    version?: string
  }
}

type LatestCommit = {
  sha: string
  message: string
  author: string
  url: string
  timestamp: number
}

// In-memory fallback (lokálně bez KV)
const mem = {
  unity: <UnityStatus>{
    online: false,
    mode: "offline",
    activity: "",
    scene: "",
    lastUpdate: 0,
    totalMs: 0,
    sessionMs: 0,
    project: { name: "", startedAt: 0, tenureMs: 0 },
    editor: { version: "" }
  },
  commit: <LatestCommit | null>null,
}

const app = new Hono<{ Bindings: Bindings }>()

// test
app.get("/api/health", c => c.json({ ok: true }))

// GET Unity status
app.get("/api/unity-status", async (c) => {
  const kv = c.env.KV_STATUS
  if (kv) {
    const raw = await kv.get("unity_status", { type: "json" }) as UnityStatus | null
    if (raw) return c.json(raw)
  }
  return c.json(mem.unity)
})

// POST Unity status (Unity Editor webhook/heartbeat)
app.post("/api/unity-status", async (c) => {
  // 1️⃣ Autentizace
  const authHeader = c.req.header("authorization") || ""
  const token = authHeader.replace("Bearer ", "").trim()
  const expected = c.env.AUTH_TOKEN || "" 

  if (expected && token !== expected) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  // 2️⃣ Načti tělo požadavku
  const body = await c.req.json<UnityStatus>().catch(() => null)
  if (!body) return c.json({ error: "Invalid JSON" }, 400)

  // 3️⃣ Doplň základní data
  body.lastUpdate = Date.now()
  if (body.mode === "working" || body.mode === "break") body.online = true
  if (body.mode === "offline") body.online = false

  // výchozí hodnoty, pokud plugin neposlal
  body.totalMs ??= mem.unity.totalMs || 0
  body.sessionMs ??= 0
  body.project ??= mem.unity.project || { name: "", startedAt: Date.now(), tenureMs: 0 }
  body.editor ??= mem.unity.editor || { version: "" }

  // přičti čas pokud aktivní session
  if (body.mode === "working" && mem.unity.online) {
    const elapsed = Date.now() - (mem.unity.lastUpdate || Date.now())
    body.totalMs = (mem.unity.totalMs || 0) + elapsed
    body.sessionMs = (mem.unity.sessionMs || 0) + elapsed
  } else if (body.mode === "offline") {
    body.sessionMs = 0
  }

  // 4️⃣ Ulož do KV nebo paměti
  const kv = c.env.KV_STATUS
  if (kv) await kv.put("unity_status", JSON.stringify(body))
  else mem.unity = body

  return c.json({ ok: true })
})

// GitHub webhook (push → uloží poslední commit)
app.post("/api/github-webhook", async (c) => {
  const event = c.req.header("x-github-event") || ""
  const payload = await c.req.json<any>().catch(() => null)
  if (!payload) return c.json({ error: "Invalid JSON" }, 400)

  if (event === "push" && payload.head_commit) {
    const commit: LatestCommit = {
      sha: payload.head_commit.id,
      message: payload.head_commit.message,
      author: payload.head_commit.author?.name || "unknown",
      url: payload.head_commit.url,
      timestamp: Date.parse(payload.head_commit.timestamp) || Date.now(),
    }
    const kv = c.env.KV_STATUS
    if (kv) await kv.put("latest_commit", JSON.stringify(commit))
    else mem.commit = commit
  }

  return c.json({ ok: true })
})

// GET poslední commit
app.get("/api/latest-commit", async (c) => {
  const kv = c.env.KV_STATUS
  if (kv) {
    const raw = await kv.get("latest_commit", { type: "json" }) as LatestCommit | null
    if (raw) return c.json(raw)
  }
  return c.json(mem.commit ?? {
    sha: "0000000",
    message: "Zatím žádné commity přijaty webhookem.",
    author: "—",
    url: "#",
    timestamp: Date.now(),
  })
})

// --- BLOG API (D1) ---

type BlogPost = {
  id?: number
  slug: string
  title: string
  category: "updates" | "technical" | "art"
  excerpt: string
  body_md: string
  thumbnail?: string
  status: "draft" | "published"
  published_at?: number
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
}

// PUBLIC: list nejnovějších (published)
app.get("/api/posts", async (c) => {
  const db = c.env.DEVLOG_DB as D1Database
  const { results } = await db
    .prepare(`SELECT id, slug, title, category, excerpt, thumbnail, published_at
              FROM posts
              WHERE status='published'
              ORDER BY published_at DESC
              LIMIT 12`)
    .all()
  return c.json(results || [])
})

// PUBLIC: detail (dovolíme načíst jen published)
app.get("/api/posts/:slug", async (c) => {
  const db = c.env.DEVLOG_DB as D1Database
  const slug = c.req.param("slug")
  const row = await db
    .prepare(`SELECT id, slug, title, category, excerpt, body_md, thumbnail, published_at
              FROM posts WHERE slug=? AND status='published'`)
    .bind(slug)
    .first()
  if (!row) return c.json({ error: "Not found" }, 404)
  return c.json(row)
})

// --- ADMIN GUARD (token = AUTH_TOKEN v headers.Authorization: Bearer <token>) ---
function isAdmin(c: any) {
  const authHeader = c.req.header("authorization") || ""
  const token = authHeader.replace("Bearer ", "").trim()
  const expected = (c.env as any).AUTH_TOKEN || ""
  return !!expected && token === expected
}

// ADMIN: vytvořit (draft/published)
app.post("/api/admin/posts", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized" }, 401)
  const data = await c.req.json<Partial<BlogPost>>().catch(() => null)
  if (!data || !data.title || !data.body_md) return c.json({ error: "title and body_md required" }, 400)

  const db = c.env.DEVLOG_DB as D1Database
  const slug = slugify(data.slug || data.title!)
  const category = (data.category || "updates") as BlogPost["category"]
  const status: BlogPost["status"] = data.status === "published" ? "published" : "draft"
  const publishedAt = status === "published" ? Math.floor(Date.now() / 1000) : null

  await db.prepare(
    `INSERT INTO posts (slug, title, category, excerpt, body_md, thumbnail, status, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    slug, data.title, category, data.excerpt || "", data.body_md, data.thumbnail || null, status, publishedAt
  ).run()

  return c.json({ ok: true, slug })
})

// ADMIN: update
app.put("/api/admin/posts/:id", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized" }, 401)
  const id = Number(c.req.param("id"))

  let body: Partial<BlogPost> = {}
  try {
    body = await c.req.json<Partial<BlogPost>>()
  } catch {}

  const fields: string[] = []
  const vals: any[] = []
  const set = (col: string, val: any) => { fields.push(`${col}=?`); vals.push(val) }

  if (body.title) set("title", body.title)
  if (body.slug) set("slug", slugify(body.slug))
  if (body.category) set("category", body.category)
  if (typeof body.excerpt === "string") set("excerpt", body.excerpt)
  if (typeof body.body_md === "string") set("body_md", body.body_md)
  if (typeof body.thumbnail !== "undefined") set("thumbnail", body.thumbnail || null)
  if (body.status) {
    const st = body.status === "published" ? "published" : "draft"
    set("status", st)
    if (st === "published") set("published_at", Math.floor(Date.now() / 1000))
  }

  if (!fields.length) return c.json({ ok: true })

  vals.push(id)
  await c.env.DEVLOG_DB
    .prepare(`UPDATE posts SET ${fields.join(", ")} WHERE id=?`)
    .bind(...vals)
    .run()

  return c.json({ ok: true })
})


// ADMIN: delete
app.delete("/api/admin/posts/:id", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized" }, 401)
  const id = Number(c.req.param("id"))
  await (c.env.DEVLOG_DB as D1Database)
    .prepare(`DELETE FROM posts WHERE id=?`)
    .bind(id)
    .run()
  return c.json({ ok: true })
})


app.get("/api/", (c) => c.json({ name: "Arcflare Games" }))

export default app
export const fetch = app.fetch