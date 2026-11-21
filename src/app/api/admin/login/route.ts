import {setAdminSession} from '@/lib/admin-auth';

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({error: '不正な送信元です。'}, {status: 403});
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return Response.json({error: '管理画面が設定されていません（ADMIN_PASSWORD未設定）。'}, {status: 503});
  const {password} = await request.json();
  if (typeof password !== 'string' || password !== configured) return Response.json({error: 'パスワードが違います。'}, {status: 401});
  await setAdminSession();
  return Response.json({ok: true});
}
