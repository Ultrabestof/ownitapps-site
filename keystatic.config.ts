// keystatic.config.ts
// OwnitApps CMS — visual editor for all content collections
// Runs at /keystatic during `astro dev`
// Mirrors src/content/config.ts Zod schemas exactly

import { config, collection, fields } from '@keystatic/core';

// ── Reusable field groups ──────────────────────────────────────────────────────

const faqFields = fields.array(
  fields.object({
    question: fields.text({ label: 'Question', validation: { isRequired: true } }),
    answer: fields.text({ label: 'Answer', multiline: true, validation: { isRequired: true } }),
  }),
  {
    label: 'FAQs',
    description: 'Frequently asked questions shown on the page and in FAQ schema.',
    itemLabel: (props) => props.fields.question.value || 'New FAQ',
  }
);

const llmSEOFields = {
  aiSummary: fields.text({
    label: 'AI Summary',
    multiline: true,
    description: 'Plain-language summary used by AI assistants (ChatGPT, Perplexity, Claude) to describe this page. 2–4 sentences.',
  }),
  aiKeyTakeaways: fields.array(
    fields.text({ label: 'Takeaway' }),
    {
      label: 'AI Key Takeaways',
      description: '3–5 bullet points for AI citation and featured snippets.',
      itemLabel: (props) => props.value || 'Takeaway',
    }
  ),
  aiCitationText: fields.text({
    label: 'AI Citation Text',
    description: 'One sentence an AI should quote when citing this page. Include brand, price, and key fact.',
  }),
  targetLLMQuery: fields.text({
    label: 'Target LLM Query',
    description: 'The exact search/chat query this page should answer (e.g. "best offline budget planner no subscription").',
  }),
};

// ── Blog collection ────────────────────────────────────────────────────────────

const blog = collection({
  label: '📝 Blog Posts',
  slugField: 'title',
  path: 'src/content/blog/*',
  format: { contentField: 'content' },
  entryLayout: 'content',
  previewUrl: 'http://localhost:4321/blog/{slug}?preview=true',
  schema: {
    title: fields.slug({
      name: {
        label: 'Title',
        description: 'Post headline. Max 80 characters.',
        validation: { isRequired: true },
      },
    }),
    description: fields.text({
      label: 'Meta Description',
      multiline: true,
      description: 'Shown in search results. Max 200 characters.',
      validation: { isRequired: true, length: { max: 200 } },
    }),
    excerpt: fields.text({
      label: 'Excerpt',
      multiline: true,
      description: 'Short teaser shown in blog listings. Max 300 characters.',
    }),
    datePublished: fields.date({
      label: 'Published Date',
      validation: { isRequired: true },
      defaultValue: { kind: 'today' },
    }),
    dateModified: fields.date({ label: 'Last Modified Date' }),
    author: fields.text({
      label: 'Author',
      defaultValue: 'OwnitApps Editorial Team',
    }),
    category: fields.select({
      label: 'Category',
      options: [
        { label: 'Insights', value: 'Insights' },
        { label: 'Education', value: 'Education' },
        { label: 'Opinion', value: 'Opinion' },
        { label: 'Guides', value: 'Guides' },
        { label: 'Product', value: 'Product' },
        { label: 'News', value: 'News' },
      ],
      defaultValue: 'Insights',
    }),
    tags: fields.array(
      fields.text({ label: 'Tag' }),
      {
        label: 'Tags',
        description: 'SEO and filtering tags.',
        itemLabel: (props) => props.value || 'Tag',
      }
    ),
    featuredImage: fields.image({
      label: 'Featured Image',
      directory: 'public/images/blog',
      publicPath: '/images/blog/',
    }),
    featuredImageAlt: fields.text({ label: 'Featured Image Alt Text' }),
    draft: fields.checkbox({
      label: 'Draft (hidden from site)',
      defaultValue: false,
    }),
    tableOfContents: fields.checkbox({
      label: 'Show Table of Contents',
      defaultValue: true,
    }),
    relatedProducts: fields.array(
      fields.text({ label: 'Product Slug' }),
      {
        label: 'Related Products',
        description: 'Product slugs shown as CTAs at the end of the post.',
        itemLabel: (props) => props.value || 'Product',
      }
    ),
    faqs: faqFields,
    ...llmSEOFields,
    content: fields.mdx({ label: 'Content' }),
  },
});

// ── Products collection ────────────────────────────────────────────────────────

