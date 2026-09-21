import Link from 'next/link';
import {categories,products,disasters} from '@/lib/catalog';
import {ArrowRight} from 'lucide-react';
export const metadata={title:'防災グッズのカテゴリ一覧'};
export default function Page(){return <main className="page-wrap"><div className="page-heading"><p className="overline">CATEGORIES</p><h1>必要な備えから、探す。</h1><p>まずは、気になるものをひとつから。</p></div><div className="category-grid">{categories.map((c,i)=><Link href={`/categories/${i}`} key={c}><strong>{c}</strong><small>{products.filter(p=>p.category===c).length}商品</small><ArrowRight size={16}/></Link>)}</div><div className="page-heading"><h2>災害から探す</h2></div><div className="category-grid">{disasters.map(c=><Link key={c} href={`/products?disaster=${encodeURIComponent(c)}`}>{c}に備える<ArrowRight size={16}/></Link>)}</div></main>}
