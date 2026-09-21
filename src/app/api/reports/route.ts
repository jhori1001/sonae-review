import {getSql} from '@/lib/db';
import {getOrSetVisitorId} from '@/lib/visitor';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'不正な送信元です。'},{status:403});
 const userId=await getOrSetVisitorId();
 const sql=getSql();
 try{
  const {reviewId,reason}=await request.json();
  if(typeof reviewId!=='string'||typeof reason!=='string'||reason.trim().length<5||reason.length>500)return Response.json({error:'理由を5〜500文字で入力してください。'},{status:400});
  const known=(await sql`SELECT id FROM reviews WHERE id = ${reviewId}` as unknown[]).length>0;
  if(!known)return Response.json({error:'口コミが見つかりません。'},{status:404});
  await sql`INSERT INTO reports (id,review_id,user_id,reason,created_at,status) VALUES (${crypto.randomUUID()},${reviewId},${userId},${reason.trim()},${new Date().toISOString()},'open') ON CONFLICT (user_id,review_id) DO NOTHING`;
  return Response.json({ok:true});
 }catch{return Response.json({error:'送信できませんでした。時間を置いてお試しください。'},{status:503})}
}
