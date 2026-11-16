import {getSql} from '@/lib/db';
import {getOrSetVisitorId} from '@/lib/visitor';
import {sameOrigin} from '@/lib/request-meta';
// Toggles the visitor's "役に立った" vote and returns the new count.
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return Response.json({error:'不正な送信元です。'},{status:403});
 const {id}=await params;const userId=await getOrSetVisitorId();
 try{
  const sql=await getSql();
  const known=(await sql`SELECT id FROM reviews WHERE id = ${id} AND status = 'published'` as unknown[]).length>0;if(!known)return Response.json({error:'口コミが見つかりません。'},{status:404});
  const removed=await sql`DELETE FROM review_helpful WHERE review_id = ${id} AND user_id = ${userId} RETURNING review_id` as unknown[];
  if(!removed.length)await sql`INSERT INTO review_helpful (review_id,user_id,created_at) VALUES (${id},${userId},${new Date().toISOString()}) ON CONFLICT DO NOTHING`;
  const count=await sql`SELECT count(*) as n FROM review_helpful WHERE review_id = ${id}` as {n:string|number}[];
  return Response.json({voted:!removed.length,count:Number(count[0]?.n)||0});
 }catch{return Response.json({error:'送信できませんでした。時間を置いてお試しください。'},{status:503})}
}
