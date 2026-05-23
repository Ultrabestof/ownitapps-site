/**
 * OwnitApps pSEO Patterns Data
 * Defines all programmatic SEO patterns, target slugs, and template metadata.
 */

export type PSEOPattern =
  | 'no-subscription'
  | 'alternatives'
  | 'privacy-first'
  | 'offline-tools'
  | 'problems'
  | 'use-cases'
  | 'buy-once'
  | 'compare'
  | 'best';

export interface PSEOPatternMeta {
  pattern: PSEOPattern;
  routePrefix: string;
  pageType: 'comparison' | 'alternative' | 'use-case' | 'problem' | 'solution' | 'category' | 'collection';
  titleTemplate: string;
  descriptionTemplate: string;
  searchIntentType: 'informational' | 'navigational' | 'commercial' | 'transactional';
  primaryCTA: string;
  targetAudience: string;
  contentPillars: string[];
}

export const PSEO_PATTERNS: Record<PSEOPattern, PSEOPatternMeta> = {
  'no-subscription': {
    pattern: 'no-subscription',
    routePrefix: '/no-subscription',
    pageType: 'solution',
    titleTemplate: 'Best No-Subscription {topic} — Buy Once, Use Forever',
    descriptionTemplate:
      'Looking for a {topic} with no monthly fees? Discover the best buy-once offline alternative. Own your data, pay once, use forever.',
    searchIntentType: 'commercial',
    primaryCTA: 'See No-Subscription Apps',
    targetAudience: 'People tired of monthly subscriptions for productivity and organization tools',
    contentPillars: ['subscription fatigue', 'buy-once pricing', 'offline-first', 'data ownership'],
  },
  alternatives: {
    pattern: 'alternatives',
    routePrefix: '/alternatives',
    pageType: 'alternative',
    titleTemplate: 'Best {tool} Alternative — Offline, Private, Buy Once',
    descriptionTemplate:
      'Tired of {tool}? Find a privacy-first, offline-first alternative you buy once and own forever. No subscription, no cloud lock-in.',
    searchIntentType: 'commercial',
    primaryCTA: 'Browse OwnitApps',
    targetAudience: 'Users switching away from SaaS tools due to cost, privacy, or complexity',
    contentPillars: ['SaaS alternatives', 'subscription-free', 'offline-first', 'data control'],
  },
  'privacy-first': {
    pattern: 'privacy-first',
    routePrefix: '/privacy-first',
    pageType: 'solution',
    titleTemplate: 'Best Privacy-First {topic} — Local Data, No Account',
    descriptionTemplate:
      'Discover the best privacy-first {topic} that keeps your data local. No cloud account required. Offline-first, buy-once design.',
    searchIntentType: 'commercial',
    primaryCTA: 'See Privacy-First Tools',
    targetAudience: 'Privacy-conscious users who want tools that do not collect or upload their data',
    contentPillars: ['privacy-first', 'local-first data', 'no account required', 'offline-first'],
  },
  'offline-tools': {
    pattern: 'offline-tools',
    routePrefix: '/offline-tools',
    pageType: 'solution',
    titleTemplate: 'Best Offline {topic} Tool — Works Without Internet',
    descriptionTemplate:
      'Looking for a {topic} tool that works offline? Discover buy-once HTML tools that run in your browser with no internet required.',
    searchIntentType: 'commercial',
    primaryCTA: 'Browse Offline Tools',
    targetAudience: 'Users who need tools that work without reliable internet or cloud dependency',
    contentPillars: ['offline-first', 'local storage', 'no internet required', 'HTML tools'],
  },
  problems: {
    pattern: 'problems',
    routePrefix: '/problems',
    pageType: 'problem',
    titleTemplate: 'How to Solve {problem} — Offline-First Approach',
    descriptionTemplate:
      'Struggling with {problem}? Learn why it is a growing problem and how offline-first, buy-once tools can help you take back control.',
    searchIntentType: 'informational',
    primaryCTA: 'See the Solution',
    targetAudience: 'People experiencing pain with SaaS tools, subscriptions, or cloud data',
    contentPillars: ['subscription fatigue', 'cloud lock-in', 'data privacy', 'tool complexity'],
  },
  'use-cases': {
    pattern: 'use-cases',
    routePrefix: '/use-cases',
    pageType: 'use-case',
    titleTemplate: 'How to {use_case} — Offline-First, No Subscription',
    descriptionTemplate:
      'Learn how to {use_case} with offline-first tools that protect your data. No subscription needed — buy once and own the system.',
    searchIntentType: 'informational',
    primaryCTA: 'Find the Right Tool',
    targetAudience: 'People looking for practical guidance on offline personal organization workflows',
    contentPillars: ['practical workflows', 'offline tools', 'personal systems', 'data organization'],
  },
  'buy-once': {
    pattern: 'buy-once',
    routePrefix: '/buy-once',
    pageType: 'collection',
    titleTemplate: 'Best Buy-Once {topic} — Pay Once, Own Forever',
    descriptionTemplate:
      'Looking for a {topic} you buy once and own forever? Discover OwnitApps buy-once tools with no recurring fees, no cloud lock-in.',
    searchIntentType: 'commercial',
    primaryCTA: 'Browse Buy-Once Apps',
    targetAudience: 'People who prefer one-time software purchases over subscriptions',
    contentPillars: ['buy-once pricing', 'lifetime ownership', 'no subscriptions', 'offline-first'],
  },
  compare: {
    pattern: 'compare',
    routePrefix: '/compare',
    pageType: 'comparison',
    titleTemplate: '{tool_a} vs {tool_b} — Full Comparison',
    descriptionTemplate:
      'Compare {tool_a} vs {tool_b} side by side: pricing, offline access, privacy, data ownership, and best choice by user type.',
    searchIntentType: 'commercial',
    primaryCTA: 'See the Best Option',
    targetAudience: 'Users evaluating two competing tools before making a decision',
    contentPillars: ['tool comparison', 'pricing', 'privacy', 'offline access', 'data ownership'],
  },
  best: {
    pattern: 'best',
    routePrefix: '/best',
    pageType: 'collection',
    titleTemplate: 'Best {topic} for Offline-First Ownership',
    descriptionTemplate:
      'Discover the best {topic} for people who want offline-first, privacy-first tools with no subscription. Ranked by ownership and control.',
    searchIntentType: 'commercial',
    primaryCTA: 'Browse Best Tools',
    targetAudience: 'Shoppers looking for top-rated tools in a specific niche',
    contentPillars: ['best tools', 'offline-first', 'privacy-first', 'buy-once'],
  },
};

