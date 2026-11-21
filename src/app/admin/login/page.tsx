'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({password})});
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'ログインできませんでした。'); setLoading(false); return; }
      router.push('/admin/reviews');
      router.refresh();
    } catch {
      setError('通信エラーが発生しました。');
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-box" onSubmit={submit}>
        <h1>そなえレビュー 管理画面</h1>
        {error && <p className="admin-login-error">{error}</p>}
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'ログイン中…' : 'ログイン'}</button>
      </form>
    </div>
  );
}
