import { products, displayStats } from '@/lib/catalog';
import { loadReviews } from '@/lib/reviews';
import { V2ProductCard } from '@/components/v2/cards';

export const metadata = { title: '商品を探す｜そなえチェッカー' };
export const dynamic = 'force-dynamic';

export default async function V2Products({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q = '', category = '' } = await searchParams;
  const data = await loadReviews();
  const reviews = data.reviews;
  const needle = q.normalize('NFKC').toLowerCase();
  const filtered = products
    .filter(p => (!category || p.category === category) && (!needle || `${p.name} ${p.category} ${p.brand}`.normalize('NFKC').toLowerCase().includes(needle)))
    .sort((a, b) => displayStats(b, reviews).average - displayStats(a, reviews).average);

  return (
    <main className="v2-section" style={{ paddingTop: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{category || '防災グッズを探す'}</h1>
      <p style={{ color: 'var(--v2-muted)', fontSize: 13, marginBottom: 18 }}>{filtered.length}件の商品（評価が高い順）</p>
      {filtered.length
        ? <div className="v2-card-row">{filtered.map(p => <V2ProductCard product={p} reviews={reviews} key={p.id} />)}</div>
        : <p style={{ color: 'var(--v2-muted)' }}>条件に合う商品が見つかりませんでした。</p>}
    </main>
  );
}