const products = collection({
  label: '📦 Products',
  slugField: 'name',
  path: 'src/content/products/*',
  format: { contentField: 'content' },
  entryLayout: 'content',
  previewUrl: 'http://localhost:4321/apps/{slug}?preview=true',
  schema: {
    name: fields.slug({
      name: {
        label: 'Product Name',
        description: 'The official product name (e.g. "Solo Finance").',
        validation: { isRequired: true },
      },
    }),
    tagline: fields.text({
      label: 'Tagline',
      description: 'One-line product tagline shown on cards and hero. Max 120 chars.',
      validation: { isRequired: true, length: { max: 120 } },
    }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      description: 'Product description used in meta and page intro.',
      validation: { isRequired: true },
    }),
    price: fields.number({
      label: 'Price (USD)',
      description: 'One-time purchase price. Leave blank for free.',
    }),
    currency: fields.text({
      label: 'Currency Code',
      defaultValue: 'USD',
    }),
    version: fields.text({ label: 'Current Version (e.g. 1.2.0)' }),
    status: fields.select({
      label: 'Status',
      options: [
        { label: '✅ Available', value: 'available' },
        { label: '⏳ Coming Soon', value: 'coming-soon' },
        { label: '🧪 Beta', value: 'beta' },
        { label: '🚫 Deprecated', value: 'deprecated' },
      ],
      defaultValue: 'coming-soon',
    }),
    category: fields.select({
      label: 'Category',
      options: [
        { label: 'Finance', value: 'Finance' },
        { label: 'Home', value: 'Home' },
        { label: 'Health', value: 'Health' },
        { label: 'Productivity', value: 'Productivity' },
        { label: 'Legal', value: 'Legal' },
        { label: 'Other', value: 'Other' },
      ],
      defaultValue: 'Finance',
    }),
    features: fields.array(
      fields.text({ label: 'Feature' }),
      {
        label: 'Features',
        description: 'Bullet-point features shown on the product page.',
        itemLabel: (props) => props.value || 'Feature',
      }
    ),
    buyUrl: fields.url({ label: 'Buy URL (Gumroad/Lemon Squeezy)' }),
    demoUrl: fields.url({ label: 'Demo URL' }),
    updateUrl: fields.url({ label: 'Update Download URL' }),
    changelog: fields.array(
      fields.object({
        version: fields.text({ label: 'Version', validation: { isRequired: true } }),
        date: fields.date({ label: 'Release Date', validation: { isRequired: true } }),
        notes: fields.array(
          fields.text({ label: 'Note' }),
          { label: 'Release Notes', itemLabel: (props) => props.value || 'Note' }
        ),
      }),
      {
        label: 'Changelog',
        description: 'Version history shown on the /updates page.',
        itemLabel: (props) => `v${props.fields.version.value || '?'}`,
      }
    ),
    faqs: faqFields,
    seoTitle: fields.text({
      label: 'SEO Title',
      description: 'Custom <title> tag. Max 60 characters.',
      validation: { length: { max: 60 } },
    }),
    seoDescription: fields.text({
      label: 'SEO Description',
      multiline: true,
      description: 'Custom meta description. Max 160 characters.',
      validation: { length: { max: 160 } },
    }),
    ...llmSEOFields,
    content: fields.mdx({ label: 'Product Page Content' }),
  },
});

// ── pSEO pages collection ──────────────────────────────────────────────────────

