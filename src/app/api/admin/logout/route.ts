import {cookies} from 'next/headers';
import {ADMIN_COOKIE} from '@/lib/admin';
export async function POST(request:Request){(await cookies()).delete(ADMIN_COOKIE);return Response.redirect(new URL('/',request.url),303)}
