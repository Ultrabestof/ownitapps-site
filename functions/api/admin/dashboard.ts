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

async function count(env: any, sql: string) {
  const row = await env.DB.prepare(sql).first();
  return Number(row?.count || 0);
}

export const onRequestGet = async ({ env }: PagesContext) => {
  try {
    const [
      totalPosts,
      draftPosts,
      publishedPosts,
      totalProducts,
      draftProducts,
      publishedProducts,
      totalMedia,
      totalPseo,
      draftPseo,
      publishedPseo
    ] = await Promise.all([
      count(env, "SELECT COUNT(*) as count FROM posts"),
      count(env, "SELECT COUNT(*) as count FROM posts WHERE status = 'draft'"),
      count(env, "SELECT COUNT(*) as count FROM posts WHERE status = 'published'"),
      count(env, "SELECT COUNT(*) as count FROM products"),
      count(env, "SELECT COUNT(*) as count FROM products WHERE status = 'draft'"),
      count(env, "SELECT COUNT(*) as count FROM products WHERE status = 'published'"),
      count(env, "SELECT COUNT(*) as count FROM media"),
      count(env, "SELECT COUNT(*) as count FROM pseo_pages"),
      count(env, "SELECT COUNT(*) as count FROM pseo_pages WHERE status = 'draft'"),
      count(env, "SELECT COUNT(*) as count FROM pseo_pages WHERE status = 'published'")
    ]);

    const recentPosts = await env.DB.prepare(
      `SELECT id, title, slug, status, modified_at, created_at
       FROM posts
       ORDER BY COALESCE(modified_at, created_at) DESC
       LIMIT 5`
    ).all();

    const recentProducts = await env.DB.prepare(
      `SELECT id, name, slug, status, price, currency, modified_at, created_at
       FROM products
       ORDER BY COALESCE(modified_at, created_at) DESC
       LIMIT 5`
    ).all();

    const recentMedia = await env.DB.prepare(
      `SELECT id, filename, mime_type, size, r2_key, created_at
       FROM media
       ORDER BY created_at DESC
       LIMIT 5`
    ).all();

    const recentPseo = await env.DB.prepare(
      `SELECT id, title, slug, status, pattern, target_keyword, modified_at, created_at
       FROM pseo_pages
       ORDER BY COALESCE(modified_at, created_at) DESC
       LIMIT 5`
    ).all();

    return json({
      ok: true,
      counts: {
        posts: {
          total: totalPosts,
          draft: draftPosts,
          published: publishedPosts
        },
        products: {
          total: totalProducts,
          draft: draftProducts,
          published: publishedProducts
        },
        media: {
          total: totalMedia
        },
        pseo: {
          total: totalPseo,
          draft: draftPseo,
          published: publishedPseo
        }
      },
      recent: {
        posts: recentPosts.results || [],
        products: recentProducts.results || [],
        media: recentMedia.results || [],
        pseo: recentPseo.results || []
      }
    });
  } catch (error: any) {
    return json(
      {
        ok: false,
        error: error?.message || "Failed to load dashboard stats"
      },
      { status: 500 }
    );
  }
};