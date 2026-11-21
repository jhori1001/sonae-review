'use client';
import {useRouter} from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="logout"
      onClick={async () => {
        await fetch('/api/admin/logout', {method: 'POST'});
        router.push('/admin/login');
        router.refresh();
      }}
    >
      ログアウト
    </button>
  );
}
