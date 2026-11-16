import Link from 'next/link';
import {notFound} from 'next/navigation';
import {loadReview,loadHelpfulVotes} from '@/lib/reviews';
import {readVisitorId} from '@/lib/visitor';
import {products,shortName} from '@/lib/catalog';
import {ReviewCard} from '@/components/review-card';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const {review:r}=await loadReview(id);return {title:r?.title||'口コミ',description:r?.body.slice(0,120)}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const {review:r,unavailable}=await loadReview(id);if(!r){if(unavailable)return <main className="page-wrap"><p className="error">口コミを読み込めませんでした。時間を置いて再読み込みしてください。</p></main>;notFound()}const p=products.find(x=>x.id===r.productId);if(!p)notFound();const voted=await loadHelpfulVotes(await readVisitorId(),[r.id]);return <main className="page-wrap prose"><div className="breadcrumb"><Link href="/">ホーム</Link> / <a href={`/products/${p.id}`}>{shortName(p.name)}</a></div><div className="page-heading"><h1>{r.title}</h1></div><ReviewCard review={r} voted={voted.includes(r.id)}/><a href={`/products/${p.id}`} className="text-link">商品の口コミ一覧へ →</a></main>}
