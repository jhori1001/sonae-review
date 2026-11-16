-- Moderation, spam protection, review metadata, "helpful" votes and the
-- contact form. Every statement is idempotent; lib/db.ts runs this same
-- list automatically on the first query of each server instance, so this
-- file is the reference copy (it can also be run by hand in the Neon console).

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ip_hash text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS usage text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS household text;
CREATE INDEX IF NOT EXISTS reviews_ip_created ON reviews (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS review_helpful (
  review_id text NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at text NOT NULL,
  PRIMARY KEY (review_id, user_id)
);

CREATE TABLE IF NOT EXISTS contacts (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  category text NOT NULL,
  body text NOT NULL,
  ip_hash text,
  created_at text NOT NULL,
  status text NOT NULL DEFAULT 'open'
);
