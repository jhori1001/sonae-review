import Link from 'next/link';
import {notFound} from 'next/navigation';
import {products,stats,displayStats,yen} from '@/lib/catalog';
import {loadReviews} from '@/lib/reviews';
import {shopLinks} from '@/lib/affiliates';
import {ProductImage,Rating,ProductCard} from '@/components/site';
import {ReviewCard} from '@/components/review-card';
import {Button} from '@/components/ui/button';
import {PenLine,ArrowUpRight} from 'lucide-react';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=products.find(x=>x.id===id);return {title:p?`${p.name}の口コミ・評価`:'商品が見つかりません',description:p?.short}}
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const p=products.find(x=>x.id===id);if(!p)notFound();
 const data=await loadReviews();const reviews=data.reviews.filter(r=>r.productId===id);const s=stats(id,reviews);const ds=displayStats(p,reviews);
 const links=shopLinks(id,p.category,p.name);
 return <main className="page-wrap">
  <div className="breadcrumb"><Link href="/">ホーム</Link> / <Link href="/products">商品を探す</Link> / {p.category}</div>
  <p className="notice">楽天市場の商品情報（名前・価格・画像・レビュー件数）を表示しています。商品説明は楽天の商品情報からの抜粋です。</p>
  <section className="detail-hero">
   <div><ProductImage product={p}/><p className="muted">楽天市場商品画像</p></div>
   <div className="detail-summary">
    <span className="eyebrow">{p.category}</span><p className="maker">{p.brand}</p><h1>{p.name}</h1><p>{p.short}</p>
    <a href="#reviews"><Rating {...ds}/><span className="muted"> 楽天でのレビュー ↓</span></a>
    <div className="shop-panel"><span className="mini-label">広告・購入先のご案内</span><p className="detail-price">{yen(p.price)}<small>楽天価格</small></p>
     <div className="shop-buttons">
      <a className="amazon" href={links.amazon} target="_blank" rel="sponsored nofollow noopener noreferrer">Amazonで見る<ArrowUpRight size={17}/></a>
      <a className="rakuten" href={p.rakutenUrl||links.rakuten} target="_blank" rel="sponsored nofollow noopener noreferrer">楽天市場で見る<ArrowUpRight size={17}/></a>
     </div>
     <p className="muted">Amazonリンクは同じ商品名での検索結果です。最新の価格・在庫は各ショップでご確認ください。</p>
    </div>
    <Button asChild variant="outline" className="full-width"><Link href={`/reviews/new?product=${id}`}><PenLine/>この商品の口コミを書く</Link></Button>
   </div>
  </section>
  <section className="detail-info"><div><h2>商品説明（楽天の商品情報より抜粋）</h2><p>{p.caption||'商品説明は取得できませんでした。詳細はショップページをご確認ください。'}</p></div></section>
  <section id="reviews" className="section">
   <div className="section-title"><div><p className="overline">REAL VOICES</p><h2>そなえレビューへの口コミ <span className="muted">{s.count}件</span></h2></div><Button asChild><Link href={`/reviews/new?product=${id}`}><PenLine/>口コミを書く</Link></Button></div>
   {p.rakutenReviewCount?<p className="notice">楽天市場では{p.rakutenReviewCount.toLocaleString('ja-JP')}件のレビュー（平均{p.rakutenReviewAverage}）がありますが、これはそなえレビュー独自の口コミとは別集計です。以下はこのサイトに投稿された口コミです。</p>:<p className="notice">購入・使用状況は投稿者の自己申告で、購入の確認を保証するものではありません。</p>}
   {data.unavailable&&<p className="error">投稿された口コミを読み込めません。</p>}
   <div className="reviews-layout">
    <aside className="rating-panel"><Rating {...s}/><p>総合評価</p>{[5,4,3,2,1].map(n=><div className="rating-bar" key={n}><span>★{n}</span><div><span style={{width:`${s.count?reviews.filter(r=>r.rating===n).length/s.count*100:0}%`}}/></div><span>{reviews.filter(r=>r.rating===n).length}</span></div>)}</aside>
    <div>{reviews.length?reviews.map(r=><ReviewCard key={r.id} review={r}/>):<p className="muted">まだこのサイトへの口コミがありません。最初の口コミを書いてみませんか。</p>}</div>
   </div>
  </section>
  <section className="section"><h2 className="related-title">こちらの備えもチェック</h2><div className="product-grid three">{products.filter(x=>x.id!==id&&x.category===p.category).slice(0,3).map(x=><ProductCard product={x} reviews={data.reviews} key={x.id}/>)}</div></section>
 </main>
}
