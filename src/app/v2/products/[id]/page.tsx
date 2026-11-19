import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, ExternalLink, Heart, Crown } from 'lucide-react';
import { products, stats, displayStats, yen, shortName } from '@/lib/catalog';
import { loadReviews } from '@/lib/reviews';
import { shopLinks } from '@/lib/affiliates';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = products.find(x => x.id === id);
  return { title: p ? `${shortName(p.name)}｜そなえチェッカー` : '商品が見つかりません' };
}

export default async function V2ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = products.find(x => x.id === id);
  if (!p) notFound();
  const data = await loadReviews();
  const reviews = data.reviews.filter(r => r.productId === id);
  const s = stats(id, reviews);
  const ds = displayStats(p, reviews);
  const links = shopLinks(id, p.category, p.name);

  const inCategory = [...products].filter(x => x.category === p.category).sort((a, b) => displayStats(b, data.reviews).average - displayStats(a, data.reviews).average);
  const myRank = inCategory.findIndex(x => x.id === id) + 1;
  const prev = inCategory[myRank - 2];
  const next = inCategory[myRank];
  const petals = Math.round(ds.average);

  return (
    <main>
      <div className="v2-detail-breadcrumb">
        <Link href="/v2">トップ</Link> &gt; <Link href="/v2/categories">カテゴリ</Link> &gt; <Link href={`/v2/products?category=${encodeURIComponent(p.category)}`}>{p.category}</Link>
      </div>

      <div className="v2-rank-nav">
        {prev ? <Link href={`/v2/products/${prev.id}`}><ChevronLeft size={16} />{myRank - 1}位</Link> : <span />}
        <span className="v2-rank-nav-current"><Crown size={18} />{p.category}ランキング {myRank > 0 ? `${myRank}位` : ''}</span>
        {next ? <Link href={`/v2/products/${next.id}`}>{myRank + 1}位<ChevronRight size={16} /></Link> : <span />}
      </div>

      <div className="v2-detail-main">
        <div className="v2-detail-image">
          {p.image ? <img src={p.image} alt={p.name} /> : <div role="img" aria-label={`${p.name}の画像`} />}
        </div>
        <div>
          <p className="v2-detail-brand">{p.brand}<Heart size={15} /></p>
          <h1 className="v2-detail-title" title={p.name}>{shortName(p.name, 44)}</h1>
          <div className="v2-detail-links">
            <span><a href={p.rakutenUrl} target="_blank" rel="noreferrer">製品詳細<ExternalLink size={13} /></a></span>
            <span>口コミ {s.count}件</span>
            {p.rakutenReviewCount ? <span>楽天レビュー {p.rakutenReviewCount.toLocaleString('ja-JP')}件</span> : null}
          </div>

          <div className="v2-score-box">
            <span className="v2-score-brand">🌸 そなえチェッカー</span>
            <span className="v2-score-num">★{ds.average ? ds.average.toFixed(2) : '—'}<span>/5</span></span>
            <span style={{ fontSize: 13, color: 'var(--v2-muted)' }}>{ds.count.toLocaleString('ja-JP')}件の評価をもとに算出</span>
            <span className="v2-score-stamp">{ds.average >= 4.3 ? '高評価' : ds.count >= 1000 ? '定番' : '参考程度'}</span>
          </div>

          <p className="v2-price-line">{yen(p.price)}<small>楽天価格</small></p>
          <div className="v2-cta-row">
            <a className="amazon" href={links.amazon} target="_blank" rel="sponsored nofollow noopener noreferrer">Amazonで見る</a>
            <a className="rakuten" href={p.rakutenUrl || links.rakuten} target="_blank" rel="sponsored nofollow noopener noreferrer">楽天市場で見る</a>
          </div>
          <p style={{ fontSize: 12, color: 'var(--v2-muted)', marginTop: 10 }}>Amazonリンクは同じ商品名での検索結果です。最新の価格・在庫は各ショップでご確認ください。</p>
        </div>
      </div>

      <div className="v2-black-band">
        <p>評価の目安は<span className="count">★{petals}</span>/5です</p>
        <div className="v2-petal-row">
          {[1, 2, 3, 4, 5].map(n => <span key={n} className={n <= petals ? 'on' : 'off'}>🌸</span>)}
        </div>
        <p style={{ fontSize: 12, fontWeight: 400, marginTop: 10, color: '#aeb2b8' }}>※このサイト独自の口コミと、楽天市場のレビューをもとにした目安です。</p>
      </div>

      <div className="v2-reviews">
        <h2>口コミ（{s.count}件）</h2>
        {reviews.length
          ? reviews.map(r => (
            <div className="v2-review-card" key={r.id}>
              <div className="v2-review-head"><span>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span><strong>{r.nickname}</strong><span style={{ color: 'var(--v2-muted)', fontWeight: 400 }}>{r.createdAt.slice(0, 10)}</span></div>
              <p>{r.title}</p>
              <p style={{ marginTop: 6, color: 'var(--v2-muted)' }}>{r.body}</p>
            </div>
          ))
          : <p style={{ color: 'var(--v2-muted)', fontSize: 13.5 }}>まだこのサイトへの口コミがありません。<Link href={`/reviews/new?product=${id}`} style={{ color: 'var(--v2-red)', fontWeight: 700 }}>最初の口コミを書いてみる</Link></p>}
      </div>
    </main>
  );
}
