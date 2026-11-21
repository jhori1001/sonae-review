import {getSql} from '@/lib/db';
import {isAdmin} from '@/lib/admin-auth';

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  if (!(await isAdmin())) return Response.json({error: '認証が必要です。'}, {status: 401});
  const {id} = await params;
  const {action} = await request.json();
  if (action !== 'dismiss' && action !== 'delete_review') return Response.json({error: '不正な操作です。'}, {status: 400});
  const sql = getSql();
  try {
    if (action === 'dismiss') {
      await sql`UPDATE reports SET status = 'closed' WHERE id = ${id}`;
    } else {
      const rows = await sql`SELECT review_id as reviewId FROM reports WHERE id = ${id}` as {reviewid: string}[];
      const reviewId = rows[0]?.reviewid;
      if (reviewId) {
        await sql`DELETE FROM reports WHERE review_id = ${reviewId}`;
        await sql`DELETE FROM reviews WHERE id = ${reviewId}`;
      }
    }
    return Response.json({ok: true});
  } catch (error) {
    console.error('Report update failed', error);
    return Response.json({error: '更新できませんでした。'}, {status: 503});
  }
}
