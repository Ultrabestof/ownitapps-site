type PagesContext = {
  request: Request;
  env: { DB: any };
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
      ...(init.headers || {}),
    },
  });
}

async function tableExists(db: any, table: string) {
  const row = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .bind(table)
    .first();

  return Boolean(row?.name);
}

export const onRequestGet = async ({ env }: PagesContext) => {
  try {
    if (!env?.DB) {
      return json({
        ok: true,
        mode: "no-db",
        counts: { products: 0, posts: 0, pseo: 0 },
        products: [],
        posts: [],
        pseo: [],
      });
    }

    const [hasProducts, hasPosts, hasPseo] = await Promise.all([
      tableExists(env.DB, "products"),
      tableExists(env.DB, "posts"),
      tableExists(env.DB, "pseo_pages"),
    ]);

    if (!hasProducts || !hasPosts || !hasPseo) {
      return json({
        ok: true,
        mode: "empty-local-db",
        counts: { products: 0, posts: 0, pseo: 0 },
        products: [],
        posts: [],
        pseo: [],
      });
    }

    const products = await env.DB.prepare(
      `SELECT id, name, slug, tagline, category, price, currency, description, og_image, modified_at, created_at
       FROM products
       WHERE status = 'published'
       ORDER BY COALESCE(modified_at, created_at) DESC
       LIMIT 6`
    ).all();

    const posts = await env.DB.prepare(
      `SELECT id, title, slug, excerpt, category, seo_description, og_image, modified_at, created_at
       FROM posts
       WHERE status = 'published'
       ORDER BY COALESCE(modified_at, created_at) DESC
       LIMIT 3`
    ).all();

    const pseo = await env.DB.prepare(
      `SELECT id, title, slug, pattern, target_keyword, search_intent, intro, seo_description, og_image, modified_at, created_at
       FROM pseo_pages
       WHERE status = 'published'
       ORDER BY COALESCE(modified_at, created_at) DESC
       LIMIT 6`
    ).all();

    const counts = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'published'").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM pseo_pages WHERE status = 'published'").first(),
    ]);

    return json({
      ok: true,
      mode: "db",
      counts: {
        products: Number(counts[0]?.count || 0),
        posts: Number(counts[1]?.count || 0),
        pseo: Number(counts[2]?.count || 0),
      },
      products: products.results || [],
      posts: posts.results || [],
      pseo: pseo.results || [],
    });
  } catch (error: any) {
    return json(
      {
        ok: false,
        error: error?.message || "Failed to load public homepage data",
      },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
};