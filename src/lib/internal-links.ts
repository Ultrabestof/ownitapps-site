/**
 * OwnitApps Internal Linking Utility
 * Orphan detection, anchor text suggestions, link graph analysis
 */

export interface LinkNode {
  slug: string;
  url: string;
  title: string;
  type: 'blog' | 'product' | 'pseo' | 'glossary' | 'static';
  category?: string;
  tags?: string[];
  relatedProducts?: string[];
  relatedPosts?: string[];
  relatedTerms?: string[];
}

export interface LinkSuggestion {
  fromUrl: string;
  fromTitle: string;
  toUrl: string;
  toTitle: string;
  anchorText: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OrphanPage {
  url: string;
  title: string;
  type: string;
  inboundLinks: number;
  outboundLinks: number;
}

export interface LinkAuditResult {
  totalPages: number;
  orphanPages: OrphanPage[];
  wellLinkedPages: LinkNode[];
  suggestions: LinkSuggestion[];
  linkGraph: Map<string, Set<string>>;
  inboundCounts: Map<string, number>;
  score: number;
  issues: string[];
}

// ─── Anchor text keyword map for OwnitApps entities ───────────────────────────

const PRODUCT_ANCHORS: Record<string, string[]> = {
  'solo-finance': [
    'Solo Finance',
    'offline freelancer tax ledger',
    'no-subscription invoice tracker',
    'buy-once tax-ready ledger',
    'local-first freelancer finance tool',
  ],
  'budget-by-paycheck-os': [
    'Budget by Paycheck OS',
    'offline paycheck budget planner',
    'no-subscription paycheck organizer',
    'buy-once budget tool',
    'local-first paycheck tracker',
  ],
  'home-admin-binder-os': [
    'Home Admin Binder OS',
    'offline home admin binder',
    'no-subscription home organizer',
    'local-first household records tool',
    'buy-once home management binder',
  ],
  'debt-escape-os': [
    'Debt Escape OS',
    'offline debt tracker',
    'no-subscription debt payoff planner',
    'local-first debt snowball tool',
    'buy-once debt elimination planner',
  ],
  'medical-binder-os': [
    'Medical Binder OS',
    'offline family health vault',
    'no-subscription medical records organizer',
    'local-first health binder',
    'buy-once family medical tracker',
  ],
};

const GLOSSARY_ANCHORS: Record<string, string[]> = {
  'offline-first-apps': ['offline-first apps', 'offline-first software', 'apps that work offline'],
  'local-first-software': ['local-first software', 'local-first apps', 'local data software'],
  'no-subscription-software': ['no-subscription software', 'subscription-free apps', 'one-time purchase tools'],
  'buy-once-software': ['buy-once software', 'buy once use forever apps', 'one-time purchase software'],
  'private-by-default': ['private by default', 'privacy-first design', 'privacy-first software'],
  'data-ownership': ['data ownership', 'own your data', 'local data control'],
  'html-apps': ['HTML apps', 'browser-based HTML tools', 'offline HTML utilities'],
};

// ─── Preferred anchor text for pages ──────────────────────────────────────────

export function getPreferredAnchor(slug: string, type: 'product' | 'glossary' | 'blog'): string {
  if (type === 'product' && PRODUCT_ANCHORS[slug]?.[0]) {
    return PRODUCT_ANCHORS[slug]![0]!;
  }
  if (type === 'glossary' && GLOSSARY_ANCHORS[slug]?.[0]) {
    return GLOSSARY_ANCHORS[slug]![0]!;
  }
  // Fallback: humanize slug
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getAnchorVariants(slug: string, type: 'product' | 'glossary'): string[] {
  if (type === 'product' && PRODUCT_ANCHORS[slug]) return PRODUCT_ANCHORS[slug];
  if (type === 'glossary' && GLOSSARY_ANCHORS[slug]) return GLOSSARY_ANCHORS[slug];
  return [getPreferredAnchor(slug, type)];
}

// ─── Build link graph from content nodes ──────────────────────────────────────

export function buildLinkGraph(nodes: LinkNode[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  for (const node of nodes) {
    if (!graph.has(node.url)) graph.set(node.url, new Set());

    // Add edges from explicit related fields
    const related = [
      ...(node.relatedProducts?.map((s) => `/apps/${s}`) ?? []),
      ...(node.relatedPosts?.map((s) => `/blog/${s}`) ?? []),
      ...(node.relatedTerms?.map((s) => `/glossary/${s}`) ?? []),
    ];

    for (const target of related) {
      graph.get(node.url)!.add(target);
    }
  }

  return graph;
}

// ─── Count inbound links ───────────────────────────────────────────────────────

export function buildInboundCounts(graph: Map<string, Set<string>>): Map<string, number> {
  const counts = new Map<string, number>();

  for (const [, targets] of graph) {
    for (const target of targets) {
      counts.set(target, (counts.get(target) ?? 0) + 1);
    }
  }

  return counts;
}

// ─── Detect orphan pages ──────────────────────────────────────────────────────

export function detectOrphans(
  nodes: LinkNode[],
  inboundCounts: Map<string, number>,
  graph: Map<string, Set<string>>,
  minInbound = 1
): OrphanPage[] {
  const orphans: OrphanPage[] = [];

  for (const node of nodes) {
    const inbound = inboundCounts.get(node.url) ?? 0;
    const outbound = graph.get(node.url)?.size ?? 0;

    if (inbound < minInbound) {
      orphans.push({
        url: node.url,
        title: node.title,
        type: node.type,
        inboundLinks: inbound,
        outboundLinks: outbound,
      });
    }
  }

  return orphans.sort((a, b) => a.inboundLinks - b.inboundLinks);
}

// ─── Generate link suggestions ─────────────────────────────────────────────────

export function generateSuggestions(
  nodes: LinkNode[],
  inboundCounts: Map<string, number>
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.url, n]));

