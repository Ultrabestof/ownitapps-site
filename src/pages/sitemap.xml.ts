// src/pages/sitemap.xml.ts
// Dynamic XML sitemap — pulls all slugs from content collections at build time

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../data/site';

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function entry(e: SitemapURL): string {
  return `  <url>
    <loc>${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}${e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ''}${e.priority != null ? `\n    <priority>${e.priority.toFixed(1)}</priority>` : ''}
  </url>`;
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0]!;
  const base = SITE.url;

  const [blogs, products, pseoPages, glossaryTerms] = await Promise.all([
    getCollection('blog'),
    getCollection('products'),
    getCollection('pseo'),
    getCollection('glossary'),
  ]);

  const patternPrefix: Record<string, string> = {
    alternative: '/alternatives',
    comparison: '/compare',
    compare: '/compare',
    'no-subscription': '/no-subscription',
    'privacy-first': '/privacy-first',
    'offline-tools': '/offline-tools',
    problem: '/problems',
    solution: '/solutions',
    'use-case': '/use-cases',
    'buy-once': '/buy-once',
    'local-first': '/local-first',
    best: '/best',
  };

  const urls: SitemapURL[] = [
    // Core
    { loc: `${base}/`,                      lastmod: today, changefreq: 'weekly',  priority: 1.0 },
    { loc: `${base}/apps`,                  lastmod: today, changefreq: 'weekly',  priority: 0.9 },
    { loc: `${base}/blog`,                  lastmod: today, changefreq: 'daily',   priority: 0.8 },
    { loc: `${base}/glossary`,              lastmod: today, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/contact`,               lastmod: today, changefreq: 'yearly',  priority: 0.5 },
    { loc: `${base}/about`,                 lastmod: today, changefreq: 'monthly', priority: 0.6 },
    { loc: `${base}/resources`,             lastmod: today, changefreq: 'weekly',  priority: 0.7 },
    { loc: `${base}/start-here`,            lastmod: today, changefreq: 'monthly', priority: 0.7 },
    { loc: `${base}/update`,                lastmod: today, changefreq: 'weekly',  priority: 0.7 },
    // Authority hubs
    { loc: `${base}/what-is-ownitapps`,     lastmod: today, changefreq: 'monthly', priority: 0.9 },
    { loc: `${base}/offline-first-apps`,    lastmod: today, changefreq: 'monthly', priority: 0.9 },
    { loc: `${base}/no-subscription-apps`,  lastmod: today, changefreq: 'monthly', priority: 0.9 },
    { loc: `${base}/privacy-first-tools`,   lastmod: today, changefreq: 'monthly', priority: 0.9 },
    { loc: `${base}/buy-once-apps`,         lastmod: today, changefreq: 'monthly', priority: 0.9 },
    { loc: `${base}/local-data-tools`,      lastmod: today, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/html-apps-that-work-offline`, lastmod: today, changefreq: 'monthly', priority: 0.8 },
    // Products — available
    ...products
      .filter((p) => p.data.status === 'available')
      .map((p) => ({ loc: `${base}/apps/${p.slug}`, lastmod: p.data.changelog?.[0]?.date?.toISOString().split('T')[0] ?? today, changefreq: 'weekly' as const, priority: 0.9 })),
    // Products — coming-soon
    ...products
      .filter((p) => p.data.status === 'coming-soon')
      .map((p) => ({ loc: `${base}/apps/${p.slug}`, lastmod: today, changefreq: 'monthly' as const, priority: 0.7 })),
    // Changelog pages (available only)
    ...products
      .filter((p) => p.data.status === 'available')
      .map((p) => ({ loc: `${base}/apps/${p.slug}/updates`, lastmod: p.data.changelog?.[0]?.date?.toISOString().split('T')[0] ?? today, changefreq: 'weekly' as const, priority: 0.6 })),
    // Blog
    ...blogs.map((b) => ({ loc: `${base}/blog/${b.slug}`, lastmod: (b.data.dateModified ?? b.data.datePublished)?.toISOString().split('T')[0] ?? today, changefreq: 'monthly' as const, priority: 0.7 })),
    // Glossary
    ...glossaryTerms.map((g) => ({ loc: `${base}/glossary/${g.slug}`, lastmod: today, changefreq: 'monthly' as const, priority: 0.7 })),
    // pSEO
    ...pseoPages
      .filter((p) => p.data.pattern && patternPrefix[p.data.pattern])
      .map((p) => ({ loc: `${base}${patternPrefix[p.data.pattern]}/${p.slug}`, lastmod: (p.data.dateModified ?? p.data.datePublished)?.toISOString().split('T')[0] ?? today, changefreq: 'monthly' as const, priority: 0.7 })),
    // Legal
    { loc: `${base}/legal/privacy-policy`, lastmod: '2025-01-01', changefreq: 'yearly', priority: 0.3 },
    { loc: `${base}/legal/terms`,          lastmod: '2025-01-01', changefreq: 'yearly', priority: 0.3 },
    { loc: `${base}/legal/refund-policy`,  lastmod: '2025-01-01', changefreq: 'yearly', priority: 0.3 },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
${urls.map(entry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
