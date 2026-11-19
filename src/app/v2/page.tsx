import Link from 'next/link';
import { ShieldCheck, Tent, Flashlight, Backpack, BatteryCharging, Utensils, Droplet, HeartPulse, Thermometer, Radio, Armchair, HardHat, Baby, Heart, UserRound, PawPrint, Crown } from 'lucide-react';
import { products, categories, displayStats } from '@/lib/catalog';
import { loadReviews } from '@/lib/reviews';
import { V2ProductCard, V2RankRow } from '@/components/v2/cards';

export const metadata = { title: 'そなえチェッカー（新デザイン試作）' };
export const dynamic = 'force-dynamic';

const categoryIcons = [Tent, Flashlight, Backpack, BatteryCharging, Utensils, BatteryCharging, Droplet, HeartPulse, Thermometer, HeartPulse, Radio, Armchair, HardHat, ShieldCheck, Baby, Heart, UserRound, PawPrint];

const pickupCategories = ['簡易トイレ', '防災セット', 'モバイルバッテリー', 'ライト・ランタン'];

export default async function V2Home() {
  const data = await loadReviews();
  const reviews = data.reviews;
  const wellReviewed = products.filter(p => displayStats(p, reviews).count >= 1000);
  const trusted = [...wellReviewed].sort((a, b) => displayStats(b, reviews).average - displayStats(a, reviews).average).slice(0, 8);
  const freshlyAdded = [...products].filter(p => displayStats(p, reviews).count < 50).sort((a, b) => b.added.localeCompare(a.added)).slice(0, 8);

  return (
    <main>
      <div className="v2-quote">
        <div className="v2-quote-box">
          <p><strong>口コミの件数と評価</strong>から、本当に選ばれている防災グッズを見つけます。<br />買う前の不安を、データですこし減らせたら。</p>
        </div>
      </div>

      <div className="v2-banner good">
        <ShieldCheck size={20} />口コミ1000件以上・高評価の防災グッズ
      </div>
      <div className="v2-section v2-card-row">
        {trusted.map((p, i) => <V2ProductCard product={p} rank={i + 1} reviews={reviews} key={p.id} />)}
      </div>

      <div className="v2-banner caution">
        口コミがまだ少ない、新着の防災グッズ
      </div>
      <div className="v2-section v2-card-row">
        {freshlyAdded.map((p, i) => <V2ProductCard product={p} rank={i + 1} reviews={reviews} key={p.id} />)}
      </div>
      <p className="v2-notice-strip">口コミが少ない商品は、評価がまだ安定していません。参考程度にご覧ください。</p>

      <div className="v2-banner flag" style={{ marginTop: 28 }}>
        <Crown size={20} />注目のランキングピックアップ
      </div>
      {pickupCategories.map(cat => {
        const items = [...products].filter(p => p.category === cat).sort((a, b) => displayStats(b, reviews).average - displayStats(a, reviews).average).slice(0, 3);
        return (
          <div className="v2-rank-group" key={cat}>
            <div className="v2-rank-head">
              <span>{cat}ランキング</span>
              <Link href={`/v2/products?category=${encodeURIComponent(cat)}`}>もっと見る</Link>
            </div>
            {items.map((p, i) => <V2RankRow product={p} rank={i + 1} reviews={reviews} key={p.id} />)}
          </div>
        );
      })}

      <div className="v2-banner navy" style={{ marginTop: 28 }}>カテゴリから探す</div>
      <div className="v2-section">
        <div className="v2-cat-grid">
          {categories.map((c, i) => {
            const Icon = categoryIcons[i] || ShieldCheck;
            return <Link href={`/v2/categories/${i}`} key={c}><Icon size={22} /><span>{c}</span></Link>;
          })}
        </div>
      </div>
    </main>
  );
}
