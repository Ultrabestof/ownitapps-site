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

function escapeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
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
      html.push(`<h2>${escapeHtml(line.slice(2))}</h2>`);
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

function patternLabel(pattern: string) {
  const labels: Record<string, string> = {
    "use-case": "Use Case",
    problem: "Problem",
    solution: "Solution",
    alternative: "Alternative",
    comparison: "Comparison",
    "no-subscription": "No Subscription",
    "privacy-first": "Privacy First",
    "offline-tools": "Offline Tools",
    "buy-once": "Buy Once",
    "local-first": "Local First",
    best: "Best Tools"
  };

  return labels[pattern] || pattern || "pSEO";
}

function schemaJson(page: any, faqs: any[]) {
  const canonical = `https://ownitapps.com/pseo-live/${page.slug}`;
  const title = page.seo_title || page.title || "OwnitApps pSEO Page";
  const description = page.seo_description || page.intro || "OwnitApps programmatic SEO page.";

  const articleSchema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": canonical,
    "dateModified": page.modified_at || page.created_at,
    "datePublished": page.published_at || page.created_at,
    "author": {
      "@type": "Organization",
      "name": "OwnitApps"
    },
    "publisher": {
      "@type": "Organization",
      "name": "OwnitApps",
      "url": "https://ownitapps.com"
    }
  };

  if (page.og_image) {
    articleSchema.image = page.og_image;
  }

  const schemas = [articleSchema];

  if (faqs.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": String(faq.question || ""),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": String(faq.answer || "")
        }
      }))
    });
  }

  return schemas;
}

