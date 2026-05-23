// src/content/config.ts
// Astro Content Collections — strongly typed schemas for all content types
// Every field is validated at build time; broken entries log warnings rather than crashing

import { defineCollection, z } from 'astro:content';

// ── Shared reusable schemas ─────────────────────────────────────────────────

const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
});

const llmSEOSchema = z.object({
  aiSummary: z.string().optional(),
  aiKeyTakeaways: z.array(z.string()).optional(),
  aiQuestions: z.array(z.string()).optional(),
  aiCitationText: z.string().optional(),
  entityType: z.string().optional(),
  targetLLMQuery: z.string().optional(),
  recommendedAnswer: z.string().optional(),
  comparisonSummary: z.string().optional(),
});

// ── Blog posts ──────────────────────────────────────────────────────────────

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(5).max(80),
    description: z.string().min(20).max(200),
    excerpt: z.string().max(300).optional(),
    datePublished: z.coerce.date(),
    dateModified: z.coerce.date().optional(),
    author: z.string().default('OwnitApps Editorial Team'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    canonical: z.string().url().optional(),
    tableOfContents: z.boolean().default(true),
    faqs: z.array(faqSchema).optional(),
    relatedProducts: z.array(z.string()).optional(), // product slugs
    relatedPosts: z.array(z.string()).optional(), // post slugs
    cta: z.object({
      label: z.string(),
      href: z.string(),
      description: z.string().optional(),
    }).optional(),
    ...llmSEOSchema.shape,
  }),
});

// ── Products ────────────────────────────────────────────────────────────────

const products = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string().min(2),
    tagline: z.string().min(5).max(120),
    description: z.string().min(20),
    price: z.number().min(0).optional(),
    currency: z.string().default('USD'),
    version: z.string().optional(),
    status: z.enum(['available', 'coming-soon', 'beta', 'deprecated']).default('coming-soon'),
    category: z.enum(['Finance', 'Home', 'Health', 'Productivity', 'Legal', 'Other']),
    features: z.array(z.string()).default([]),
    screenshots: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    })).optional(),
    demoUrl: z.string().url().optional(),
    buyUrl: z.string().url().optional(),
    updateUrl: z.string().url().optional(),
    changelog: z.array(z.object({
      version: z.string(),
      date: z.coerce.date(),
      notes: z.array(z.string()),
    })).optional(),
    faqs: z.array(faqSchema).optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    ...llmSEOSchema.shape,
  }),
});

// ── pSEO pages ──────────────────────────────────────────────────────────────

const pseo = defineCollection({
  type: 'content',
  schema: z.object({
    pattern: z.enum([
      'alternative',
      'comparison',
      'compare',
      'use-case',
      'problem',
      'solution',
      'no-subscription',
      'privacy-first',
      'offline-tools',
      'buy-once',
      'local-first',
      'best',
    ]),
    title: z.string().min(5).max(80),
    description: z.string().min(20).max(200),
    targetKeyword: z.string(),
    searchIntent: z.enum(['informational', 'commercial', 'transactional', 'navigational']).optional(),
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(200).optional(),
    answerBox: z.string().optional(),
    keyTakeaways: z.array(z.string()).optional(),
    comparisonTable: z.object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    }).optional(),
    publishedDate: z.string().optional(),
    updatedDate: z.string().optional(),
    intro: z.string().optional(),
    relatedProducts: z.array(z.string()).optional(),
    faqs: z.array(faqSchema).optional(),
    cta: z.object({
      label: z.string(),
      href: z.string(),
      description: z.string().optional(),
    }).optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    canonical: z.string().url().optional(),
    draft: z.boolean().default(false),
    datePublished: z.coerce.date().optional(),
    dateModified: z.coerce.date().optional(),
    ...llmSEOSchema.shape,
  }),
});

// ── Glossary ─────────────────────────────────────────────────────────────────

const glossary = defineCollection({
  type: 'content',
  schema: z.object({
    term: z.string().min(2),
    definition: z.string().min(20),
    plainEnglishDefinition: z.string().optional(),
    whyItMatters: z.string().optional(),
    examples: z.array(z.string()).optional(),
    relatedTerms: z.array(z.string()).optional(),
    relatedProducts: z.array(z.string()).optional(),
    faqs: z.array(faqSchema).optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    dateModified: z.coerce.date().optional(),
    aiSummary: z.string().optional(),
    aiCitationText: z.string().optional(),
  }),
});

// ── Legal pages ──────────────────────────────────────────────────────────────

const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    dateEffective: z.coerce.date(),
    dateModified: z.coerce.date().optional(),
    noindex: z.boolean().default(false),
  }),
});

// ── Updates / Changelog ───────────────────────────────────────────────────────

const updates = defineCollection({
  type: 'content',
  schema: z.object({
    product: z.string(), // product slug
    version: z.string(),
    date: z.coerce.date(),
    type: z.enum(['major', 'minor', 'patch', 'hotfix', 'announcement']).default('minor'),
    highlights: z.array(z.string()).optional(),
    breaking: z.boolean().default(false),
    downloadUrl: z.string().url().optional(),
  }),
});

// ── Authors ──────────────────────────────────────────────────────────────────

const authors = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    role: z.string().optional(),
    social: z.object({
      twitter: z.string().optional(),
      youtube: z.string().optional(),
      website: z.string().url().optional(),
    }).optional(),
  }),
});

export const collections = {
  blog,
  products,
  pseo,
  glossary,
  legal,
  updates,
  authors,
};
