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

  return html.join("\n")
    .replace(/<\/ul>\n<ul>/g, "\n");
}

function pageHtml(post: any) {
  const title = post.seo_title || post.title || "OwnitApps Preview";
  const description = post.seo_description || post.excerpt || "OwnitApps D1 post preview.";
  const image = post.og_image || "";
  const content = markdownToHtml(post.content_markdown || "");

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
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.65;
    }

    .wrap {
      width: min(880px, calc(100% - 32px));
      margin: 0 auto;
      padding: 42px 0 80px;
    }

    .badge {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(201,168,76,.14);
      color: #806515;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 18px;
    }

    .hero {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: clamp(24px, 5vw, 46px);
      box-shadow: 0 24px 70px rgba(43,43,43,.08);
    }

    h1 {
      font-size: clamp(36px, 6vw, 64px);
      line-height: 1.02;
      letter-spacing: -0.055em;
      margin: 0 0 16px;
    }

    .meta {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 24px;
    }

    .featured {
      width: 100%;
      border-radius: 16px;
      border: 1px solid var(--border);
      margin: 18px 0 26px;
      display: block;
    }

    article {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: clamp(22px, 4vw, 42px);
      margin-top: 20px;
    }

    article h1,
    article h2,
    article h3 {
      letter-spacing: -0.035em;
      line-height: 1.15;
    }

    article h1 {
      font-size: 38px;
    }

    article h2 {
      font-size: 28px;
      margin-top: 34px;
    }

    article h3 {
      font-size: 22px;
      margin-top: 28px;
    }

    article p {
      color: #3f3a34;
      font-size: 18px;
    }

    a {
      color: #806515;
    }

    .toplinks {
      margin-top: 18px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .toplinks a {
      text-decoration: none;
      font-weight: 800;
      color: #2B2B2B;
      background: rgba(201,168,76,.16);
      border: 1px solid rgba(201,168,76,.28);
      padding: 10px 12px;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <span class="badge">D1 Preview • ${escapeHtml(post.status || "draft")}</span>
      <h1>${escapeHtml(post.title || "Untitled Post")}</h1>
      <div class="meta">
        Slug: ${escapeHtml(post.slug || "")}
        ${post.category ? ` • Category: ${escapeHtml(post.category)}` : ""}
        ${post.modified_at ? ` • Updated: ${escapeHtml(post.modified_at)}` : ""}
      </div>
      ${image ? `<img class="featured" src="${escapeHtml(image)}" alt="${escapeHtml(post.title || "Post image")}">` : ""}
      <div class="toplinks">
        <a href="/admin/posts?edit=${encodeURIComponent(post.id)}">Edit in Admin</a>
        <a href="/admin/media">Media Library</a>
      </div>
    </section>

    <article>
      ${content || "<p>No content yet.</p>"}
    </article>
  </main>
</body>
</html>`;
}

export const onRequestGet = async ({ env, params }: PagesContext) => {
  const slug = String(params.slug || "").trim();

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const post = await env.DB.prepare(
    "SELECT * FROM posts WHERE slug = ? OR id = ? LIMIT 1"
  ).bind(slug, slug).first();

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }

  return new Response(pageHtml(post), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
};