// src/pages/robots.txt.ts
// Robots.txt أ¢â‚¬â€‌ allow public content, block admin & draft routes

import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

export const GET: APIRoute = () => {
  const content = `# OwnitApps robots.txt
# Official site: ${SITE.url}

User-agent: *
Content-Signal: search=yes,ai-input=yes,ai-train=yes
Allow: /
Disallow: /admin/
Disallow: /admin
Disallow: /api/
Disallow: /api
Disallow: /preview/
Disallow: /preview
Disallow: /drafts/
Disallow: /drafts

# Block common crawl spam
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

# AI crawlers أ¢â‚¬â€‌ allow (llms.txt provides guidance)
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot-Extended
Allow: /

# Sitemap location
Sitemap: ${SITE.url}/sitemap-index.xml
Sitemap: ${SITE.url}/sitemap.xml
Sitemap: ${SITE.url}/sitemap-d1.xml
`.trim();

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
