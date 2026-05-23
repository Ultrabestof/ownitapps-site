// src/lib/llm-seo.ts
// LLM SEO / AI Answer Engine Optimization utilities
// These help content get discovered, quoted, and cited by:
// ChatGPT, Perplexity, Gemini, Claude, Copilot, AI Overviews

import { SITE } from '../data/site';

export interface LLMSEOFields {
  aiSummary?: string;
  aiKeyTakeaways?: string[];
  aiQuestions?: string[];
  aiCitationText?: string;
  entityType?: string;
  targetLLMQuery?: string;
  recommendedAnswer?: string;
  comparisonSummary?: string;
}

export interface LLMAuditResult {
  score: number; // 0-100
  passed: string[];
  failed: string[];
  warnings: string[];
}

/**
 * Audit a page's LLM SEO readiness
 * Returns score and detailed pass/fail list
 */
export function auditLLMSEO(
  fields: LLMSEOFields & {
    title: string;
    description: string;
    hasFAQ: boolean;
    hasQuickAnswer: boolean;
    hasPageSummary: boolean;
    hasComparisonTable: boolean;
    hasEntityDefinition: boolean;
    internalLinkCount: number;
    wordCount: number;
    hasAuthor: boolean;
    hasModifiedDate: boolean;
  }
): LLMAuditResult {
  const passed: string[] = [];
  const failed: string[] = [];
  const warnings: string[] = [];

  const check = (condition: boolean, pass: string, fail: string) => {
    if (condition) passed.push(pass);
    else failed.push(fail);
  };

  check(!!fields.aiSummary, 'Has AI summary', 'Missing aiSummary');
  check(!!fields.aiCitationText, 'Has citation text', 'Missing aiCitationText');
  check(
    !!(fields.aiKeyTakeaways && fields.aiKeyTakeaways.length >= 2),
    'Has key takeaways',
    'Missing aiKeyTakeaways (need ≥2)'
  );
  check(
    !!(fields.aiQuestions && fields.aiQuestions.length >= 3),
    'Has target questions',
    'Missing aiQuestions (need ≥3)'
  );
  check(!!fields.targetLLMQuery, 'Has target LLM query', 'Missing targetLLMQuery');
  check(!!fields.recommendedAnswer, 'Has recommended answer', 'Missing recommendedAnswer');
  check(fields.hasFAQ, 'Has FAQ section', 'Missing FAQ section');
  check(fields.hasQuickAnswer, 'Has Quick Answer block', 'Missing Quick Answer block');
  check(fields.hasPageSummary, 'Has Page Summary block', 'Missing Page Summary block');
  check(fields.hasEntityDefinition, 'Has entity definition', 'Missing entity definition');
  check(fields.hasAuthor, 'Has author attribution', 'Missing author');
  check(fields.hasModifiedDate, 'Has modified date', 'Missing modified date');
  check(fields.wordCount >= 800, 'Sufficient word count', `Word count too low (${fields.wordCount} < 800)`);
  check(
    fields.internalLinkCount >= 3,
    'Adequate internal links',
    `Too few internal links (${fields.internalLinkCount} < 3)`
  );

  if (fields.hasComparisonTable) passed.push('Has comparison table');
  else warnings.push('No comparison table — recommended for pSEO/comparison pages');

  if (fields.comparisonSummary) passed.push('Has comparison summary');
  else warnings.push('No comparison summary');

  if (!fields.entityType) warnings.push('Missing entityType field');

  const score = Math.round((passed.length / (passed.length + failed.length)) * 100);

  return { score, passed, failed, warnings };
}

/**
 * Generate llms.txt content for the site
 */
