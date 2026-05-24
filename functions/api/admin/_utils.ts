function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });
}

function getAccessEmail(request: Request) {
  return request.headers.get('cf-access-authenticated-user-email') || '';
}

function isAllowedAdmin(request: Request, env: any) {
  const allowed = env.ALLOWED_ADMIN_EMAIL;
  if (!allowed) return true; // Cloudflare Access should protect the route. Set this variable for defense-in-depth.
  return getAccessEmail(request).toLowerCase() === String(allowed).toLowerCase();
}

export function requireAdmin(request: Request, env: any) {
  if (!isAllowedAdmin(request, env)) {
    return json({ ok: false, error: 'Unauthorized admin request.' }, { status: 401 });
  }
  return null;
}

export { json, getAccessEmail };

export function safeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return await request.json<T>();
  } catch {
    throw new Error('Invalid JSON body.');
  }
}
