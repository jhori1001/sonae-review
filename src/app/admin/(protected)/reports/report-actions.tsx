'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';

export function ReportActions({id, hasReview}: {id: string; hasReview: boolean}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: 'dismiss' | 'delete_review') {
    if (action === 'delete_review' && !confirm('対象の口コミを削除しますか？元に戻せません。')) return;
    setBusy(true);
    const res = await fetch(`/api/admin/reports/${id}`, {method: 'PATCH', headers: {'content-type': 'application/json'}, body: JSON.stringify({action})});
    if (res.ok) router.refresh();
    else { alert('更新に失敗しました。'); setBusy(false); }
  }

  return (
    <div className="actions">
      <button type="button" className="admin-btn" disabled={busy} onClick={() => act('dismiss')}>対応済みにする</button>
      {hasReview && <button type="button" className="admin-btn danger" disabled={busy} onClick={() => act('delete_review')}>口コミを削除</button>}
    </div>
  );
}
