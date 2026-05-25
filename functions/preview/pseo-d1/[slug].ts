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

function pageHtml(page: any) {
  const title = page.seo_title || page.title || "OwnitApps pSEO Preview";
  const description = page.seo_description || page.intro || "OwnitApps pSEO preview.";
  const image = page.og_image || "";
  const faqs = safeJsonArray(page.faqs_json);
  const relatedProducts = safeJsonArray(page.related_products_json);
  const content = markdownToHtml(page.content_markdown || "");
  const intro = page.intro || description;

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
    body{margin:0;background:#F5F0E8;color:#2B2B2B;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}
    .wrap{width:min(980px,calc(100% - 32px));margin:0 auto;padding:42px 0 80px}
    .hero,.section{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:22px;padding:clamp(24px,5vw,48px);box-shadow:0 24px 70px rgba(43,43,43,.08)}
    .section{margin-top:22px}
    .badge{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(201,168,76,.14);color:#806515;font-size:12px;font-weight:800;margin:0 8px 18px 0}
    h1{font-size:clamp(38px,6vw,70px);line-height:1;letter-spacing:-.06em;margin:0 0 16px}
    h2{font-size:30px;line-height:1.1;letter-spacing:-.04em;margin:0 0 18px}
    h3{font-size:22px;letter-spacing:-.03em}
    .intro{font-size:20px;color:#6B6258;margin-bottom:18px}
    .meta{color:#6B6258;font-size:14px;margin-bottom:20px}
    .featured{width:100%;border-radius:18px;border:1px solid rgba(0,0,0,.1);margin-top:18px}
    .buttons{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
    .buttons a{text-decoration:none;font-weight:900;color:#2B2B2B;background:rgba(201,168,76,.18);border:1px solid rgba(201,168,76,.32);padding:11px 14px;border-radius:12px}
    article p{font-size:18px;color:#3f3a34}
    .list{display:grid;gap:12px}
    .item{background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.18);border-radius:14px;padding:14px}
    .faq strong{display:block;margin-bottom:6px}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <span class="badge">D1 pSEO Preview</span>
      <span class="badge">${escapeHtml(page.status || "draft")}</span>
      <span class="badge">${escapeHtml(page.pattern || "pattern")}</span>
      <h1>${escapeHtml(page.title || "Untitled pSEO Page")}</h1>
      <div class="intro">${escapeHtml(intro)}</div>
      <div class="meta">
        Keyword: ${escapeHtml(page.target_keyword || "Not set")}
        ${page.search_intent ? ` • Intent: ${escapeHtml(page.search_intent)}` : ""}
        ${page.modified_at ? ` • Updated: ${escapeHtml(page.modified_at)}` : ""}
      </div>
      ${image ? `<img class="featured" src="${escapeHtml(image)}" alt="${escapeHtml(page.title || "pSEO image")}">` : ""}
      <div class="buttons">
        <a href="/admin/pseo?edit=${encodeURIComponent(page.id)}">Edit in Admin</a>
        <a href="/admin/media">Media Library</a>
      </div>
    </section>

    ${content ? `<article class="section">${content}</article>` : ""}

    ${relatedProducts.length ? `
      <section class="section">
        <h2>Related Products</h2>
        <div class="list">
          ${relatedProducts.map((slug) => `<div class="item">${escapeHtml(slug)}</div>`).join("")}
        </div>
      </section>
    ` : ""}

    ${faqs.length ? `
      <section class="section">
        <h2>FAQs</h2>
        <div class="list">
          ${faqs.map((faq) => `
            <div class="item faq">
              <strong>${escapeHtml(faq.question || "")}</strong>
              <span>${escapeHtml(faq.answer || "")}</span>
            </div>
          `).join("")}
        </div>
      </section>
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

  const page = await env.DB.prepare(
    "SELECT * FROM pseo_pages WHERE slug = ? OR id = ? LIMIT 1"
  ).bind(slug, slug).first();

  if (!page) {
    return new Response("pSEO page not found", { status: 404 });
  }

  return new Response(pageHtml(page), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
};