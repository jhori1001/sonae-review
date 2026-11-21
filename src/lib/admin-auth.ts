import {cookies} from 'next/headers';
import {createHash} from 'crypto';

const COOKIE = 'admin_session';
const TWELVE_HOURS = 60 * 60 * 12;

// Stores a hash of the shared ADMIN_PASSWORD rather than the password
// itself, so the cookie value doesn't double as a usable credential.
function sessionToken(password: string) {
  return createHash('sha256').update(`sonae-admin:${password}`).digest('hex');
}

export async function isAdmin(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const store = await cookies();
  return store.get(COOKIE)?.value === sessionToken(password);
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE, sessionToken(process.env.ADMIN_PASSWORD || ''), {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: TWELVE_HOURS, path: '/'});
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
