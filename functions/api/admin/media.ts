type PagesContext = { request: Request; env: { DB: any } };

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

export const onRequestGet = async ({ env }: PagesContext) => {
  try {
    const result = await env.DB.prepare(
      `SELECT id, filename, url, alt, mime_type, size, r2_key, created_at
       FROM media
       ORDER BY created_at DESC
       LIMIT 200`
    ).all();

    return json({
      ok: true,
      media: result.results || [],
    });
  } catch (error: any) {
    return json(
      {
        ok: false,
        error: error?.message || "Failed to load media",
      },
      { status: 500 }
    );
  }
};
