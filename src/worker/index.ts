import { Hono } from "hono"

type Bindings = {
  KV_STATUS: KVNamespace
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
  const body = await c.req.json<UnityStatus>().catch(() => null)
  if (!body) return c.json({ error: "Invalid JSON" }, 400)

  // doplnění základních údajů
  body.lastUpdate = Date.now()
  if (body.mode === "working" || body.mode === "break") body.online = true
  if (body.mode === "offline") body.online = false

  // výchozí hodnoty pokud plugin nepošle
  body.totalMs ??= mem.unity.totalMs || 0
  body.sessionMs ??= 0
  body.project ??= mem.unity.project || { name: "", startedAt: Date.now(), tenureMs: 0 }
  body.editor ??= mem.unity.editor || { version: "" }

  // pokud posílá working → přičti čas
  if (body.mode === "working" && mem.unity.online) {
    const elapsed = Date.now() - (mem.unity.lastUpdate || Date.now())
    body.totalMs = (mem.unity.totalMs || 0) + elapsed
    body.sessionMs = (mem.unity.sessionMs || 0) + elapsed
  } else if (body.mode === "offline") {
    body.sessionMs = 0
  }

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

app.get("/api/", (c) => c.json({ name: "Arcflare Games" }))

export default app
