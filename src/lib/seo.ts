// src/lib/seo.ts
// SEO metadata generation utilities

import { SITE } from '../data/site';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  section?: string;
}

/** Hard limits for metadata */
export const SEO_LIMITS = {
  titleMax: 60,
  descriptionMax: 160,
  titleMin: 10,
  descriptionMin: 50,
} as const;

/**
 * Truncate text safely — never break mid-word, append ellipsis
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.substring(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.7 ? cut.substring(0, lastSpace) : cut) + '…';
}

/**
 * Build the full <title> string with brand suffix
 * Homepage gets brand + slogan, inner pages get page title | brand
 */
export function buildTitle(
  title: string,
  isHomepage = false,
  brandName = SITE.name
): string {
  if (isHomepage) {
    return `${brandName} — ${SITE.slogan}`;
  }
  const raw = `${title} | ${brandName}`;
  return truncate(raw, SEO_LIMITS.titleMax);
}

/**
 * Build safe meta description — truncate at word boundary
 */
export function buildDescription(description: string): string {
  return truncate(description.trim(), SEO_LIMITS.descriptionMax);
}

/**
 * Resolve canonical URL — ensures no trailing slash, absolute URL
 */
export function buildCanonical(path: string, baseUrl = SITE.url): string {
  const clean = path.replace(/\/$/, '') || '/';
  if (clean.startsWith('http')) return clean;
  return `${baseUrl}${clean === '/' ? '' : clean}`;
}

/**
 * Build OG image URL — fall back to default
 */
export function buildOgImage(image?: string): string {
  if (!image) return `${SITE.url}${SITE.defaultOgImage}`;
  if (image.startsWith('http')) return image;
  return `${SITE.url}${image}`;
}

/**
 * Validate SEO fields — returns array of warnings
 */
export function validateSEO(props: SEOProps): string[] {
  const warnings: string[] = [];

  if (!props.title) warnings.push('Missing title');
  else if (props.title.length > SEO_LIMITS.titleMax)
    warnings.push(`Title too long (${props.title.length}/${SEO_LIMITS.titleMax})`);
  else if (props.title.length < SEO_LIMITS.titleMin)
    warnings.push(`Title too short (${props.title.length}/${SEO_LIMITS.titleMin})`);

  if (!props.description) warnings.push('Missing description');
  else if (props.description.length > SEO_LIMITS.descriptionMax)
    warnings.push(`Description too long (${props.description.length}/${SEO_LIMITS.descriptionMax})`);
  else if (props.description.length < SEO_LIMITS.descriptionMin)
    warnings.push(`Description too short (${props.description.length}/${SEO_LIMITS.descriptionMin})`);

  // Canonical and OG image are resolved with safe defaults in buildSEO().
  // Do not warn when pages rely on those defaults.
  if (props.canonical === '') warnings.push('Empty canonical URL');
  if (props.image === '') warnings.push('Empty OG image');

  return warnings;
}

/**
 * Format ISO date for structured data
 */
export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString();
}

/**
 * Build robots meta content
 */
export function buildRobots(noindex = false): string {
  if (noindex) return 'noindex, nofollow';
  return 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
}

/**
 * Calculate reading time from content string
 */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200); // ~200 wpm
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract excerpt from markdown/HTML content
 */
export function buildExcerpt(content: string, maxLen = 160): string {
  // Strip HTML tags and markdown syntax
  const clean = content
    .replace(/<[^>]*>/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
  return truncate(clean, maxLen);
}

/**
 * Build full SEO object used by SEO.astro component
 */
export function buildSEO(props: SEOProps, path = ''): Required<SEOProps> & { resolvedTitle: string; resolvedDescription: string; resolvedCanonical: string; resolvedImage: string; robots: string } {
  const resolvedTitle = buildTitle(props.title);
  const resolvedDescription = buildDescription(props.description);
  const resolvedCanonical = buildCanonical(props.canonical ?? path);
  const resolvedImage = buildOgImage(props.image);
  const robots = buildRobots(props.noindex);

  if (import.meta.env.DEV) {
    const warnings = validateSEO(props);
    if (warnings.length > 0) {
      console.warn(`[SEO] ${path}:`, warnings.join(' | '));
    }
  }

  return {
    title: props.title,
    resolvedTitle,
    description: props.description,
    resolvedDescription,
    canonical: props.canonical ?? path,
    resolvedCanonical,
    image: props.image ?? SITE.defaultOgImage,
    resolvedImage,
    imageWidth: props.imageWidth ?? SITE.defaultOgWidth,
    imageHeight: props.imageHeight ?? SITE.defaultOgHeight,
    imageAlt: props.imageAlt ?? `${SITE.name} — ${SITE.slogan}`,
    type: props.type ?? 'website',
    noindex: props.noindex ?? false,
    robots,
    publishedTime: props.publishedTime ?? '',
    modifiedTime: props.modifiedTime ?? '',
    author: props.author ?? SITE.defaultAuthor,
    tags: props.tags ?? [],
    section: props.section ?? '',
  };
}
