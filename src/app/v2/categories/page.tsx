import Link from 'next/link';
import { ShieldCheck, Tent, Flashlight, Backpack, BatteryCharging, Utensils, Droplet, HeartPulse, Thermometer, Radio, Armchair, HardHat, Baby, Heart, UserRound, PawPrint } from 'lucide-react';
import { categories } from '@/lib/catalog';

export const metadata = { title: 'カテゴリ一覧｜そなえレビュー' };

const categoryIcons = [Tent, Flashlight, Backpack, BatteryCharging, Utensils, BatteryCharging, Droplet, HeartPulse, Thermometer, HeartPulse, Radio, Armchair, HardHat, ShieldCheck, Baby, Heart, UserRound, PawPrint];

export default function V2Categories() {
  return (
    <main className="v2-section" style={{ paddingTop: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>カテゴリから探す</h1>
      <div className="v2-cat-grid">
        {categories.map((c, i) => {
          const Icon = categoryIcons[i] || ShieldCheck;
          return <Link href={`/v2/categories/${i}`} key={c}><Icon size={22} /><span>{c}</span></Link>;
        })}
      </div>
    </main>
  );
}
