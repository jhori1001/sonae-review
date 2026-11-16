import {cookies} from 'next/headers';
import {ADMIN_COOKIE, adminToken, passwordMatches} from '@/lib/admin';
import {sameOrigin} from '@/lib/request-meta';
export async function POST(request:Request){
 const back=new URL('/admin',request.url);
 if(!sameOrigin(request))return Response.redirect(back,303);
 const password=String((await request.formData()).get('password')||'');
 if(!passwordMatches(password)){back.searchParams.set('error','1');await new Promise(r=>setTimeout(r,800));return Response.redirect(back,303)}
 (await cookies()).set(ADMIN_COOKIE,adminToken(),{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',maxAge:60*60*12,path:'/'});
 return Response.redirect(back,303);
}
