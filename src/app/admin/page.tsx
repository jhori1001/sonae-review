import Link from 'next/link';
import {getSql} from '@/lib/db';
import {adminConfigured, isAdmin} from '@/lib/admin';
import {products, shortName, usageLabels} from '@/lib/catalog';
import {AdminActions} from '@/components/admin-actions';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
export const metadata={title:'管理画面',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
type ReportRow={id:string;reviewid:string;reason:string;createdat:string;title:string;body:string;nickname:string;productid:string;status:string;reportcount:string|number};
type ReviewRow={id:string;productid:string;nickname:string;rating:number;title:string;body:string;createdat:string;status:string;usage:string|null;reports:string|number};
type ContactRow={id:string;name:string;email:string;category:string;body:string;createdat:string};
const productName=(id:string)=>{const p=products.find(x=>x.id===id);return p?shortName(p.name,30):id};
const date=(s:string)=>s.slice(0,16).replace('T',' ');
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {error}=await searchParams;
 if(!adminConfigured())return <main className="page-wrap narrow"><div className="page-heading"><h1>管理画面</h1></div><p className="notice">管理画面は無効です。Vercelの環境変数に <code>ADMIN_PASSWORD</code> を設定して再デプロイすると使えるようになります。</p></main>;
 if(!await isAdmin())return <main className="page-wrap narrow"><div className="page-heading"><h1>管理画面ログイン</h1></div><form method="post" action="/api/admin/login" className="review-form"><div className="form-group"><label htmlFor="password">パスワード</label><Input id="password" name="password" type="password" required autoComplete="current-password"/></div>{error&&<p className="error" role="alert">パスワードが違います。</p>}<Button type="submit">ログイン</Button></form></main>;
 const sql=await getSql();
 const [reports,reviews,contacts]=await Promise.all([
  sql`SELECT rp.id, rp.review_id as reviewId, rp.reason, rp.created_at as createdAt, r.title, r.body, r.nickname, r.product_id as productId, r.status,
       (SELECT count(*) FROM reports x WHERE x.review_id = rp.review_id AND x.status = 'open') as reportCount
      FROM reports rp JOIN reviews r ON r.id = rp.review_id WHERE rp.status = 'open' ORDER BY rp.created_at DESC LIMIT 100` as unknown as Promise<ReportRow[]>,
  sql`SELECT r.id, r.product_id as productId, r.nickname, r.rating, r.title, r.body, r.created_at as createdAt, r.status, r.usage,
       (SELECT count(*) FROM reports x WHERE x.review_id = r.id AND x.status = 'open') as reports
      FROM reviews r ORDER BY r.created_at DESC LIMIT 50` as unknown as Promise<ReviewRow[]>,
  sql`SELECT id, name, email, category, body, created_at as createdAt FROM contacts WHERE status = 'open' ORDER BY created_at DESC LIMIT 100` as unknown as Promise<ContactRow[]>,
 ]);
 return <main className="page-wrap admin">
  <div className="page-heading admin-heading"><div><h1>管理画面</h1><p>通報 {reports.length}件 ・ お問い合わせ {contacts.length}件が未対応です。</p></div><form method="post" action="/api/admin/logout"><Button variant="outline" size="sm">ログアウト</Button></form></div>
  <section className="admin-section"><h2>未対応の通報</h2>{reports.length?reports.map(r=><article className="admin-item" key={r.id}><p className="admin-meta">{date(r.createdat)} ・ この口コミへの未対応の通報 {Number(r.reportcount)}件{r.status==='hidden'&&' ・ 非公開中'}</p><p><strong>通報理由：</strong>{r.reason}</p><blockquote><strong>{r.title}</strong>（{r.nickname}さん ／ <Link href={`/products/${r.productid}`}>{productName(r.productid)}</Link>）<br/>{r.body.slice(0,300)}</blockquote><AdminActions id={r.id} actions={['dismiss-report']}/><AdminActions id={r.reviewid} actions={[r.status==='hidden'?'publish':'hide','delete']}/></article>):<p className="muted">未対応の通報はありません。</p>}</section>
  <section className="admin-section"><h2>お問い合わせ</h2>{contacts.length?contacts.map(c=><article className="admin-item" key={c.id}><p className="admin-meta">{date(c.createdat)} ・ {c.category}</p><p><strong>{c.name}</strong> &lt;<a href={`mailto:${c.email}`}>{c.email}</a>&gt;</p><p className="review-body">{c.body}</p><AdminActions id={c.id} actions={['close-contact']}/></article>):<p className="muted">未対応のお問い合わせはありません。</p>}</section>
  <section className="admin-section"><h2>最近の口コミ（50件）</h2>{reviews.length?reviews.map(r=><article className="admin-item" key={r.id}><p className="admin-meta">{date(r.createdat)} ・ ★{r.rating} ・ {r.status==='hidden'?'非公開':'公開中'}{r.usage&&` ・ ${usageLabels[r.usage]||r.usage}`}{Number(r.reports)>0&&` ・ 通報 ${r.reports}件`}</p><p><strong>{r.status==='published'?<Link href={`/reviews/${r.id}`}>{r.title}</Link>:r.title}</strong>（{r.nickname}さん ／ {productName(r.productid)}）</p><p className="review-body">{r.body.slice(0,200)}</p><AdminActions id={r.id} actions={[r.status==='hidden'?'publish':'hide','delete']}/></article>):<p className="muted">まだ口コミはありません。</p>}</section>
 </main>
}
