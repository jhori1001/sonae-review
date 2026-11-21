import {getSql} from '@/lib/db';
import {isAdmin} from '@/lib/admin-auth';

export async function DELETE(request: Request, {params}: {params: Promise<{id: string}>}) {
  if (!(await isAdmin())) return Response.json({error: '認証が必要です。'}, {status: 401});
  const {id} = await params;
  const sql = getSql();
  try {
    // review_images cascades via its FK; reports has no FK, so drop those too.
    await sql`DELETE FROM reports WHERE review_id = ${id}`;
    await sql`DELETE FROM reviews WHERE id = ${id}`;
    return Response.json({ok: true});
  } catch (error) {
    console.error('Review delete failed', error);
    return Response.json({error: '削除できませんでした。'}, {status: 503});
  }
}
