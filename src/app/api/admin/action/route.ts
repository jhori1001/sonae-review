import {del} from '@vercel/blob';
import {getSql} from '@/lib/db';
import {isAdmin} from '@/lib/admin';
import {sameOrigin} from '@/lib/request-meta';
// Moderation actions from /admin. Hiding keeps the review (and can be undone);
// deleting removes it, its photos in Blob storage, its votes and its reports.
export async function POST(request:Request){
 if(!sameOrigin(request)||!await isAdmin())return Response.json({error:'権限がありません。'},{status:403});
 const {action,id}=await request.json() as {action?:string;id?:string};
 if(typeof id!=='string'||!id)return Response.json({error:'IDがありません。'},{status:400});
 const sql=await getSql();
 try{
  if(action==='hide'||action==='publish'){await sql`UPDATE reviews SET status = ${action==='hide'?'hidden':'published'} WHERE id = ${id}`;if(action==='hide')await sql`UPDATE reports SET status = 'resolved' WHERE review_id = ${id} AND status = 'open'`}
  else if(action==='delete'){const images=await sql`SELECT url FROM review_images WHERE review_id = ${id}` as {url:string}[];await sql.transaction(txn=>[txn`DELETE FROM reports WHERE review_id = ${id}`,txn`DELETE FROM reviews WHERE id = ${id}`]);await Promise.all(images.map(i=>del(i.url).catch(()=>{})))}
  else if(action==='dismiss-report')await sql`UPDATE reports SET status = 'dismissed' WHERE id = ${id}`;
  else if(action==='close-contact')await sql`UPDATE contacts SET status = 'closed' WHERE id = ${id}`;
  else return Response.json({error:'不明な操作です。'},{status:400});
  return Response.json({ok:true});
 }catch(error){console.error('Admin action failed',error);return Response.json({error:'処理できませんでした。'},{status:503})}
}
