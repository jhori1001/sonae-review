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
export function getSql() {
  if (!cached) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    cached = neon(connectionString);
  }
  return cached;
}
