// src/lib/validation.ts
// Build-time content validation utilities
// Called during getStaticPaths and content rendering to catch bad data early

import { SEO_LIMITS } from './seo';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BlogPostData {
  title: string;
  description: string;
  datePublished: Date;
  category: string;
  author?: string;
  slug?: string;
  draft?: boolean;
  featuredImage?: string;
  faqs?: Array<{ question: string; answer: string }>;
  aiSummary?: string;
  aiCitationText?: string;
  relatedProducts?: string[];
  relatedPosts?: string[];
}

export interface ProductData {
  name: string;
  tagline: string;
  description: string;
  price?: number;
  status: string;
  category: string;
  features: string[];
  faqs?: Array<{ question: string; answer: string }>;
  buyUrl?: string;
  version?: string;
  aiSummary?: string;
  aiCitationText?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PSEOData {
  pattern: string;
  title: string;
  description: string;
  targetKeyword: string;
  searchIntent: string;
  faqs?: Array<{ question: string; answer: string }>;
  relatedProducts?: string[];
  aiSummary?: string;
  intro?: string;
}

// ── Blog Post Validation ──────────────────────────────────────────────────────

export function validateBlogPost(data: BlogPostData, slug: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required checks
  if (!data.title || data.title.trim().length < 5) {
    errors.push(`[blog/${slug}] Title is missing or too short (min 5 chars)`);
  }

  if (!data.description || data.description.trim().length < 20) {
    errors.push(`[blog/${slug}] Description is missing or too short (min 20 chars)`);
  }

  if (!data.category) {
    errors.push(`[blog/${slug}] Category is required`);
  }

  if (!data.datePublished || isNaN(data.datePublished.getTime())) {
    errors.push(`[blog/${slug}] datePublished is invalid or missing`);
  }

  // SEO checks
  if (data.title && data.title.length > SEO_LIMITS.titleMax) {
    warnings.push(`[blog/${slug}] Title is ${data.title.length} chars (max recommended: ${SEO_LIMITS.titleMax})`);
  }

  if (data.description && data.description.length > SEO_LIMITS.descriptionMax) {
    warnings.push(`[blog/${slug}] Description is ${data.description.length} chars (max recommended: ${SEO_LIMITS.descriptionMax})`);
  }

  // LLM SEO checks
  if (!data.aiSummary) {
    warnings.push(`[blog/${slug}] Missing aiSummary — reduces LLM SEO readiness`);
  }

  if (!data.aiCitationText) {
    warnings.push(`[blog/${slug}] Missing aiCitationText — reduces AI citation potential`);
  }

  if (!data.faqs || data.faqs.length === 0) {
    warnings.push(`[blog/${slug}] No FAQs defined — missing FAQPage schema and answer-box opportunity`);
  }

  if (!data.featuredImage) {
    warnings.push(`[blog/${slug}] No featuredImage — affects OG sharing and article schema`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ── Product Validation ────────────────────────────────────────────────────────

export function validateProduct(data: ProductData, slug: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push(`[products/${slug}] Product name is missing or too short`);
  }

  if (!data.tagline || data.tagline.trim().length < 5) {
    errors.push(`[products/${slug}] Tagline is missing or too short`);
  }

  if (!data.description || data.description.trim().length < 20) {
    errors.push(`[products/${slug}] Description is missing or too short`);
  }

  if (!data.status) {
    errors.push(`[products/${slug}] Status is required (available/coming-soon/beta/deprecated)`);
  }

  if (!data.category) {
    errors.push(`[products/${slug}] Category is required`);
  }

  // Availability-specific
  if (data.status === 'available') {
    if (!data.price && data.price !== 0) {
      warnings.push(`[products/${slug}] Available product has no price set`);
    }
    if (!data.buyUrl) {
      warnings.push(`[products/${slug}] Available product has no buyUrl — users can't purchase`);
    }
  }

  // Quality checks
  if (data.features.length < 5) {
    warnings.push(`[products/${slug}] Only ${data.features.length} features listed (recommend at least 6)`);
  }

  if (!data.faqs || data.faqs.length === 0) {
    warnings.push(`[products/${slug}] No FAQs — missing FAQPage schema`);
  } else if (data.faqs.length < 5) {
    warnings.push(`[products/${slug}] Only ${data.faqs.length} FAQs (recommend at least 5)`);
  }

  // SEO
  if (!data.seoTitle) {
    warnings.push(`[products/${slug}] Missing seoTitle — will fall back to product name`);
  } else if (data.seoTitle.length > SEO_LIMITS.titleMax) {
    warnings.push(`[products/${slug}] seoTitle is ${data.seoTitle.length} chars (max ${SEO_LIMITS.titleMax})`);
  }

  if (!data.seoDescription) {
    warnings.push(`[products/${slug}] Missing seoDescription — will fall back to tagline`);
  }

  // LLM SEO
  if (!data.aiSummary) {
    warnings.push(`[products/${slug}] Missing aiSummary`);
  }

  if (!data.aiCitationText) {
    warnings.push(`[products/${slug}] Missing aiCitationText`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ── pSEO Page Validation ──────────────────────────────────────────────────────

export function validatePSEOPage(data: PSEOData, slug: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.pattern) {
    errors.push(`[pseo/${slug}] Pattern is required`);
  }

  if (!data.title || data.title.length < 5) {
    errors.push(`[pseo/${slug}] Title is missing or too short`);
  }

  if (!data.description || data.description.length < 20) {
    errors.push(`[pseo/${slug}] Description is required`);
  }

  if (!data.targetKeyword) {
    errors.push(`[pseo/${slug}] targetKeyword is required for pSEO pages`);
  }

  if (!data.searchIntent) {
    errors.push(`[pseo/${slug}] searchIntent is required`);
  }

  if (!data.faqs || data.faqs.length === 0) {
    warnings.push(`[pseo/${slug}] No FAQs — pSEO pages should have at least 5 FAQs`);
  } else if (data.faqs.length < 3) {
    warnings.push(`[pseo/${slug}] Only ${data.faqs.length} FAQs (recommend 5+)`);
  }

  if (!data.relatedProducts || data.relatedProducts.length === 0) {
    warnings.push(`[pseo/${slug}] No relatedProducts — missed product link opportunity`);
  }

  if (!data.aiSummary) {
    warnings.push(`[pseo/${slug}] Missing aiSummary — reduces AI answer engine visibility`);
  }

  if (!data.intro) {
    warnings.push(`[pseo/${slug}] No intro paragraph defined`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ── Duplicate slug detection ──────────────────────────────────────────────────

export function detectDuplicateSlugs(slugs: string[], collection: string): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const slug of slugs) {
    if (seen.has(slug)) {
      console.error(`[${collection}] Duplicate slug detected: "${slug}" — one entry will be skipped`);
      duplicates.push(slug);
    }
    seen.add(slug);
  }
  return duplicates;
}

// ── Safe entry processor (won't crash builds) ─────────────────────────────────

export function safeProcessEntry<T>(
  entry: T,
  slug: string,
  validate: (entry: T, slug: string) => ValidationResult,
  collection: string
): boolean {
  try {
    const result = validate(entry, slug);

    // Log errors — these skip the entry
    for (const error of result.errors) {
      console.error(`❌ ${error}`);
    }

    // Log warnings — these don't skip
    for (const warning of result.warnings) {
      console.warn(`⚠️  ${warning}`);
    }

    if (!result.valid) {
      console.error(`❌ [${collection}/${slug}] Skipping entry due to ${result.errors.length} validation error(s)`);
    }

    return result.valid;
  } catch (err) {
    console.error(`❌ [${collection}/${slug}] Validation threw an error: ${err}`);
    return false;
  }
}

// ── Brand consistency check ───────────────────────────────────────────────────

const WRONG_BRAND_STRINGS = [
  'ownitapp.com',      // missing s
  'OwnitApp ',         // missing s
  'Ownit Apps',        // space between words
];

export function checkBrandConsistency(content: string, slug: string): void {
  for (const wrong of WRONG_BRAND_STRINGS) {
    if (content.toLowerCase().includes(wrong.toLowerCase())) {
      console.warn(`⚠️  [${slug}] Possible brand inconsistency — found "${wrong}" in content`);
    }
  }
}

// ── Word count estimator ──────────────────────────────────────────────────────

export function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isThinContent(wordCount: number, minWords = 300): boolean {
  return wordCount < minWords;
}

// ── Export summary formatter ──────────────────────────────────────────────────

export function printValidationSummary(
  collection: string,
  total: number,
  skipped: number,
  warnings: number
): void {
  const status = skipped > 0 ? '❌' : warnings > 0 ? '⚠️ ' : '✅';
  console.log(
    `${status} [${collection}] ${total - skipped}/${total} entries valid · ${skipped} skipped · ${warnings} warnings`
  );
}
