// src/lib/schema.ts
// JSON-LD structured data generators for all page types

import { SITE } from '../data/site';

/** Base organization schema — included on every page */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE.url}/assets/logo/ownitapps-logo.svg`,
      width: 200,
      height: 60,
    },
    description: SITE.description,
    sameAs: [SITE.social.youtube, SITE.social.tiktok],
    foundingDate: '2025',
    knowsAbout: [
      'offline-first apps',
      'no-subscription software',
      'local-first tools',
      'privacy-first digital tools',
      'buy-once software',
      'HTML apps',
      'browser-based apps',
    ],
  };
}

/** WebSite schema with SearchAction — homepage only */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Blog post / article schema */
export function blogPostSchema(data: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${data.url}#article`,
    headline: data.title,
    description: data.description,
    url: data.url,
    image: data.image ? `${SITE.url}${data.image}` : `${SITE.url}${SITE.defaultOgImage}`,
    datePublished: data.publishedTime,
    dateModified: data.modifiedTime ?? data.publishedTime,
    author: {
      '@type': 'Person',
      name: data.author ?? SITE.defaultAuthor,
    },
    publisher: { '@id': `${SITE.url}/#organization` },
    isPartOf: { '@id': `${SITE.url}/#website` },
    keywords: data.tags?.join(', '),
    articleSection: data.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': data.url },
  };
}

/** Product schema — combined with SoftwareApplication */
export function productSchema(data: {
  name: string;
  description: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
  version?: string;
  features?: string[];
  category?: string;
  updateUrl?: string;
}) {
  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${data.url}#software`,
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: data.category ?? 'ProductivityApplication',
    operatingSystem: 'Web Browser, Windows, macOS, Linux, iOS, Android',
    screenshot: data.image ? `${SITE.url}${data.image}` : undefined,
    softwareVersion: data.version,
    featureList: data.features?.join(', '),
    downloadUrl: data.url,
    releaseNotes: data.updateUrl ?? `${data.url}/updates`,
    offers: data.price != null
      ? {
          '@type': 'Offer',
          price: data.price.toString(),
          priceCurrency: data.currency ?? 'USD',
          priceValidUntil: '2099-12-31',
          availability: 'https://schema.org/InStock',
          seller: { '@id': `${SITE.url}/#organization` },
        }
      : undefined,
    publisher: { '@id': `${SITE.url}/#organization` },
    isAccessibleForFree: data.price === 0,
    isFamilyFriendly: true,
  };

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${data.url}#product`,
    name: data.name,
    description: data.description,
    url: data.url,
    image: data.image ? `${SITE.url}${data.image}` : `${SITE.url}${SITE.defaultOgImage}`,
    brand: { '@id': `${SITE.url}/#organization` },
    offers: data.price != null
      ? {
          '@type': 'Offer',
          price: data.price.toString(),
          priceCurrency: data.currency ?? 'USD',
          priceValidUntil: '2099-12-31',
          availability: 'https://schema.org/InStock',
          seller: { '@id': `${SITE.url}/#organization` },
        }
      : undefined,
  };

  return [softwareApp, product];
}

/** FAQ schema — used on blog, product, pSEO, glossary pages */
export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** BreadcrumbList schema */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}

/** CollectionPage schema — category pages, listing pages */
export function collectionPageSchema(data: {
  title: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string; description?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${data.url}#collection`,
    name: data.title,
    description: data.description,
    url: data.url.startsWith('http') ? data.url : `${SITE.url}${data.url}`,
    publisher: { '@id': `${SITE.url}/#organization` },
    hasPart: data.items.map((item) => ({
      '@type': 'WebPage',
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${SITE.url}${item.url}`,
      description: item.description,
    })),
  };
}

/** Article schema — pSEO pages, source-of-truth pages */
export function articleSchema(data: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${data.url}#article`,
    headline: data.title,
    description: data.description,
    url: data.url.startsWith('http') ? data.url : `${SITE.url}${data.url}`,
    image: data.image ? `${SITE.url}${data.image}` : `${SITE.url}${SITE.defaultOgImage}`,
    datePublished: data.publishedTime ?? new Date().toISOString(),
    dateModified: data.modifiedTime ?? data.publishedTime ?? new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: data.author ?? SITE.defaultAuthor,
    },
    publisher: { '@id': `${SITE.url}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url.startsWith('http') ? data.url : `${SITE.url}${data.url}`,
    },
  };
}

/** Glossary / DefinedTerm schema */
export function glossarySchema(data: {
  term: string;
  definition: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${data.url}#term`,
    name: data.term,
    description: data.definition,
    url: data.url.startsWith('http') ? data.url : `${SITE.url}${data.url}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: `${SITE.name} Glossary`,
      url: `${SITE.url}/glossary`,
    },
  };
}

/** ItemList schema — for comparison / listing sections */
export function itemListSchema(
  items: Array<{ name: string; url: string; position: number }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}

/** Serialize schemas for injection into page head */
export function serializeSchema(schema: object | object[]): string {
  const arr = Array.isArray(schema) ? schema : [schema];
  return arr
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s, null, 0)}</script>`)
    .join('\n');
}

// ── Convenience wrapper used by static pages ─────────────────────────────────

export interface BuildSEOSchemaOptions {
  type: 'article' | 'collectionPage' | 'product';
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export function buildSEOSchema(opts: BuildSEOSchemaOptions): object | object[] {
  const schemas: object[] = [];

  if (opts.type === 'article') {
    schemas.push(articleSchema({
      title: opts.title,
      description: opts.description,
      url: opts.url,
      ...(opts.datePublished ? { publishedTime: opts.datePublished } : {}),
      ...(opts.dateModified ? { modifiedTime: opts.dateModified } : {}),
      ...(opts.author ? { author: opts.author } : {}),
    }));
  } else if (opts.type === 'collectionPage') {
    schemas.push(collectionPageSchema({
      title: opts.title,
      description: opts.description,
      url: opts.url,
      items: [],
    }));
  }

  if (opts.faqs && opts.faqs.length > 0) {
    const faq = faqSchema(opts.faqs);
    if (faq) schemas.push(faq);
  }

  return schemas.length === 1 ? schemas[0]! : schemas;
}
