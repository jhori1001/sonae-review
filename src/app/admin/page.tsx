import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/admin-auth';

export default async function AdminIndexPage() {
  redirect(await isAdmin() ? '/admin/reviews' : '/admin/login');
}
