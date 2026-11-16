import {createHash} from 'node:crypto';

// A salted hash of the caller's IP, used next to the cookie visitor id so
// that clearing cookies alone doesn't reset the posting limits. The raw IP
// is never stored. Set IP_HASH_SALT in production so the hashes can't be
// reversed by brute-forcing the IPv4 space against a known salt.
export function ipHash(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(`${process.env.IP_HASH_SALT || 'sonae-review'}:${ip}`).digest('hex').slice(0, 32);
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return !!origin && origin === new URL(request.url).origin;
}
