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
  return html.join("\n").replace(/<\/ul>\n<ul>/g, "\n");
}

function pageHtml(post: any) {
  const title = post.seo_title || post.title || "OwnitApps";
  const description = post.seo_description || post.excerpt || "OwnitApps article.";
  const image = post.og_image || "";
  const content = markdownToHtml(post.content_markdown || "");
  const canonical = `https://ownitapps.com/blog-live/${post.slug}`;

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
  <style>
    body{margin:0;background:#F5F0E8;color:#2B2B2B;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}
    .wrap{width:min(880px,calc(100% - 32px));margin:0 auto;padding:42px 0 80px}
    .hero,.article{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:20px;padding:clamp(24px,5vw,46px);box-shadow:0 24px 70px rgba(43,43,43,.08)}
    .article{margin-top:20px}
    .badge{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(201,168,76,.14);color:#806515;font-size:12px;font-weight:800;margin-bottom:18px}
    h1{font-size:clamp(36px,6vw,64px);line-height:1.02;letter-spacing:-.055em;margin:0 0 16px}
    .meta{color:#6B6258;font-size:14px;margin-bottom:24px}
    .featured{width:100%;border-radius:16px;border:1px solid rgba(0,0,0,.1);margin:18px 0 26px;display:block}
    .article h1,.article h2,.article h3{letter-spacing:-.035em;line-height:1.15}
    .article h2{font-size:28px;margin-top:34px}
    .article h3{font-size:22px;margin-top:28px}
    .article p{color:#3f3a34;font-size:18px}
    a{color:#806515}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <span class="badge">OwnitApps Article</span>
      <h1>${escapeHtml(post.title || "Untitled Post")}</h1>
      <div class="meta">
        ${post.category ? `Category: ${escapeHtml(post.category)} • ` : ""}
        Updated: ${escapeHtml(post.modified_at || post.created_at || "")}
      </div>
      ${image ? `<img class="featured" src="${escapeHtml(image)}" alt="${escapeHtml(post.title || "Article image")}">` : ""}
    </section>
    <article class="article">
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
    "SELECT * FROM posts WHERE slug = ? AND status = 'published' LIMIT 1"
  ).bind(slug).first();

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }

  return new Response(pageHtml(post), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
};