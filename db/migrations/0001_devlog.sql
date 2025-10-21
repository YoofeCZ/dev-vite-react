CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT    NOT NULL UNIQUE,
  title        TEXT    NOT NULL,
  category     TEXT    NOT NULL CHECK (category IN ('updates','technical','art')),
  excerpt      TEXT,
  body_md      TEXT    NOT NULL,
  thumbnail    TEXT,
  status       TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_posts_published ON posts (status, published_at DESC);

CREATE TRIGGER IF NOT EXISTS trg_posts_update_ts
AFTER UPDATE ON posts
FOR EACH ROW
BEGIN
  UPDATE posts SET updated_at = unixepoch() WHERE id = NEW.id;
END;
