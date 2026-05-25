type PagesContext = {
  request: Request;
  env: { DB: any };
};

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function pageHtml(pages: any[]) {
  const cards = pages.length
    ? pages.map((page) => `
      <article class="card">
        ${page.og_image ? `<img src="${escapeHtml(page.og_image)}" alt="${escapeHtml(page.title || "pSEO image")}">` : ""}
        <div class="body">
          <span class="badge">${escapeHtml(page.pattern || "pSEO")}</span>
          <h2><a href="/pseo-live/${escapeHtml(page.slug)}">${escapeHtml(page.title || "Untitled pSEO Page")}</a></h2>
          <p>${escapeHtml(page.intro || page.seo_description || "OwnitApps programmatic SEO page.")}</p>
          <div class="meta">
            Keyword: ${escapeHtml(page.target_keyword || "Not set")}
            ${page.search_intent ? ` • Intent: ${escapeHtml(page.search_intent)}` : ""}
          </div>
        </div>
      </article>
    `).join("")
    : `<div class="empty">No published D1 pSEO pages yet.</div>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="index,follow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OwnitApps pSEO Pages</title>
  <meta name="description" content="Published OwnitApps programmatic SEO pages from the D1 CMS.">
  <link rel="canonical" href="https://ownitapps.com/pseo-live">
  <style>
    body{margin:0;background:#F5F0E8;color:#2B2B2B;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6}
    .wrap{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:46px 0 80px}
    .hero{margin-bottom:28px}
    h1{font-size:clamp(42px,7vw,76px);line-height:1;letter-spacing:-.065em;margin:0 0 14px}
    .subtitle{color:#6B6258;font-size:18px;max-width:760px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
    .card{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:20px;overflow:hidden;box-shadow:0 24px 70px rgba(43,43,43,.07)}
    .card img{width:100%;height:210px;object-fit:cover;display:block}
    .body{padding:20px}
    .badge{display:inline-flex;padding:5px 9px;border-radius:999px;background:rgba(201,168,76,.14);color:#806515;font-size:12px;font-weight:800;margin-bottom:12px}
    h2{font-size:24px;line-height:1.15;letter-spacing:-.035em;margin:0 0 10px}
    h2 a{color:#2B2B2B;text-decoration:none}
    p{color:#3f3a34;margin:0 0 14px}
    .meta{color:#9A8F82;font-size:12px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
    .empty{background:#fff;border:1px dashed rgba(0,0,0,.18);border-radius:18px;padding:28px;color:#6B6258}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>OwnitApps pSEO Pages</h1>
      <p class="subtitle">Published long-tail pages from the live D1 CMS. Drafts remain private in the protected preview system.</p>
    </section>
    <section class="grid">
      ${cards}
    </section>
  </main>
</body>
</html>`;
}

export const onRequestGet = async ({ env }: PagesContext) => {
  const result = await env.DB.prepare(
    `SELECT id, title, slug, status, pattern, target_keyword, search_intent, intro, seo_description, og_image, modified_at, created_at
     FROM pseo_pages
     WHERE status = 'published'
     ORDER BY COALESCE(modified_at, created_at) DESC
     LIMIT 300`
  ).all();

  return new Response(pageHtml(result.results || []), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
};