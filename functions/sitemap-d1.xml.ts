type PagesContext = {
  request: Request;
  env: { DB: any };
};

function xmlEscape(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc: string, lastmod?: string, priority = "0.7") {
  const safeLoc = xmlEscape(loc);
  const safeLastmod = lastmod ? `<lastmod>${xmlEscape(lastmod.slice(0, 10))}</lastmod>` : "";
  return `  <url>
    <loc>${safeLoc}</loc>
    ${safeLastmod}
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const onRequestGet = async ({ env }: PagesContext) => {
  const posts = await env.DB.prepare(
    `SELECT slug, modified_at, created_at
     FROM posts
     WHERE status = 'published'
     ORDER BY COALESCE(modified_at, created_at) DESC
     LIMIT 500`
  ).all();

  const products = await env.DB.prepare(
    `SELECT slug, modified_at, created_at
     FROM products
     WHERE status = 'published'
     ORDER BY COALESCE(modified_at, created_at) DESC
     LIMIT 500`
  ).all();

  const entries: string[] = [];

  entries.push(urlEntry("https://ownitapps.com/blog-live", undefined, "0.8"));
  entries.push(urlEntry("https://ownitapps.com/apps-live", undefined, "0.8"));

  for (const post of posts.results || []) {
    entries.push(
      urlEntry(
        `https://ownitapps.com/blog-live/${post.slug}`,
        post.modified_at || post.created_at,
        "0.7"
      )
    );
  }

  for (const product of products.results || []) {
    entries.push(
      urlEntry(
        `https://ownitapps.com/apps-live/${product.slug}`,
        product.modified_at || product.created_at,
        "0.8"
      )
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
};