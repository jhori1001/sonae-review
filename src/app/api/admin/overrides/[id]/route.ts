import {getSql} from '@/lib/db';
import {isAdmin} from '@/lib/admin-auth';
import {products} from '@/lib/catalog';

export async function PUT(request: Request, {params}: {params: Promise<{id: string}>}) {
  if (!(await isAdmin())) return Response.json({error: '認証が必要です。'}, {status: 401});
  const {id} = await params;
  if (!products.some(p => p.id === id)) return Response.json({error: '商品が見つかりません。'}, {status: 404});
  const {amazonUrl} = await request.json();
  if (amazonUrl !== null && typeof amazonUrl !== 'string') return Response.json({error: '不正な値です。'}, {status: 400});
  const url = amazonUrl?.trim() || null;
  if (url) {
    try {
      if (new URL(url).protocol !== 'https:') return Response.json({error: 'https:// のURLを入力してください。'}, {status: 400});
    } catch {
      return Response.json({error: '正しいURLを入力してください。'}, {status: 400});
    }
  }
  const sql = getSql();
  try {
    await sql`
      INSERT INTO product_overrides (product_id, amazon_url, updated_at) VALUES (${id}, ${url}, ${new Date().toISOString()})
      ON CONFLICT (product_id) DO UPDATE SET amazon_url = ${url}, updated_at = ${new Date().toISOString()}
    `;
    return Response.json({ok: true});
  } catch (error) {
    console.error('Override save failed', error);
    return Response.json({error: '保存できませんでした。'}, {status: 503});
  }
}
