type PagesContext = {
  request: Request;
  env: {
    DB: any;
    MEDIA: any;
  };
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

export const onRequestGet = async ({ request, env }: PagesContext) => {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');
  const userId = request.headers.get('Cf-Access-Authenticated-User-Id');

  let d1Ok = false;
  try {
    const result = await env.DB.prepare('SELECT 1 AS ok').first();
    d1Ok = result?.ok === 1;
  } catch {
    d1Ok = false;
  }

  return json({
    ok: true,
    authenticated: Boolean(email),
    email,
    userId,
    bindings: {
      d1: d1Ok,
      r2: Boolean(env.MEDIA),
    },
    message: email
      ? 'Cloudflare Access identity detected. Admin API is connected.'
      : 'Admin API is live. Protect /admin/* and /api/admin/* with Cloudflare Access to expose identity headers.',
  });
};
