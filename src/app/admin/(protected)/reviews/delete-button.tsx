'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';

export function DeleteReviewButton({id}: {id: string}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm('この口コミを削除しますか？元に戻せません。')) return;
    setBusy(true);
    const res = await fetch(`/api/admin/reviews/${id}`, {method: 'DELETE'});
    if (res.ok) router.refresh();
    else { alert('削除に失敗しました。'); setBusy(false); }
  }

  return <button type="button" className="admin-btn danger" disabled={busy} onClick={onClick}>削除</button>;
}
