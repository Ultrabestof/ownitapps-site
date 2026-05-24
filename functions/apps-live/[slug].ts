type PagesContext = {
  request: Request;
  env: { DB: any };
  params: { slug: string };
};

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeJsonArray(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function markdownToHtml(markdown: string) {
  const lines = String(markdown || "").split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];

  function flushParagraph() {
    if (paragraph.length) {
      html.push(`<p>${paragraph.join(" ")}</p>`);
      paragraph = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      html.push(`<ul><li>${escapeHtml(line.slice(2))}</li></ul>`);
      continue;
    }

    paragraph.push(escapeHtml(line));
  }

  flushParagraph();
  return html.join("\n").replace(/<\/ul>\n<ul>/g, "\n");
}

function pageHtml(product: any) {
  const title = product.seo_title || product.name || "OwnitApps Product";
  const description = product.seo_description || product.description || product.tagline || "OwnitApps product.";
  const image = product.og_image || "";
  const canonical = `https://ownitapps.com/apps-live/${product.slug}`;
  const features = safeJsonArray(product.features_json);
  const screenshots = safeJsonArray(product.screenshots_json);
  const content = markdownToHtml(product.content_markdown || "");
  const priceLine = product.price ? `${escapeHtml(product.price)} ${escapeHtml(product.currency || "USD")}` : "Price not set";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="index,follow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ""}
  <style>
    body{margin:0;background:#F5F0E8;color:#2B2B2B;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}
    .wrap{width:min(1080px,calc(100% - 32px));margin:0 auto;padding:42px 0 80px}
    .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:24px;align-items:center;background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:22px;padding:clamp(24px,5vw,48px);box-shadow:0 24px 70px rgba(43,43,43,.08)}
    .badge{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(201,168,76,.14);color:#806515;font-size:12px;font-weight:800;margin-bottom:18px}
    h1{font-size:clamp(38px,6vw,70px);line-height:1;letter-spacing:-.06em;margin:0 0 16px}
    .tagline{color:#6B6258;font-size:20px;margin-bottom:20px}
    .meta{color:#6B6258;font-size:14px;margin-bottom:24px}
    .price{font-weight:900;font-size:32px;letter-spacing:-.04em;margin-bottom:20px}
    .preview-img{width:100%;border-radius:18px;border:1px solid rgba(0,0,0,.1);display:block;background:#eee}
    .buttons{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
    .buttons a{text-decoration:none;font-weight:900;color:#2B2B2B;background:rgba(201,168,76,.18);border:1px solid rgba(201,168,76,.32);padding:11px 14px;border-radius:12px}
    .buttons a.primary{background:#C9A84C}
    .section{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:20px;padding:clamp(22px,4vw,40px);margin-top:22px}
    h2{font-size:30px;line-height:1.1;letter-spacing:-.04em;margin:0 0 18px}
    .features{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;padding:0;margin:0;list-style:none}
    .features li{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.2);border-radius:14px;padding:14px;font-weight:700}
    .screenshots{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
    .screenshots img{width:100%;border-radius:16px;border:1px solid rgba(0,0,0,.1)}
    article p{font-size:18px;color:#3f3a34}
    @media(max-width:860px){.hero{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <div>
        <span class="badge">OwnitApps Product</span>
        <h1>${escapeHtml(product.name || "Untitled Product")}</h1>
        ${product.tagline ? `<div class="tagline">${escapeHtml(product.tagline)}</div>` : ""}
        <div class="meta">
          ${product.category ? `Category: ${escapeHtml(product.category)} • ` : ""}
          Updated: ${escapeHtml(product.modified_at || product.created_at || "")}
        </div>
        <div class="price">${priceLine}</div>
        <div class="buttons">
          ${product.buy_url ? `<a class="primary" href="${escapeHtml(product.buy_url)}" target="_blank" rel="noopener">Buy Now</a>` : ""}
          ${product.demo_url ? `<a href="${escapeHtml(product.demo_url)}" target="_blank" rel="noopener">View Demo</a>` : ""}
          ${product.update_url ? `<a href="${escapeHtml(product.update_url)}" target="_blank" rel="noopener">Updates</a>` : ""}
        </div>
      </div>
      <div>
        ${image ? `<img class="preview-img" src="${escapeHtml(image)}" alt="${escapeHtml(product.name || "Product image")}">` : ""}
      </div>
    </section>

    <section class="section">
      <h2>Description</h2>
      <p>${escapeHtml(description)}</p>
    </section>

    ${features.length ? `
      <section class="section">
        <h2>Features</h2>
        <ul class="features">
          ${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
        </ul>
      </section>
    ` : ""}

    ${screenshots.length ? `
      <section class="section">
        <h2>Screenshots</h2>
        <div class="screenshots">
          ${screenshots.map((src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(product.name || "Product screenshot")}">`).join("")}
        </div>
      </section>
    ` : ""}

    ${content ? `<article class="section">${content}</article>` : ""}
  </main>
</body>
</html>`;
}

export const onRequestGet = async ({ env, params }: PagesContext) => {
  const slug = String(params.slug || "").trim();

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const product = await env.DB.prepare(
    "SELECT * FROM products WHERE slug = ? AND status = 'published' LIMIT 1"
  ).bind(slug).first();

  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  return new Response(pageHtml(product), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
};