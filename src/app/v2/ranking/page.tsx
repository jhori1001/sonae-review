import { products, displayStats } from '@/lib/catalog';
import { loadReviews } from '@/lib/reviews';
import { V2ProductCard } from '@/components/v2/cards';

export const metadata = { title: 'ランキング｜そなえレビュー' };
export const dynamic = 'force-dynamic';

export default async function V2Ranking() {
  const data = await loadReviews();
  const reviews = data.reviews;
  const sorted = [...products]
    .filter(p => displayStats(p, reviews).count >= 1000)
    .sort((a, b) => displayStats(b, reviews).average - displayStats(a, reviews).average);

  const perCategory = new Map<string, number>();
  const ranked: typeof sorted = [];
  for (const p of sorted) {
    const n = perCategory.get(p.category) || 0;
    if (n >= 2) continue;
    perCategory.set(p.category, n + 1);
    ranked.push(p);
    if (ranked.length >= 30) break;
  }

  return (
    <main className="v2-section" style={{ paddingTop: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>使った人の評価ランキング</h1>
      <p style={{ color: 'var(--v2-muted)', fontSize: 13, marginBottom: 18 }}>口コミ1000件以上の商品を、評価が高い順に。同じカテゴリは2件まで。</p>
      <div className="v2-card-row">{ranked.map((p, i) => <V2ProductCard product={p} rank={i + 1} reviews={reviews} key={p.id} />)}</div>
    </main>
  );
}
