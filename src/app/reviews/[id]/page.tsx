import {notFound} from 'next/navigation';
import {loadReviews} from '@/lib/reviews';
import {products} from '@/lib/catalog';
import {ReviewCard} from '@/components/review-card';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const data=await loadReviews();const r=data.reviews.find(x=>x.id===id);return {title:r?.title||'口コミ',description:r?.body.slice(0,120)}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const data=await loadReviews();const r=data.reviews.find(x=>x.id===id);if(!r){if(data.unavailable)return <main className="page-wrap"><p className="error">口コミを読み込めませんでした。時間を置いて再読み込みしてください。</p></main>;notFound()}const p=products.find(x=>x.id===r.productId)!;return <main className="page-wrap prose"><div className="breadcrumb"><a href="/">ホーム</a> / <a href={`/products/${p.id}`}>{p.name}</a></div><div className="page-heading"><h1>{r.title}</h1></div><ReviewCard review={r}/><a href={`/products/${p.id}`} className="text-link">商品の口コミ一覧へ →</a></main>}