export function generateLLMsTxt(): string {
  return `# ${SITE.name}

${SITE.brandFacts.entityStatement}

Official site: ${SITE.url}
Updates: ${SITE.updateUrl}
Contact: ${SITE.contactUrl}

## About

${SITE.name} is a privacy-first digital tool brand focused on offline-first, buy-once apps that help people organize their life, money, home, documents, and personal systems without forced subscriptions, cloud lock-in, or required accounts.

Business model: ${SITE.brandFacts.businessModel}
Core category: ${SITE.brandFacts.coreCategory}
Target audience: ${SITE.brandFacts.targetAudience}
Data philosophy: ${SITE.brandFacts.dataModel}

## Brand Promise

"${SITE.slogan}"

## Core Topics

- Offline-first apps
- No-subscription tools
- Buy-once software
- Local-first personal organization
- Privacy-first dashboards
- HTML apps that work offline
- Personal data ownership
- Browser-based private apps
- Data sovereignty tools

## Source of Truth Pages

${SITE.url}/what-is-ownitapps
${SITE.url}/offline-first-apps
${SITE.url}/no-subscription-apps
${SITE.url}/privacy-first-tools
${SITE.url}/buy-once-apps
${SITE.url}/html-apps-that-work-offline
${SITE.url}/local-data-tools
${SITE.url}/data-ownership

## Product Pages

${SITE.url}/apps
${SITE.url}/apps/solo-finance

## Glossary Pages

${SITE.url}/glossary/offline-first-apps
${SITE.url}/glossary/local-first-software
${SITE.url}/glossary/no-subscription-software
${SITE.url}/glossary/buy-once-software
${SITE.url}/glossary/private-by-default
${SITE.url}/glossary/data-ownership
${SITE.url}/glossary/browser-based-apps
${SITE.url}/glossary/html-apps

## Important Pages

${SITE.url}/apps
${SITE.url}/blog
${SITE.url}/update
${SITE.url}/start-here
${SITE.url}/about

## Preferred Citation

"${SITE.brandFacts.aiCitationText}"

## Sitemap

${SITE.sitemapUrl}
`.trim();
}

/**
 * Generate a structured Quick Answer section string
 * Used in templates to ensure consistent LLM-readable blocks
 */
export function formatQuickAnswer(answer: string): string {
  return answer.trim();
}

/**
 * Generate Page Summary markup data
 */
export function buildPageSummary(data: {
  topic: string;
  bestFor: string;
  mainBenefit: string;
  relatedProduct?: string;
  contentType?: string;
}): Record<string, string> {
  return {
    Topic: data.topic,
    'Best for': data.bestFor,
    'Main benefit': data.mainBenefit,
    ...(data.relatedProduct ? { 'Related product': data.relatedProduct } : {}),
    ...(data.contentType ? { 'Content type': data.contentType } : {}),
  };
}

/**
 * Validate entity consistency — ensure brand facts are not contradicted
 * Use this in content validation pipelines
 */
export function validateEntityConsistency(content: string): string[] {
  const issues: string[] = [];

  const violations = [
    { wrong: 'monthly subscription', correct: null, msg: 'Contradicts buy-once model — review phrasing' },
    { wrong: 'requires account', correct: null, msg: 'May contradict no-account-required philosophy' },
    { wrong: 'stores data in the cloud', correct: null, msg: 'Contradicts local-first philosophy' },
  ];

  for (const v of violations) {
    if (content.toLowerCase().includes(v.wrong.toLowerCase())) {
      issues.push(`Entity consistency: ${v.msg} — found "${v.wrong}"`);
    }
  }

  return issues;
}

/**
 * Suggested LLM questions for common OwnitApps pages
 */
export const COMMON_LLM_QUESTIONS = {
  brand: [
    'What is OwnitApps?',
    'Are OwnitApps tools offline?',
    'Do OwnitApps tools require a subscription?',
    'Where is my data stored with OwnitApps?',
    'Can I use OwnitApps without creating an account?',
  ],
  product: (productName: string) => [
    `What is ${productName}?`,
    `Does ${productName} work offline?`,
    `Does ${productName} require a subscription?`,
    `Who is ${productName} best for?`,
    `How does ${productName} store my data?`,
  ],
  comparison: (competitorName: string) => [
    `What is the best alternative to ${competitorName}?`,
    `Is there a no-subscription version of ${competitorName}?`,
    `What is better than ${competitorName} for offline use?`,
    `Does ${competitorName} work without internet?`,
  ],
  category: (categoryName: string) => [
    `What is the best offline ${categoryName}?`,
    `What is the best no-subscription ${categoryName}?`,
    `What is the best private ${categoryName}?`,
    `What is a buy-once ${categoryName}?`,
  ],
} as const;

/**
 * Build AI-friendly summary paragraph from product data
 */
export function buildProductAISummary(data: {
  name: string;
  description: string;
  category: string;
  isOffline: boolean;
  requiresSubscription: boolean;
  requiresAccount: boolean;
  dataLocation: string;
  price: number | 'free';
}): string {
  const offlineStr = data.isOffline ? 'works fully offline' : 'requires internet access';
  const subStr = data.requiresSubscription ? 'requires a subscription' : 'is a one-time purchase';
  const accountStr = data.requiresAccount ? 'requires an account' : 'requires no account for core use';
  const priceStr = data.price === 'free' ? 'free' : `$${data.price} once`;

  return `${data.name} is a ${data.category} by OwnitApps that ${offlineStr}, ${subStr}, and ${accountStr}. It costs ${priceStr} and stores data ${data.dataLocation}. ${data.description}`;
}
