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
  const title = product.seo_title || product.name || "OwnitApps Product Preview";
  const description =
    product.seo_description ||
    product.description ||
    product.tagline ||
    "OwnitApps D1 product preview.";

  const image = product.og_image || "";
  const features = safeJsonArray(product.features_json);
  const screenshots = safeJsonArray(product.screenshots_json);
  const content = markdownToHtml(product.content_markdown || "");

  const priceLine = product.price
    ? `${escapeHtml(product.price)} ${escapeHtml(product.currency || "USD")}`
    : "Price not set";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ""}
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <style>
    :root {
      --bg: #F5F0E8;
      --card: #FFFFFF;
      --text: #2B2B2B;
      --muted: #6B6258;
      --gold: #C9A84C;
      --border: rgba(0,0,0,.1);
      --green: #2E8B5A;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.65;
    }

    .wrap {
      width: min(1080px, calc(100% - 32px));
      margin: 0 auto;
      padding: 42px 0 80px;
    }

    .hero {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 24px;
      align-items: center;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: clamp(24px, 5vw, 48px);
      box-shadow: 0 24px 70px rgba(43,43,43,.08);
    }

    .badge {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(201,168,76,.14);
      color: #806515;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 18px;
    }

    h1 {
      font-size: clamp(38px, 6vw, 70px);
      line-height: 1;
      letter-spacing: -0.06em;
      margin: 0 0 16px;
    }

    .tagline {
      color: var(--muted);
      font-size: 20px;
      margin-bottom: 20px;
    }

    .meta {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 24px;
    }

    .price {
      font-weight: 900;
      font-size: 32px;
      letter-spacing: -0.04em;
      margin-bottom: 20px;
    }

    .preview-img {
      width: 100%;
      border-radius: 18px;
      border: 1px solid var(--border);
      display: block;
      background: #eee;
    }

    .buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .buttons a {
      text-decoration: none;
      font-weight: 900;
      color: #2B2B2B;
      background: rgba(201,168,76,.18);
      border: 1px solid rgba(201,168,76,.32);
      padding: 11px 14px;
      border-radius: 12px;
    }

    .buttons a.primary {
      background: var(--gold);
    }

    .section {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: clamp(22px, 4vw, 40px);
      margin-top: 22px;
    }

    h2 {
      font-size: 30px;
      line-height: 1.1;
      letter-spacing: -0.04em;
      margin: 0 0 18px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .features li {
      background: rgba(201,168,76,.1);
      border: 1px solid rgba(201,168,76,.2);
      border-radius: 14px;
      padding: 14px;
      font-weight: 700;
    }

    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }

    .screenshots img {
      width: 100%;
      border-radius: 16px;
      border: 1px solid var(--border);
    }

    article p {
      font-size: 18px;
      color: #3f3a34;
    }

    @media (max-width: 860px) {
      .hero {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <div>
        <span class="badge">D1 Product Preview • ${escapeHtml(product.status || "draft")}</span>
        <h1>${escapeHtml(product.name || "Untitled Product")}</h1>
        ${product.tagline ? `<div class="tagline">${escapeHtml(product.tagline)}</div>` : ""}
        <div class="meta">
          Slug: ${escapeHtml(product.slug || "")}
          ${product.category ? ` • Category: ${escapeHtml(product.category)}` : ""}
          ${product.modified_at ? ` • Updated: ${escapeHtml(product.modified_at)}` : ""}
        </div>
        <div class="price">${priceLine}</div>
        <div class="buttons">
          ${product.buy_url ? `<a class="primary" href="${escapeHtml(product.buy_url)}" target="_blank" rel="noopener">Buy</a>` : ""}
          ${product.demo_url ? `<a href="${escapeHtml(product.demo_url)}" target="_blank" rel="noopener">Demo</a>` : ""}
          ${product.update_url ? `<a href="${escapeHtml(product.update_url)}" target="_blank" rel="noopener">Updates</a>` : ""}
          <a href="/admin/products?edit=${encodeURIComponent(product.id)}">Edit in Admin</a>
          <a href="/admin/media">Media Library</a>
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

    ${content ? `
      <article class="section">
        ${content}
      </article>
    ` : ""}
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
    "SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1"
  ).bind(slug, slug).first();

  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  return new Response(pageHtml(product), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
};