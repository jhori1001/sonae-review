import Link from 'next/link';
import { displayStats, yen, shortName, type Product, type Review } from '@/lib/catalog';

function rankClass(rank?: number) {
  if (rank === 1) return 'r1';
  if (rank === 2) return 'r2';
  if (rank === 3) return 'r3';
  return 'r-other';
}

export function V2ProductCard({ product, rank, reviews = [] }: { product: Product; rank?: number; reviews?: Review[] }) {
  const s = displayStats(product, reviews);
  const wellReviewed = s.count >= 1000;
  return (
    <Link href={`/v2/products/${product.id}`} className="v2-card">
      {rank && <span className={`v2-card-rank ${rankClass(rank)}`}>{rank}</span>}
      <div className="v2-card-image">
        {product.image
          ? <img src={product.image} alt={product.name} />
          : <div role="img" aria-label={`${product.name}の画像`} />}
      </div>
      <h3 title={product.name}>{shortName(product.name)}</h3>
      <span className="v2-card-cta">詳細を見る</span>
      <div className="v2-card-meta">
        <span className="star">★</span>
        <strong>{s.average ? s.average.toFixed(2) : '—'}</strong>
        <span className="count">（{s.count.toLocaleString('ja-JP')}件）</span>
        {s.average >= 4.3 && <span className="v2-stamp good">高評価</span>}
        {wellReviewed && s.average < 4.3 && <span className="v2-stamp neutral">定番</span>}
      </div>
      <p className="v2-card-price">{yen(product.price)}<small>楽天価格</small></p>
    </Link>
  );
}

export function V2RankRow({ product, rank, reviews = [] }: { product: Product; rank: number; reviews?: Review[] }) {
  return (
    <Link href={`/v2/products/${product.id}`} className="v2-rank-row">
      <span className={`v2-rank-badge ${rankClass(rank)}`}>{rank}</span>
      {product.image
        ? <img src={product.image} alt={product.name} />
        : <div role="img" aria-label={`${product.name}の画像`} style={{ width: 52, height: 52, background: '#f6f4f3', borderRadius: 8, flexShrink: 0 }} />}
      <span className="v2-rank-info">
        <span className="v2-rank-brand">{product.brand}</span>
        <span className="v2-rank-name" title={product.name}>{shortName(product.name, 36)}</span>
      </span>
      <span className="v2-rank-price">{yen(product.price)}</span>
    </Link>
  );
}
