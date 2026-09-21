import {cookies} from 'next/headers';

const COOKIE = 'sv_id';
const ONE_YEAR = 60 * 60 * 24 * 365;

// Replaces the old ChatGPT-authenticated userId with an anonymous per-browser
// id, since login is no longer available outside the ChatGPT Sites platform.
// Used as the "who is this poster" key for the one-review-per-product
// constraint and the posting rate limit. Weaker than a real account (clearing
// cookies resets it), but keeps posting open to everyone.
export async function getOrSetVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  store.set(COOKIE, id, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: ONE_YEAR, path: '/'});
  return id;
}
