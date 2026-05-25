type PagesContext = { request: Request; env: { DB: any }; params: { id: string } };

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

function cleanSlug(input: string) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const onRequestGet = async ({ env, params }: PagesContext) => {
  const page = await env.DB.prepare(
    "SELECT * FROM pseo_pages WHERE id = ? OR slug = ? LIMIT 1"
  ).bind(params.id, params.id).first();

  if (!page) return json({ ok: false, error: "pSEO page not found" }, { status: 404 });

  return json({ ok: true, page });
};

export const onRequestPut = async ({ request, env, params }: PagesContext) => {
  const body = await request.json().catch(() => null) as any;
  if (!body) return json({ ok: false, error: "JSON body required" }, { status: 400 });

  const existing = await env.DB.prepare(
    "SELECT * FROM pseo_pages WHERE id = ? OR slug = ? LIMIT 1"
  ).bind(params.id, params.id).first() as any;

  if (!existing) return json({ ok: false, error: "pSEO page not found" }, { status: 404 });

  const now = new Date().toISOString();

  const title = body.title != null ? String(body.title).trim() : existing.title;
  const slug = body.slug != null ? cleanSlug(body.slug) : existing.slug;
  const status =
    body.status === "published" ? "published" :
    body.status === "review" ? "review" :
    body.status === "archived" ? "archived" :
    body.status === "draft" ? "draft" :
    existing.status;

  const publishedAt = status === "published"
    ? (existing.published_at || now)
    : existing.published_at;

  await env.DB.prepare(
    `UPDATE pseo_pages SET
      title = ?, slug = ?, status = ?, pattern = ?, target_keyword = ?, search_intent = ?,
      intro = ?, content_markdown = ?, seo_title = ?, seo_description = ?, canonical = ?, og_image = ?,
      related_products_json = ?, faqs_json = ?, ai_summary = ?, ai_citation_text = ?,
      published_at = ?, modified_at = ?
     WHERE id = ?`
  ).bind(
    title,
    slug,
    status,
    body.pattern ?? existing.pattern,
    body.target_keyword ?? existing.target_keyword,
    body.search_intent ?? existing.search_intent,
    body.intro ?? existing.intro,
    body.content_markdown ?? body.content ?? existing.content_markdown,
    body.seo_title ?? existing.seo_title,
    body.seo_description ?? existing.seo_description,
    body.canonical ?? existing.canonical,
    body.og_image ?? existing.og_image,
    body.related_products ? JSON.stringify(body.related_products) : existing.related_products_json,
    body.faqs ? JSON.stringify(body.faqs) : existing.faqs_json,
    body.ai_summary ?? existing.ai_summary,
    body.ai_citation_text ?? existing.ai_citation_text,
    publishedAt,
    now,
    existing.id
  ).run();

  const page = await env.DB.prepare("SELECT * FROM pseo_pages WHERE id = ?").bind(existing.id).first();

  return json({ ok: true, page });
};

export const onRequestDelete = async ({ env, params }: PagesContext) => {
  const existing = await env.DB.prepare(
    "SELECT id FROM pseo_pages WHERE id = ? OR slug = ? LIMIT 1"
  ).bind(params.id, params.id).first() as any;

  if (!existing) return json({ ok: false, error: "pSEO page not found" }, { status: 404 });

  await env.DB.prepare("DELETE FROM pseo_pages WHERE id = ?").bind(existing.id).run();

  return json({ ok: true, deleted: existing.id });
};