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

function cleanSlug(input: string) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const onRequestGet = async ({ env }: PagesContext) => {
  const result = await env.DB.prepare(
    `SELECT id, title, slug, status, pattern, target_keyword, search_intent,
            seo_title, seo_description, og_image, published_at, modified_at, created_at
     FROM pseo_pages
     ORDER BY COALESCE(modified_at, created_at) DESC
     LIMIT 300`
  ).all();

  return json({
    ok: true,
    pages: result.results || [],
  });
};

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const body = await request.json().catch(() => null) as any;
  if (!body) return json({ ok: false, error: "JSON body required" }, { status: 400 });

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const title = String(body.title || "").trim();
  if (!title) return json({ ok: false, error: "title is required" }, { status: 400 });

  const pattern = String(body.pattern || "").trim();
  if (!pattern) return json({ ok: false, error: "pattern is required" }, { status: 400 });

  const slug = cleanSlug(body.slug || title);
  if (!slug) return json({ ok: false, error: "valid slug is required" }, { status: 400 });

  const status = body.status === "published" ? "published" : body.status === "review" ? "review" : body.status === "archived" ? "archived" : "draft";
  const publishedAt = status === "published" ? now : null;

  try {
    await env.DB.prepare(
      `INSERT INTO pseo_pages (
        id, title, slug, status, pattern, target_keyword, search_intent,
        intro, content_markdown, seo_title, seo_description, canonical, og_image,
        related_products_json, faqs_json, ai_summary, ai_citation_text,
        published_at, modified_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      title,
      slug,
      status,
      pattern,
      body.target_keyword || null,
      body.search_intent || null,
      body.intro || null,
      body.content_markdown || body.content || null,
      body.seo_title || null,
      body.seo_description || null,
      body.canonical || null,
      body.og_image || null,
      JSON.stringify(body.related_products || []),
      JSON.stringify(body.faqs || []),
      body.ai_summary || null,
      body.ai_citation_text || null,
      publishedAt,
      now
    ).run();

    const page = await env.DB.prepare("SELECT * FROM pseo_pages WHERE id = ?").bind(id).first();

    return json({ ok: true, page }, { status: 201 });
  } catch (error: any) {
    return json({
      ok: false,
      error: error?.message || "Failed to create pSEO page",
    }, { status: 500 });
  }
};