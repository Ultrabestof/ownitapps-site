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

function pageHtml(products: any[]) {
  const cards = products.length
    ? products.map((product) => `
      <article class="card">
        ${product.og_image ? `<img src="${escapeHtml(product.og_image)}" alt="${escapeHtml(product.name || "Product image")}">` : ""}
        <div class="body">
          <span class="badge">${escapeHtml(product.category || "OwnitApps Product")}</span>
          <h2><a href="/apps-live/${escapeHtml(product.slug)}">${escapeHtml(product.name || "Untitled Product")}</a></h2>
          <p>${escapeHtml(product.description || product.tagline || "Private, local-first software by OwnitApps.")}</p>
          <div class="price">${product.price ? `${escapeHtml(product.price)} ${escapeHtml(product.currency || "USD")}` : "Price not set"}</div>
        </div>
      </article>
    `).join("")
    : `<div class="empty">No published D1 products yet.</div>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="index,follow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OwnitApps Products</title>
  <meta name="description" content="Published OwnitApps products from the D1 CMS.">
  <link rel="canonical" href="https://ownitapps.com/apps-live">
  <style>
    body{margin:0;background:#F5F0E8;color:#2B2B2B;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6}
    .wrap{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:46px 0 80px}
    .hero{margin-bottom:28px}
    h1{font-size:clamp(42px,7vw,76px);line-height:1;letter-spacing:-.065em;margin:0 0 14px}
    .subtitle{color:#6B6258;font-size:18px;max-width:720px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
    .card{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:20px;overflow:hidden;box-shadow:0 24px 70px rgba(43,43,43,.07)}
    .card img{width:100%;height:220px;object-fit:cover;display:block}
    .body{padding:20px}
    .badge{display:inline-flex;padding:5px 9px;border-radius:999px;background:rgba(201,168,76,.14);color:#806515;font-size:12px;font-weight:800;margin-bottom:12px}
    h2{font-size:24px;line-height:1.15;letter-spacing:-.035em;margin:0 0 10px}
    h2 a{color:#2B2B2B;text-decoration:none}
    p{color:#3f3a34;margin:0 0 14px}
    .price{font-size:22px;font-weight:900;letter-spacing:-.035em}
    .empty{background:#fff;border:1px dashed rgba(0,0,0,.18);border-radius:18px;padding:28px;color:#6B6258}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>OwnitApps Products</h1>
      <p class="subtitle">Published products from the live D1 CMS. Draft products remain private until published.</p>
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
    `SELECT id, name, slug, tagline, status, category, price, currency, description, og_image, modified_at, created_at
     FROM products
     WHERE status = 'published'
     ORDER BY COALESCE(modified_at, created_at) DESC
     LIMIT 100`
  ).all();

  return new Response(pageHtml(result.results || []), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
};