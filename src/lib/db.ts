import {neon} from '@neondatabase/serverless';

// `@vercel/postgres` is deprecated (Vercel Postgres is now Neon under the
// hood); this uses Neon's serverless driver directly, per Neon's own
// migration guidance. Vercel injects the connection string once a Postgres
// (Neon) store is linked to the project — the exact env var name has varied
// between DATABASE_URL and POSTGRES_URL depending on how the store was
// created, so both are accepted here.
//
// `neon()` validates its connection string eagerly, which would break
// `next build`'s page-data collection (and any code path that merely
// imports this module) before a real database is linked. Lazily create it
// on first actual query instead, via this getter, so only running a query
// without a connection string throws.
let cached: ReturnType<typeof neon> | undefined;
function client() {
  if (!cached) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    cached = neon(connectionString);
  }
  return cached;
}

// Same statements as migrations/0002_moderation_helpful_contact.sql. Applied
// once per server instance before the first query so a deploy never runs
// code against a schema that lacks its columns (nobody has to remember to
// run the migration by hand). All are IF NOT EXISTS, so re-running is free.
const SCHEMA = [
  `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'`,
  `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ip_hash text`,
  `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS usage text`,
  `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS household text`,
  `CREATE INDEX IF NOT EXISTS reviews_ip_created ON reviews (ip_hash, created_at)`,
  `CREATE TABLE IF NOT EXISTS review_helpful (review_id text NOT NULL REFERENCES reviews(id) ON DELETE CASCADE, user_id text NOT NULL, created_at text NOT NULL, PRIMARY KEY (review_id, user_id))`,
  `CREATE TABLE IF NOT EXISTS contacts (id text PRIMARY KEY, name text NOT NULL, email text NOT NULL, category text NOT NULL, body text NOT NULL, ip_hash text, created_at text NOT NULL, status text NOT NULL DEFAULT 'open')`,
];
let ready: Promise<void> | undefined;
function ensureSchema(sql: ReturnType<typeof neon>) {
  if (!ready) {
    ready = (async () => { for (const statement of SCHEMA) await sql.query(statement); })();
    ready.catch(() => { ready = undefined; });
  }
  return ready;
}

export async function getSql() {
  const sql = client();
  await ensureSchema(sql);
  return sql;
}
