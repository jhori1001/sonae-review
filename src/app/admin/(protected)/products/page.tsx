import {products, shortName} from '@/lib/catalog';
import {loadOverrides} from '@/lib/overrides';
import {OverrideEditor} from './override-editor';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const {overrides, unavailable} = await loadOverrides();
  const byId = new Map(overrides.map(o => [o.productId, o.amazonUrl]));
  const rows = products.map(p => ({id: p.id, name: shortName(p.name, 40), category: p.category, amazonUrl: byId.get(p.id) || null}));

  return (
    <div>
      <h1>商品リンク編集（{products.length}件）</h1>
      {unavailable && <p className="admin-empty">既存の上書き設定を読み込めませんでした。保存前の値は空欄になっています。</p>}
      <p className="admin-empty" style={{marginBottom: 12}}>ここで設定したAmazonリンクは、自動生成される検索リンクより優先して商品ページに表示されます。アソシエイトタグは含めてURLを入力してください。</p>
      <OverrideEditor rows={rows} />
    </div>
  );
}
