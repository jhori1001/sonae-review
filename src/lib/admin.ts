import {createHash, timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';

// Single shared-password admin. Set ADMIN_PASSWORD in the Vercel project's
// environment variables; without it the admin pages stay disabled. The
// cookie holds a hash of the password, so changing the password logs every
// existing admin session out.
export const ADMIN_COOKIE = 'sv_admin';
export function adminConfigured() { return !!process.env.ADMIN_PASSWORD; }
export function adminToken(password = process.env.ADMIN_PASSWORD || '') {
  return createHash('sha256').update(`sonae-admin:${password}`).digest('hex');
}
export function passwordMatches(input: string) {
  if (!adminConfigured()) return false;
  const a = Buffer.from(adminToken(input)), b = Buffer.from(adminToken());
  return timingSafeEqual(a, b);
}
export async function isAdmin() {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!value && value.length === 64 && timingSafeEqual(Buffer.from(value), Buffer.from(adminToken()));
}
