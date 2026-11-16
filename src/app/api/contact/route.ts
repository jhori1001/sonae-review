import {getSql} from '@/lib/db';
import {ipHash, sameOrigin} from '@/lib/request-meta';
import {z} from 'zod';
import {contactCategories} from '@/lib/contact';
const schema=z.object({name:z.string().trim().min(1).max(50),email:z.string().trim().email().max(200),category:z.enum(contactCategories as [string,...string[]]),body:z.string().trim().min(10).max(3000),website:z.literal('')});
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'ページを再読み込みしてお試しください。'},{status:403});
 const ip=ipHash(request);
 try{
  const parsed=schema.safeParse(Object.fromEntries(await request.formData()));
  if(!parsed.success)return Response.json({error:'お名前・メールアドレス・内容（10文字以上）を確認してください。'},{status:400});
  const v=parsed.data;const sql=await getSql();
  const recent=await sql`SELECT count(*) as n FROM contacts WHERE ip_hash = ${ip} AND created_at > ${new Date(Date.now()-3600000).toISOString()}` as {n:string|number}[];
  if(Number(recent[0]?.n)>=3)return Response.json({error:'短時間に多数送信されています。1時間ほど置いてからお試しください。'},{status:429});
  await sql`INSERT INTO contacts (id,name,email,category,body,ip_hash,created_at,status) VALUES (${crypto.randomUUID()},${v.name},${v.email},${v.category},${v.body},${ip},${new Date().toISOString()},'open')`;
  return Response.json({ok:true},{status:201});
 }catch(error){console.error('Contact save failed',error);return Response.json({error:'送信できませんでした。時間を置いてお試しください。'},{status:503})}
}
