type PagesContext = { request: Request; env: { DB: any }; params: { id: string } };

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

export const onRequestGet = async ({ env, params }: PagesContext) => {
  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').bind(params.id, params.id).first();
  if (!product) return json({ ok: false, error: 'Product not found' }, { status: 404 });
  return json({ ok: true, product });
};

export const onRequestPut = async ({ request, env, params }: PagesContext) => {
  const body = await request.json().catch(() => null) as any;
  if (!body) return json({ ok: false, error: 'JSON body required' }, { status: 400 });

  const existing = await env.DB.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').bind(params.id, params.id).first() as any;
  if (!existing) return json({ ok: false, error: 'Product not found' }, { status: 404 });

  const now = new Date().toISOString();
  const name = body.name != null ? String(body.name).trim() : existing.name;
  const slug = body.slug != null ? cleanSlug(body.slug) : existing.slug;
  const status = body.status === 'published' ? 'published' : body.status === 'draft' ? 'draft' : existing.status;
  const publishedAt = status === 'published' ? (existing.published_at || now) : existing.published_at;

  await env.DB.prepare(
    `UPDATE products SET
      name = ?, slug = ?, tagline = ?, status = ?, category = ?, price = ?, currency = ?, description = ?,
      content_markdown = ?, features_json = ?, screenshots_json = ?, buy_url = ?, demo_url = ?, update_url = ?,
      seo_title = ?, seo_description = ?, faqs_json = ?, ai_summary = ?, ai_citation_text = ?,
      published_at = ?, modified_at = ?
     WHERE id = ?`
  ).bind(
    name,
    slug,
    body.tagline ?? existing.tagline,
    status,
    body.category ?? existing.category,
    body.price != null ? String(body.price) : existing.price,
    body.currency ?? existing.currency,
    body.description ?? existing.description,
    body.content_markdown ?? body.content ?? existing.content_markdown,
    body.features ? JSON.stringify(body.features) : existing.features_json,
    body.screenshots ? JSON.stringify(body.screenshots) : existing.screenshots_json,
    body.buy_url ?? existing.buy_url,
    body.demo_url ?? existing.demo_url,
    body.update_url ?? existing.update_url,
    body.seo_title ?? existing.seo_title,
    body.seo_description ?? existing.seo_description,
    body.faqs ? JSON.stringify(body.faqs) : existing.faqs_json,
    body.ai_summary ?? existing.ai_summary,
    body.ai_citation_text ?? existing.ai_citation_text,
    publishedAt,
    now,
    existing.id
  ).run();

  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(existing.id).first();
  return json({ ok: true, product });
};

export const onRequestDelete = async ({ env, params }: PagesContext) => {
  const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ? OR slug = ?').bind(params.id, params.id).first() as any;
  if (!existing) return json({ ok: false, error: 'Product not found' }, { status: 404 });
  await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(existing.id).run();
  return json({ ok: true, deleted: existing.id });
};