  for (const source of nodes) {
    // Blog → Product suggestions
    if (source.type === 'blog' && source.tags) {
      for (const node of nodes) {
        if (node.type !== 'product') continue;
        const productSlug = node.slug;

        // Topic overlap heuristic
        const overlap = source.tags.some(
          (tag) =>
            productSlug.includes(tag.toLowerCase().replace(/\s/g, '-')) ||
            tag.toLowerCase().includes('budget') ||
            tag.toLowerCase().includes('finance') ||
            tag.toLowerCase().includes('offline')
        );

        if (overlap) {
          suggestions.push({
            fromUrl: source.url,
            fromTitle: source.title,
            toUrl: node.url,
            toTitle: node.title,
            anchorText: getPreferredAnchor(productSlug, 'product'),
            reason: 'Blog post topic overlaps with product category',
            priority: 'high',
          });
        }
      }
    }

    // Product → Glossary suggestions (all products should link core glossary terms)
    if (source.type === 'product') {
      const coreTerms = ['offline-first-apps', 'no-subscription-software', 'buy-once-software', 'data-ownership'];
      for (const term of coreTerms) {
        const termUrl = `/glossary/${term}`;
        if (nodeMap.has(termUrl)) {
          const target = nodeMap.get(termUrl)!;
          suggestions.push({
            fromUrl: source.url,
            fromTitle: source.title,
            toUrl: termUrl,
            toTitle: target.title,
            anchorText: getPreferredAnchor(term, 'glossary'),
            reason: 'Product pages should link core philosophy glossary terms',
            priority: 'medium',
          });
        }
      }
    }

    // pSEO → Product suggestions (high priority — these are commercial pages)
    if (source.type === 'pseo') {
      for (const node of nodes) {
        if (node.type !== 'product') continue;
        suggestions.push({
          fromUrl: source.url,
          fromTitle: source.title,
          toUrl: node.url,
          toTitle: node.title,
          anchorText: getPreferredAnchor(node.slug, 'product'),
          reason: 'pSEO pages should always link to relevant product pages',
          priority: 'high',
        });
      }
    }

    // Low-inbound pages get extra suggestions (boost orphans)
    const inbound = inboundCounts.get(source.url) ?? 0;
    if (inbound === 0 && source.type !== 'static') {
      for (const node of nodes) {
        if (node.url === source.url) continue;
        if (node.type === 'static') continue;
        suggestions.push({
          fromUrl: node.url,
          fromTitle: node.title,
          toUrl: source.url,
          toTitle: source.title,
          anchorText: getPreferredAnchor(source.slug, source.type as 'product' | 'glossary'),
          reason: 'Page has zero inbound links — needs at least one link from relevant content',
          priority: 'high',
        });
        break; // One suggestion per orphan to avoid flooding
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return suggestions.filter((s) => {
    const key = `${s.fromUrl}→${s.toUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Full audit ───────────────────────────────────────────────────────────────

export function auditInternalLinks(nodes: LinkNode[]): LinkAuditResult {
  const linkGraph = buildLinkGraph(nodes);
  const inboundCounts = buildInboundCounts(linkGraph);
  const orphanPages = detectOrphans(nodes, inboundCounts, linkGraph);
  const suggestions = generateSuggestions(nodes, inboundCounts);

  const wellLinkedPages = nodes.filter((n) => (inboundCounts.get(n.url) ?? 0) >= 2);

  const issues: string[] = [];
  if (orphanPages.length > 0) {
    issues.push(`${orphanPages.length} page(s) have zero inbound internal links (orphan pages).`);
  }
  const highPriority = suggestions.filter((s) => s.priority === 'high');
  if (highPriority.length > 0) {
    issues.push(`${highPriority.length} high-priority internal link opportunity/opportunities detected.`);
  }

  // Score: 100 minus penalties
  const orphanPenalty = Math.min(orphanPages.length * 5, 40);
  const suggestionPenalty = Math.min(highPriority.length * 2, 20);
  const score = Math.max(0, 100 - orphanPenalty - suggestionPenalty);

  return {
    totalPages: nodes.length,
    orphanPages,
    wellLinkedPages,
    suggestions,
    linkGraph,
    inboundCounts,
    score,
    issues,
  };
}

// ─── Vague anchor detector ────────────────────────────────────────────────────

const VAGUE_ANCHORS = [
  'click here',
  'read more',
  'learn more',
  'here',
  'this page',
  'this post',
  'this article',
  'link',
  'page',
  'more',
];

export function isVagueAnchor(text: string): boolean {
  return VAGUE_ANCHORS.includes(text.toLowerCase().trim());
}

export function findVagueAnchors(htmlContent: string): string[] {
  const matches: string[] = [];
  const anchorRegex = /<a[^>]*>([^<]+)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(htmlContent)) !== null) {
    const text = match[1];
    if (text && isVagueAnchor(text)) {
      matches.push(text);
    }
  }
  return matches;
}