// ─── Target slugs per pattern ─────────────────────────────────────────────────

export const PSEO_SLUGS: Record<PSEOPattern, string[]> = {
  'no-subscription': [
    'budget-planner',
    'home-organizer',
    'debt-tracker',
    'invoice-tracker',
    'medical-records',
    'expense-tracker',
    'family-binder',
    'freelancer-ledger',
    'tax-planner',
    'paycheck-planner',
  ],
  alternatives: [
    'notion',
    'ynab',
    'google-sheets',
    'mint',
    'airtable',
    'evernote',
    'trello',
    'monday',
    'quickbooks-self-employed',
    'freshbooks',
  ],
  'privacy-first': [
    'budget-planner',
    'family-health-vault',
    'home-admin-binder',
    'debt-tracker',
    'invoice-manager',
    'freelancer-ledger',
    'medical-binder',
    'personal-finance-tracker',
  ],
  'offline-tools': [
    'budget-planner',
    'home-admin-binder',
    'debt-tracker',
    'invoice-manager',
    'medical-records',
    'expense-tracker',
    'paycheck-organizer',
    'tax-ledger',
  ],
  problems: [
    'subscription-fatigue',
    'cloud-lock-in',
    'data-privacy-concerns',
    'app-bloat',
    'forced-accounts',
    'losing-access-after-cancellation',
    'syncing-failures',
    'rising-saas-costs',
  ],
  'use-cases': [
    'manage-family-documents-offline',
    'track-debt-without-cloud',
    'organize-home-admin-without-subscription',
    'run-freelance-finances-offline',
    'manage-medical-records-privately',
    'plan-budget-by-paycheck',
    'track-invoices-without-login',
    'manage-side-hustle-taxes',
  ],
  'buy-once': [
    'budget-planner',
    'home-organizer',
    'debt-tracker',
    'invoice-manager',
    'family-health-vault',
    'paycheck-planner',
    'freelancer-toolkit',
    'personal-finance-system',
  ],
  compare: [
    'ynab-vs-ownitapps-budget',
    'notion-vs-ownitapps-binder',
    'mint-vs-ownitapps-budget',
    'google-sheets-vs-ownitapps',
    'freshbooks-vs-solo-finance',
    'quickbooks-vs-solo-finance',
  ],
  best: [
    'offline-budget-planner',
    'no-subscription-home-organizer',
    'privacy-first-medical-binder',
    'buy-once-debt-tracker',
    'offline-invoice-manager',
  ],
};

// ─── SEO priority weights ─────────────────────────────────────────────────────

export const PATTERN_PRIORITY: Record<PSEOPattern, number> = {
  'no-subscription': 0.9,
  alternatives: 0.85,
  'privacy-first': 0.85,
  'offline-tools': 0.8,
  problems: 0.75,
  'use-cases': 0.75,
  'buy-once': 0.8,
  compare: 0.9,
  best: 0.85,
};

export function getPatternMeta(pattern: string): PSEOPatternMeta | null {
  return PSEO_PATTERNS[pattern as PSEOPattern] ?? null;
}

export function getAllPatternSlugs(): Array<{ pattern: PSEOPattern; slug: string }> {
  const result: Array<{ pattern: PSEOPattern; slug: string }> = [];
  for (const [pattern, slugs] of Object.entries(PSEO_SLUGS)) {
    for (const slug of slugs) {
      result.push({ pattern: pattern as PSEOPattern, slug });
    }
  }
  return result;
}
