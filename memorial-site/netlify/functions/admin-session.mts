import { clearAuthCookies, handleError, json, requireAdmin } from './_shared.mts';

export default async function handler(request: Request) {
  if (request.method === 'DELETE') {
    const headers = new Headers();
    for (const cookie of clearAuthCookies()) headers.append('set-cookie', cookie);
    return json({ ok: true }, 200, headers);
  }
  if (request.method !== 'GET') return json({ error: '지원하지 않는 요청입니다.' }, 405);
  try {
    return json({ user: await requireAdmin(request) });
  } catch (error) {
    return handleError(error);
  }
}

export const config = { path: '/api/admin/session' };
