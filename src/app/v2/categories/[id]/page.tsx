import { notFound } from 'next/navigation';
import { categories, products, displayStats } from '@/lib/catalog';
import { loadReviews } from '@/lib/reviews';
import { V2ProductCard } from '@/components/v2/cards';

function getCategory(id: string) { return /^\d+$/.test(id) ? categories[Number(id)] : undefined; }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${getCategory(id) || 'カテゴリ'}｜そなえレビュー` };
}

export const dynamic = 'force-dynamic';

export default async function V2CategoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCategory(id);
  if (!c) notFound();
  const data = await loadReviews();
  const reviews = data.reviews;
  const filtered = [...products].filter(p => p.category === c).sort((a, b) => displayStats(b, reviews).average - displayStats(a, reviews).average);

  return (
    <main className="v2-section" style={{ paddingTop: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{c}</h1>
      <p style={{ color: 'var(--v2-muted)', fontSize: 13, marginBottom: 18 }}>{filtered.length}件の商品（評価が高い順）</p>
      <div className="v2-card-row">{filtered.map(p => <V2ProductCard product={p} reviews={reviews} key={p.id} />)}</div>
    </main>
  );
}
