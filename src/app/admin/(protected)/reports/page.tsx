import {loadReports} from '@/lib/reports';
import {loadReviews} from '@/lib/reviews';
import {products, shortName} from '@/lib/catalog';
import {ReportActions} from './report-actions';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const [{reports, unavailable: reportsUnavailable}, {reviews, unavailable: reviewsUnavailable}] = await Promise.all([loadReports(), loadReviews()]);
  if (reportsUnavailable || reviewsUnavailable) return <p className="admin-empty">通報を読み込めませんでした。DATABASE_URLの設定を確認してください。</p>;
  if (!reports.length) return <><h1>通報対応（0件）</h1><p className="admin-empty">通報はまだありません。</p></>;

  return (
    <div>
      <h1>通報対応（{reports.length}件）</h1>
      <table className="admin-table">
        <thead>
          <tr><th>対象の口コミ</th><th>通報理由</th><th>日付</th><th>状態</th><th></th></tr>
        </thead>
        <tbody>
          {reports.map(r => {
            const review = reviews.find(x => x.id === r.reviewId);
            const p = review ? products.find(x => x.id === review.productId) : undefined;
            return (
              <tr key={r.id}>
                <td>
                  {review ? <>
                    <strong>{p ? shortName(p.name, 20) : review.productId}</strong><br />
                    <span className="muted">{review.nickname}「{review.title}」</span>
                  </> : <span className="muted">（口コミは削除済み）</span>}
                </td>
                <td>{r.reason}</td>
                <td className="muted">{r.createdAt.slice(0, 10)}</td>
                <td>{r.status === 'open' ? '未対応' : '対応済み'}</td>
                <td className="actions">{r.status === 'open' && <ReportActions id={r.id} hasReview={!!review} />}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