const pseo = collection({
  label: '🔍 pSEO Pages',
  slugField: 'title',
  path: 'src/content/pseo/*',
  format: { contentField: 'content' },
  entryLayout: 'content',
  previewUrl: 'http://localhost:4321/preview/pseo/{slug}?preview=true',
  schema: {
    title: fields.slug({
      name: {
        label: 'Page Title',
        validation: { isRequired: true },
      },
    }),
    pattern: fields.select({
      label: 'URL Pattern',
      description: 'Determines the URL prefix (e.g. /no-subscription/[slug]).',
      options: [
        { label: 'No Subscription', value: 'no-subscription' },
        { label: 'Alternative To', value: 'alternative' },
        { label: 'Comparison', value: 'comparison' },
        { label: 'Privacy-First', value: 'privacy-first' },
        { label: 'Offline Tools', value: 'offline-tools' },
        { label: 'Problem', value: 'problem' },
        { label: 'Solution', value: 'solution' },
        { label: 'Use Case', value: 'use-case' },
        { label: 'Buy-Once', value: 'buy-once' },
        { label: 'Best', value: 'best' },
      ],
      defaultValue: 'no-subscription',
    }),
    description: fields.text({
      label: 'Description',
      multiline: true,
      description: 'Used in meta description. Max 200 characters.',
      validation: { isRequired: true, length: { max: 200 } },
    }),
    targetKeyword: fields.text({
      label: 'Target Keyword',
      description: 'Primary keyword this page targets (e.g. "offline debt tracker").',
      validation: { isRequired: true },
    }),
    searchIntent: fields.select({
      label: 'Search Intent',
      options: [
        { label: 'Informational', value: 'informational' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Transactional', value: 'transactional' },
        { label: 'Navigational', value: 'navigational' },
      ],
      defaultValue: 'commercial',
    }),
    answerBox: fields.text({
      label: 'Answer Box',
      multiline: true,
      description: 'Direct answer shown at the top of the page. Targets featured snippets.',
    }),
    keyTakeaways: fields.array(
      fields.text({ label: 'Takeaway' }),
      {
        label: 'Key Takeaways',
        description: '3–5 bullet points shown after the answer box.',
        itemLabel: (props) => props.value || 'Takeaway',
      }
    ),
    relatedProducts: fields.array(
      fields.text({ label: 'Product Slug' }),
      {
        label: 'Related Products',
        description: 'Product slugs to feature as CTAs.',
        itemLabel: (props) => props.value || 'Product',
      }
    ),
    faqs: faqFields,
    draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
    publishedDate: fields.text({ label: 'Published Date (YYYY-MM-DD)' }),
    updatedDate: fields.text({ label: 'Updated Date (YYYY-MM-DD)' }),
    seoTitle: fields.text({
      label: 'SEO Title Override',
      validation: { length: { max: 60 } },
    }),
    seoDescription: fields.text({
      label: 'SEO Description Override',
      multiline: true,
      validation: { length: { max: 160 } },
    }),
    ...llmSEOFields,
    content: fields.mdx({ label: 'Page Content' }),
  },
});

// ── Glossary collection ────────────────────────────────────────────────────────

const glossary = collection({
  label: '📖 Glossary',
  slugField: 'term',
  path: 'src/content/glossary/*',
  format: { contentField: 'content' },
  entryLayout: 'content',
  previewUrl: 'http://localhost:4321/glossary/{slug}?preview=true',
  schema: {
    term: fields.slug({
      name: {
        label: 'Term',
        description: 'The glossary term (e.g. "Offline-First Apps").',
        validation: { isRequired: true },
      },
    }),
    definition: fields.text({
      label: 'Definition',
      multiline: true,
      description: 'Technical definition of the term.',
      validation: { isRequired: true },
    }),
    plainEnglishDefinition: fields.text({
      label: 'Plain English Definition',
      multiline: true,
      description: 'Simple, jargon-free explanation. Shown prominently on the page.',
    }),
    whyItMatters: fields.text({
      label: 'Why It Matters',
      multiline: true,
      description: 'Why this concept is important for OwnitApps users.',
    }),
    relatedTerms: fields.array(
      fields.text({ label: 'Term Slug' }),
      {
        label: 'Related Terms',
        description: 'Slugs of related glossary entries.',
        itemLabel: (props) => props.value || 'Term',
      }
    ),
    relatedProducts: fields.array(
      fields.text({ label: 'Product Slug' }),
      {
        label: 'Related Products',
        itemLabel: (props) => props.value || 'Product',
      }
    ),
    faqs: faqFields,
    seoTitle: fields.text({
      label: 'SEO Title',
      validation: { length: { max: 60 } },
    }),
    seoDescription: fields.text({
      label: 'SEO Description',
      multiline: true,
      validation: { length: { max: 160 } },
    }),
    aiSummary: fields.text({ label: 'AI Summary', multiline: true }),
    aiCitationText: fields.text({ label: 'AI Citation Text' }),
    content: fields.mdx({ label: 'Full Definition Content' }),
  },
});

// ── Legal collection ───────────────────────────────────────────────────────────

const legal = collection({
  label: '⚖️ Legal Pages',
  slugField: 'title',
  path: 'src/content/legal/*',
  format: { contentField: 'content' },
  entryLayout: 'content',
  previewUrl: 'http://localhost:4321/legal/{slug}?preview=true',
  schema: {
    title: fields.slug({
      name: {
        label: 'Page Title',
        description: 'e.g. "Privacy Policy"',
        validation: { isRequired: true },
      },
    }),
    description: fields.text({ label: 'Meta Description', multiline: true }),
    dateEffective: fields.date({
      label: 'Effective Date',
      validation: { isRequired: true },
    }),
    dateModified: fields.date({ label: 'Last Modified Date' }),
    noindex: fields.checkbox({
      label: 'No-index (hide from search engines)',
      defaultValue: true,
    }),
    content: fields.mdx({ label: 'Content' }),
  },
});

// ── Export config ─────────────────────────────────────────────────────────────

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: {
      name: 'OwnitApps CMS',
    },
    navigation: {
      Content: ['blog', 'products', 'pseo', 'glossary'],
      Legal: ['legal'],
    },
  },
  collections: {
    blog,
    products,
    pseo,
    glossary,
    legal,
  },
});
