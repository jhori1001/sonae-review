import {put, del} from '@vercel/blob';
import {getSql} from '@/lib/db';
import {getOrSetVisitorId} from '@/lib/visitor';
import {ipHash, sameOrigin} from '@/lib/request-meta';
import {stripMetadata} from '@/lib/strip-metadata';
import {products, usageLabels, households} from '@/lib/catalog';
import {z} from 'zod';
const schema=z.object({productId:z.string().refine(v=>products.some(p=>p.id===v)),nickname:z.string().trim().min(1).max(30),rating:z.coerce.number().int().min(1).max(5),title:z.string().trim().min(3).max(80),body:z.string().trim().min(20).max(3000),usage:z.enum(Object.keys(usageLabels) as [string,...string[]]),household:z.union([z.enum(households as [string,...string[]]),z.literal('')]).optional(),consent:z.literal('on'),website:z.literal('')});
// Limits keyed on the IP hash as well as the cookie id, so clearing cookies
// (or a private window) doesn't reset them.
const SAME_PRODUCT_DAYS=30,PER_IP_PER_DAY=5;
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'ページを再読み込みしてお試しください。'},{status:403});
 if(Number(request.headers.get('content-length')||0)>17*1024*1024)return Response.json({error:'写真の合計サイズが大きすぎます。'},{status:413});
 const userId=await getOrSetVisitorId();
 const ip=ipHash(request);
 const uploaded:string[]=[];
 try{
  const sql=await getSql();
  const form=await request.formData();const parsed=schema.safeParse(Object.fromEntries(form));if(!parsed.success)return Response.json({error:'入力内容を確認してください。本文は20文字以上で、使用状況も選んでください。'},{status:400});
  const v=parsed.data;if(/https?:\/\/|死ね|殺す/.test(v.title+v.body+v.nickname))return Response.json({error:'外部URLや不適切な表現を含む投稿は送信できません。'},{status:400});
  const exists=await sql`SELECT id FROM reviews WHERE product_id = ${v.productId} AND (user_id = ${userId} OR (ip_hash = ${ip} AND created_at > ${new Date(Date.now()-SAME_PRODUCT_DAYS*86400000).toISOString()}))` as unknown[];if(exists.length)return Response.json({error:'この商品には投稿済みです。同じ商品への口コミは1人1件です。'},{status:409});
  const recent=await sql`SELECT id FROM reviews WHERE user_id = ${userId} AND created_at > ${new Date(Date.now()-60000).toISOString()} LIMIT 1` as unknown[];if(recent.length)return Response.json({error:'連続投稿を防ぐため、1分ほど待ってからお試しください。'},{status:429});
  const today=await sql`SELECT count(*) as n FROM reviews WHERE ip_hash = ${ip} AND created_at > ${new Date(Date.now()-86400000).toISOString()}` as {n:string|number}[];if(Number(today[0]?.n)>=PER_IP_PER_DAY)return Response.json({error:'本日の投稿数の上限に達しました。明日以降にお試しください。'},{status:429});
  const files=form.getAll('photos').filter((x):x is File=>x instanceof File&&x.size>0);if(files.length>3)return Response.json({error:'写真は3枚までです。'},{status:400});
  const checked=[];for(const f of files){if(f.size>5*1024*1024)return Response.json({error:'写真は1枚5MB以内にしてください。'},{status:400});const bytes=new Uint8Array(await f.arrayBuffer());const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';if(!(jpeg||png||webp))return Response.json({error:'JPEG・PNG・WebPの画像を選んでください。'},{status:400});const type=jpeg?'image/jpeg':png?'image/png':'image/webp';let clean:Uint8Array;try{clean=stripMetadata(bytes,type)}catch{return Response.json({error:'画像を読み取れませんでした。別の写真をお試しください。'},{status:400})}checked.push({bytes:clean,type,ext:jpeg?'jpg':png?'png':'webp'})}
  const id=crypto.randomUUID();const now=new Date().toISOString();
  const images:{id:string;url:string}[]=[];
  for(const f of checked){const blob=await put(`reviews/${id}/${crypto.randomUUID()}.${f.ext}`,Buffer.from(f.bytes),{access:'public',contentType:f.type});uploaded.push(blob.url);images.push({id:crypto.randomUUID(),url:blob.url})}
  await sql.transaction(txn=>[
   txn`INSERT INTO reviews (id,product_id,user_id,nickname,rating,title,body,created_at,status,ip_hash,usage,household) VALUES (${id},${v.productId},${userId},${v.nickname},${v.rating},${v.title},${v.body},${now},'published',${ip},${v.usage},${v.household||null})`,
   ...images.map((img,i)=>txn`INSERT INTO review_images (id,review_id,url,position) VALUES (${img.id},${id},${img.url},${i})`),
  ]);
  return Response.json({id},{status:201});
 }catch(error){await Promise.all(uploaded.map(u=>del(u).catch(()=>{})));console.error('Review save failed',error);return Response.json({error:'保存できませんでした。入力内容は保持しています。しばらくしてからお試しください。'},{status:503})}
}
