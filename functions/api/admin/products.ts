type PagesContext = { request: Request; env: { DB: any } };

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

function cleanSlug(input: string) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const onRequestGet = async ({ env }: PagesContext) => {
  const result = await env.DB.prepare(
    `SELECT id, name, slug, tagline, status, category, price, currency, description, og_image, seo_title, seo_description, published_at, modified_at, created_at
     FROM products
     ORDER BY COALESCE(modified_at, created_at) DESC
     LIMIT 200`
  ).all();

  return json({ ok: true, products: result.results || [] });
};

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const body = await request.json().catch(() => null) as any;
  if (!body || !body.name) {
    return json({ ok: false, error: 'name is required' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const slug = cleanSlug(body.slug || body.name);
  if (!slug) return json({ ok: false, error: 'valid slug is required' }, { status: 400 });

  const now = new Date().toISOString();
  const status = body.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? (body.published_at || now) : null;

  try {
    await env.DB.prepare(
      `INSERT INTO products (
        id, name, slug, tagline, status, category, price, currency, description, og_image, content_markdown, features_json, screenshots_json, buy_url, demo_url, update_url,
        seo_title, seo_description, faqs_json, ai_summary, ai_citation_text,
        published_at, modified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      String(body.name).trim(),
      slug,
      body.tagline || null,
      status,
      body.category || null,
      body.price != null ? String(body.price) : null,
      body.currency || 'USD',
      body.description || null,
      body.og_image || null,
      body.content_markdown || body.content || null,
      JSON.stringify(body.features || []),
      JSON.stringify(body.screenshots || []),
      body.buy_url || null,
      body.demo_url || null,
      body.update_url || null,
      body.seo_title || null,
      body.seo_description || null,
      JSON.stringify(body.faqs || []),
      body.ai_summary || null,
      body.ai_citation_text || null,
      publishedAt,
      now
    ).run();
  } catch (error: any) {
    return json({ ok: false, error: error?.message || 'Failed to create product' }, { status: 500 });
  }

  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
  return json({ ok: true, product }, { status: 201 });
};
