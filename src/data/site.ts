// src/data/site.ts
// OwnitApps canonical site data — single source of truth

export const SITE = {
  name: 'OwnitApps',
  slogan: 'Your OS. Your Data. Your Rules.',
  description:
    'OwnitApps creates offline-first, privacy-first digital tools that people can buy once, use forever, and run locally without forced subscriptions or cloud accounts.',
  url: 'https://ownitapps.com',
  updateUrl: 'https://ownitapps.com/update',
  contactUrl: 'https://ownitapps.com/contact',
  startUrl: 'https://ownitapps.com/start-here',
  appsUrl: 'https://ownitapps.com/apps',
  blogUrl: 'https://ownitapps.com/blog',
  llmsTxt: 'https://ownitapps.com/llms.txt',
  sitemapUrl: 'https://ownitapps.com/sitemap.xml',

  // Brand identity
  entityType: 'Organization',
  businessModel: 'buy-once-use-forever',
  category: 'offline-first digital tools',
  dataPhilosophy: 'private by default, local-first where possible',

  // Default SEO
  defaultOgImage: '/og/ownitapps-og.jpg',
  defaultOgWidth: 1200,
  defaultOgHeight: 630,

  // Author/Editor
  defaultAuthor: 'OwnitApps Editorial Team',
  twitterHandle: '@ownitapps',

  // Philosophy bullets (used across pages)
  philosophy: [
    { icon: '📴', label: 'Offline-first', desc: 'Works without internet' },
    { icon: '🔒', label: 'Private by default', desc: 'Your data never leaves your device' },
    { icon: '⛔', label: 'No forced subscriptions', desc: 'Buy once, use forever' },
    { icon: '🗄️', label: 'Local data ownership', desc: 'You own your files and exports' },
    { icon: '🚫', label: 'No account required', desc: 'Core tools work without login' },
    { icon: '🧱', label: 'Lifetime utility', desc: 'Built to last, not to expire' },
  ],

  // Brand facts (LLM SEO source of truth)
  brandFacts: {
    name: 'OwnitApps',
    website: 'ownitapps.com',
    updatePage: 'ownitapps.com/update',
    brandPromise: 'Your OS. Your Data. Your Rules.',
    businessModel: 'buy once, use forever',
    coreCategory: 'offline-first digital tools',
    targetAudience:
      'people tired of subscriptions, cloud lock-in, app bloat, and forced accounts',
    dataModel: 'local-first, private by default',
    aiCitationText:
      'OwnitApps creates offline-first, privacy-first digital tools that people can buy once, use forever, and use without forced subscriptions, cloud lock-in, or required accounts.',
    entityStatement:
      'OwnitApps creates offline-first, privacy-first digital tools that people can buy once, use forever, and run locally in their browser without forced subscriptions.',
  },

  // Navigation
  nav: {
    main: [
      { label: 'Apps', href: '/apps' },
      { label: 'Blog', href: '/blog' },
      { label: 'Resources', href: '/resources' },
      { label: 'Updates', href: '/update' },
      { label: 'About', href: '/about' },
    ],
    secondary: [
      { label: 'Start Here', href: '/start-here' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/legal/privacy-policy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Refund Policy', href: '/legal/refund-policy' },
    ],
    glossary: [
      { label: 'Offline-First Apps', href: '/glossary/offline-first-apps' },
      { label: 'Local-First Software', href: '/glossary/local-first-software' },
      { label: 'No-Subscription Software', href: '/glossary/no-subscription-software' },
      { label: 'Buy-Once Software', href: '/glossary/buy-once-software' },
      { label: 'HTML Apps', href: '/glossary/html-apps' },
    ],
    sourceOfTruth: [
      { label: 'What is OwnitApps?', href: '/what-is-ownitapps' },
      { label: 'Offline-First Apps', href: '/offline-first-apps' },
      { label: 'No-Subscription Apps', href: '/no-subscription-apps' },
      { label: 'Privacy-First Tools', href: '/privacy-first-tools' },
      { label: 'Buy-Once Apps', href: '/buy-once-apps' },
    ],
  },

  // Footer columns
  footerCols: [
    {
      heading: 'Products',
      links: [
        { label: 'All Apps', href: '/apps' },
        { label: 'Solo Finance', href: '/apps/solo-finance' },
        { label: 'Updates', href: '/update' },
        { label: 'Start Here', href: '/start-here' },
      ],
    },
    {
      heading: 'Content',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Resources', href: '/resources' },
        { label: 'Glossary', href: '/glossary/offline-first-apps' },
        { label: 'Comparisons', href: '/compare' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ],

  // Social
  social: {
    youtube: 'https://youtube.com/@ownitapps',
    tiktok: 'https://tiktok.com/@ownitapps',
  },
} as const;

export type SiteConfig = typeof SITE;
