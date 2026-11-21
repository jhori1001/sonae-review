import {redirect} from 'next/navigation';
import Link from 'next/link';
import {isAdmin} from '@/lib/admin-auth';
import {LogoutButton} from './logout-button';

export default async function AdminProtectedLayout({children}: {children: React.ReactNode}) {
  if (!(await isAdmin())) redirect('/admin/login');
  return (
    <>
      <header className="admin-header">
        <strong>そなえレビュー 管理画面</strong>
        <nav>
          <Link href="/admin/reviews">口コミ管理</Link>
          <Link href="/admin/reports">通報対応</Link>
          <Link href="/admin/products">商品リンク編集</Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="admin-main">{children}</main>
    </>
  );
}
