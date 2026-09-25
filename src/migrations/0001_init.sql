-- Postgres schema for sonae-review (Vercel Postgres).
-- Replaces the old D1/SQLite schema in drizzle/0000_dry_roland_deschain.sql.
-- The "user_id" columns hold an anonymous per-browser visitor id (see
-- lib/visitor.ts), not an authenticated account id.

CREATE TABLE reviews (
  id text PRIMARY KEY,
  product_id text NOT NULL,
  user_id text NOT NULL,
  nickname text NOT NULL,
  rating integer NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  created_at text NOT NULL
);
CREATE UNIQUE INDEX reviews_user_product ON reviews (user_id, product_id);
CREATE INDEX reviews_product_created ON reviews (product_id, created_at);

CREATE TABLE review_images (
  id text PRIMARY KEY,
  review_id text NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer NOT NULL
);

CREATE TABLE reports (
  id text PRIMARY KEY,
  review_id text NOT NULL,
  user_id text NOT NULL,
  reason text NOT NULL,
  created_at text NOT NULL,
  status text NOT NULL DEFAULT 'open'
);
CREATE UNIQUE INDEX reports_user_review ON reports (user_id, review_id);
