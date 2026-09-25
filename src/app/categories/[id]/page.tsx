import {notFound} from 'next/navigation';
import {categories} from '@/lib/catalog';
import {CatalogView} from '@/components/catalog-view';
import {loadReviews} from '@/lib/reviews';
export const dynamic='force-dynamic';
function getCategory(id:string){return /^\d+$/.test(id)?categories[Number(id)]:undefined}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;return {title:`${getCategory(id)||'カテゴリ'}の口コミ・商品一覧`}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const c=getCategory(id);if(!c)notFound();const data=await loadReviews();return <main className="page-wrap"><div className="breadcrumb"><a href="/">ホーム</a> / <a href="/categories">カテゴリ</a> / {c}</div><div className="page-heading"><p className="overline">CATEGORY</p><h1>{c}の口コミ・商品一覧</h1><p>写真と使用感を見ながら、暮らしに合うものを探しましょう。楽天市場の商品を掲載しています。</p></div>{data.unavailable&&<p className="notice">投稿された口コミを読み込めません。</p>}<CatalogView reviews={data.reviews} initial={{category:c}}/></main>}
