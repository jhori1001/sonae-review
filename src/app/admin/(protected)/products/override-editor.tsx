'use client';
import {useMemo, useState} from 'react';

type Row = {id: string; name: string; category: string; amazonUrl: string | null};

export function OverrideEditor({rows}: {rows: Row[]}) {
  const [filter, setFilter] = useState('');
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(rows.map(r => [r.id, r.amazonUrl || ''])));
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = filter.trim();
    if (!q) return rows;
    return rows.filter(r => r.name.includes(q) || r.category.includes(q));
  }, [rows, filter]);

  async function save(id: string) {
    setBusy(b => ({...b, [id]: true}));
    setSaved(s => ({...s, [id]: false}));
    const res = await fetch(`/api/admin/overrides/${id}`, {method: 'PUT', headers: {'content-type': 'application/json'}, body: JSON.stringify({amazonUrl: values[id] || null})});
    setBusy(b => ({...b, [id]: false}));
    if (res.ok) { setSaved(s => ({...s, [id]: true})); setTimeout(() => setSaved(s => ({...s, [id]: false})), 2000); }
    else alert('保存に失敗しました。URLの形式を確認してください。');
  }

  return (
    <div>
      <input className="admin-filter" placeholder="商品名・カテゴリで絞り込み" value={filter} onChange={e => setFilter(e.target.value)} />
      <table className="admin-table">
        <thead><tr><th>商品</th><th>カテゴリ</th><th>AmazonリンクURL（空欄で既定の検索リンクに戻す）</th><th></th></tr></thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id} className="admin-override-row">
              <td>{r.name}</td>
              <td className="muted">{r.category}</td>
              <td>
                <input
                  type="url"
                  placeholder="https://www.amazon.co.jp/..."
                  value={values[r.id] || ''}
                  onChange={e => setValues(v => ({...v, [r.id]: e.target.value}))}
                />
              </td>
              <td className="actions">
                <button type="button" className="admin-btn" disabled={busy[r.id]} onClick={() => save(r.id)}>保存</button>
                {saved[r.id] && <span className="saved">保存しました</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
