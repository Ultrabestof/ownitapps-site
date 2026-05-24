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
    `SELECT id, title, slug, status, excerpt, category, seo_title, seo_description, published_at, modified_at, created_at
     FROM posts
     ORDER BY COALESCE(modified_at, created_at) DESC
     LIMIT 200`
  ).all();

  return json({ ok: true, posts: result.results || [] });
};

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const body = await request.json().catch(() => null) as any;

  if (!body || !body.title) {
    return json({ ok: false, error: 'title is required' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const slug = cleanSlug(body.slug || body.title);
  if (!slug) return json({ ok: false, error: 'valid slug is required' }, { status: 400 });

  const content = String(body.content_markdown || body.content || '').trim();
  if (!content) return json({ ok: false, error: 'content_markdown is required' }, { status: 400 });

  const now = new Date().toISOString();
  const status = body.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? (body.published_at || now) : null;

  try {
    await env.DB.prepare(
      `INSERT INTO posts (
        id, title, slug, status, excerpt, content_markdown, seo_title, seo_description,
        canonical, og_image, category, tags_json, faqs_json, ai_summary, ai_citation_text,
        published_at, modified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      String(body.title).trim(),
      slug,
      status,
      body.excerpt || null,
      content,
      body.seo_title || null,
      body.seo_description || null,
      body.canonical || null,
      body.og_image || null,
      body.category || null,
      JSON.stringify(body.tags || []),
      JSON.stringify(body.faqs || []),
      body.ai_summary || null,
      body.ai_citation_text || null,
      publishedAt,
      now
    ).run();
  } catch (error: any) {
    return json({ ok: false, error: error?.message || 'Failed to create post' }, { status: 500 });
  }

  const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
  return json({ ok: true, post }, { status: 201 });
};