function pageHtml(page: any) {
  const title = page.seo_title || page.title || "OwnitApps pSEO Page";
  const description = page.seo_description || page.intro || "OwnitApps pSEO page.";
  const image = page.og_image || "";
  const faqs = safeJsonArray(page.faqs_json);
  const relatedProducts = safeJsonArray(page.related_products_json);
  const content = markdownToHtml(page.content_markdown || "");
  const canonical = `https://ownitapps.com/pseo-live/${page.slug}`;
  const label = patternLabel(page.pattern || "");
  const schemas = schemaJson(page, faqs);

  const problemTitle =
    page.pattern === "problem"
      ? "The problem this page helps solve"
      : "The search problem behind this page";

  const productBlock = relatedProducts.length
    ? `
      <section class="section">
        <div class="eyebrow">Related OwnitApps tools</div>
        <h2>Recommended next steps</h2>
        <div class="product-grid">
          ${relatedProducts.map((slug) => `
            <a class="product-card" href="/apps-live/${escapeHtml(slug)}">
              <strong>${escapeHtml(slug)}</strong>
              <span>Open related product page</span>
            </a>
          `).join("")}
        </div>
      </section>
    `
    : `
      <section class="section soft">
        <div class="eyebrow">Recommended next step</div>
        <h2>Explore private, local-first tools</h2>
        <p>OwnitApps focuses on downloadable tools that work without forced accounts, monthly subscriptions, or cloud lock-in.</p>
        <a class="inline-cta" href="/apps-live">Browse live OwnitApps products</a>
      </section>
    `;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="index,follow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ""}
  <script type="application/ld+json">${escapeJson(schemas.length === 1 ? schemas[0] : schemas)}</script>
  <style>
    :root{
      --bg:#F5F0E8;
      --card:#fff;
      --text:#2B2B2B;
      --muted:#6B6258;
      --soft:#F0EBE0;
      --gold:#C9A84C;
      --green:#2E8B5A;
      --border:rgba(0,0,0,.1);
    }

    *{box-sizing:border-box}

    body{
      margin:0;
      background:var(--bg);
      color:var(--text);
      font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      line-height:1.65;
    }

    .wrap{
      width:min(1120px,calc(100% - 32px));
      margin:0 auto;
      padding:42px 0 86px;
    }

    .hero{
      display:grid;
      grid-template-columns:1.1fr .9fr;
      gap:26px;
      align-items:center;
      background:var(--card);
      border:1px solid var(--border);
      border-radius:26px;
      padding:clamp(26px,5vw,56px);
      box-shadow:0 28px 80px rgba(43,43,43,.08);
    }

    .badge-row{
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-bottom:18px;
    }

    .badge{
      display:inline-flex;
      padding:6px 10px;
      border-radius:999px;
      background:rgba(201,168,76,.14);
      border:1px solid rgba(201,168,76,.22);
      color:#806515;
      font-size:12px;
      font-weight:850;
    }

    h1{
      font-size:clamp(42px,7vw,82px);
      line-height:.96;
      letter-spacing:-.07em;
      margin:0 0 18px;
    }

    .intro{
      font-size:20px;
      color:var(--muted);
      max-width:720px;
      margin-bottom:20px;
    }

    .meta{
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      color:#8b8176;
      font-size:13px;
      font-family:ui-monospace,SFMono-Regular,Consolas,monospace;
    }

    .meta span{
      background:var(--soft);
      border:1px solid var(--border);
      border-radius:999px;
      padding:5px 9px;
    }

    .hero-card{
      background:linear-gradient(180deg,#fff,rgba(240,235,224,.78));
      border:1px solid var(--border);
      border-radius:22px;
      padding:20px;
    }

    .hero-card img{
      width:100%;
      display:block;
      border-radius:18px;
      border:1px solid var(--border);
      margin-bottom:16px;
    }

    .quick{
      display:grid;
      gap:10px;
    }

    .quick div{
      display:flex;
      justify-content:space-between;
      gap:12px;
      border-bottom:1px solid rgba(0,0,0,.07);
      padding-bottom:8px;
      font-size:14px;
    }

    .quick strong{
      color:var(--muted);
    }

    .section{
      background:var(--card);
      border:1px solid var(--border);
      border-radius:24px;
      padding:clamp(24px,4vw,44px);
      margin-top:22px;
      box-shadow:0 18px 50px rgba(43,43,43,.045);
    }

    .section.soft{
      background:linear-gradient(180deg,#fff,rgba(240,235,224,.8));
    }

    .eyebrow{
      color:#806515;
      font-size:12px;
      font-weight:900;
      text-transform:uppercase;
      letter-spacing:.1em;
      margin-bottom:10px;
    }

    h2{
      font-size:clamp(28px,4vw,42px);
      line-height:1.05;
      letter-spacing:-.05em;
      margin:0 0 16px;
    }

    h3{
      font-size:24px;
      letter-spacing:-.035em;
      margin-top:28px;
    }

    p{
      font-size:18px;
      color:#3f3a34;
    }

    .two-col{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:18px;
    }

    .mini-card{
      background:rgba(201,168,76,.08);
      border:1px solid rgba(201,168,76,.18);
      border-radius:18px;
      padding:18px;
    }

    .mini-card strong{
      display:block;
      margin-bottom:7px;
      font-size:17px;
    }

    article ul{
      padding-left:20px;
    }

    article li{
      margin:8px 0;
      font-size:18px;
    }

    .product-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
      gap:14px;
    }

    .product-card{
      display:block;
      text-decoration:none;
      color:var(--text);
      background:rgba(201,168,76,.08);
      border:1px solid rgba(201,168,76,.2);
      border-radius:18px;
      padding:18px;
    }

    .product-card strong{
      display:block;
      margin-bottom:6px;
    }

    .product-card span{
      color:var(--muted);
      font-size:14px;
    }

    .faq-list{
      display:grid;
      gap:12px;
    }

    .faq{
      background:rgba(240,235,224,.7);
      border:1px solid var(--border);
      border-radius:18px;
      padding:18px;
    }

    .faq strong{
      display:block;
      margin-bottom:8px;
      font-size:17px;
    }

    .inline-cta{
      display:inline-flex;
      margin-top:10px;
      background:var(--gold);
      color:#1f1f1f;
      text-decoration:none;
      font-weight:900;
      padding:12px 16px;
      border-radius:12px;
    }

    @media(max-width:880px){
      .hero,.two-col{grid-template-columns:1fr}
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <div>
        <div class="badge-row">
          <span class="badge">${escapeHtml(label)}</span>
          <span class="badge">${escapeHtml(page.search_intent || "search intent")}</span>
          <span class="badge">OwnitApps Guide</span>
        </div>

        <h1>${escapeHtml(page.title || "Untitled pSEO Page")}</h1>
        <div class="intro">${escapeHtml(page.intro || description)}</div>

        <div class="meta">
          <span>Keyword: ${escapeHtml(page.target_keyword || "Not set")}</span>
          <span>Updated: ${escapeHtml(String(page.modified_at || page.created_at || "").slice(0, 10))}</span>
        </div>
      </div>

      <aside class="hero-card">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(page.title || "pSEO image")}">` : ""}
        <div class="quick">
          <div><strong>Pattern</strong><span>${escapeHtml(label)}</span></div>
          <div><strong>Intent</strong><span>${escapeHtml(page.search_intent || "Not set")}</span></div>
          <div><strong>Content type</strong><span>Long-tail page</span></div>
        </div>
      </aside>
    </section>

    <section class="section">
      <div class="eyebrow">Context</div>
      <h2>${escapeHtml(problemTitle)}</h2>
      <p>${escapeHtml(page.ai_summary || page.intro || description)}</p>
    </section>

    <section class="section">
      <div class="eyebrow">Why it matters</div>
      <h2>Why offline, local-first tools matter</h2>
      <div class="two-col">
        <div class="mini-card">
          <strong>No forced cloud account</strong>
          <span>Local-first tools reduce dependency on remote dashboards, logins, and subscriptions.</span>
        </div>
        <div class="mini-card">
          <strong>Better ownership</strong>
          <span>Buy-once software helps users keep access to their own workflows and records.</span>
        </div>
        <div class="mini-card">
          <strong>Privacy by default</strong>
          <span>Private browser storage can keep sensitive planning data away from unnecessary servers.</span>
        </div>
        <div class="mini-card">
          <strong>Simple long-term use</strong>
          <span>Downloadable tools can keep working without a monthly payment or platform lock-in.</span>
        </div>
      </div>
    </section>

    ${content ? `<article class="section">${content}</article>` : ""}

    ${productBlock}

    ${faqs.length ? `
      <section class="section">
        <div class="eyebrow">Questions</div>
        <h2>Frequently asked questions</h2>
        <div class="faq-list">
          ${faqs.map((faq) => `
            <div class="faq">
              <strong>${escapeHtml(faq.question || "")}</strong>
              <span>${escapeHtml(faq.answer || "")}</span>
            </div>
          `).join("")}
        </div>
      </section>
    ` : ""}

    <section class="section soft">
      <div class="eyebrow">OwnitApps principle</div>
      <h2>Your OS. Your Data. Your Rules.</h2>
      <p>OwnitApps is built around private, offline-first, buy-once tools designed for people who want practical software without forced subscriptions or cloud lock-in.</p>
      <a class="inline-cta" href="/apps-live">Browse OwnitApps tools</a>
    </section>
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
    "SELECT * FROM pseo_pages WHERE slug = ? AND status = 'published' LIMIT 1"
  ).bind(slug).first();

  if (!page) {
    return new Response("pSEO page not found", { status: 404 });
  }

  return new Response(pageHtml(page), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
};