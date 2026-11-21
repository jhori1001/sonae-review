import {loadReviews} from '@/lib/reviews';
import {products, shortName} from '@/lib/catalog';
import {DeleteReviewButton} from './delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const {reviews, unavailable} = await loadReviews();
  if (unavailable) return <p className="admin-empty">口コミを読み込めませんでした。DATABASE_URLの設定を確認してください。</p>;
  if (!reviews.length) return <><h1>口コミ管理（0件）</h1><p className="admin-empty">投稿された口コミはまだありません。</p></>;

  return (
    <div>
      <h1>口コミ管理（{reviews.length}件）</h1>
      <table className="admin-table">
        <thead>
          <tr><th>商品</th><th>評価</th><th>投稿者</th><th>内容</th><th>日付</th><th></th></tr>
        </thead>
        <tbody>
          {reviews.map(r => {
            const p = products.find(x => x.id === r.productId);
            return (
              <tr key={r.id}>
                <td>{p ? shortName(p.name, 24) : r.productId}</td>
                <td>{'★'.repeat(r.rating)}</td>
                <td>{r.nickname}</td>
                <td><strong>{r.title}</strong><br /><span className="muted">{r.body.slice(0, 80)}{r.body.length > 80 ? '…' : ''}</span></td>
                <td className="muted">{r.createdAt.slice(0, 10)}</td>
                <td className="actions"><DeleteReviewButton id={r.id} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
