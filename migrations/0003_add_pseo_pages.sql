CREATE TABLE IF NOT EXISTS pseo_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published','archived')),
  pattern TEXT NOT NULL,
  target_keyword TEXT,
  search_intent TEXT,
  intro TEXT,
  content_markdown TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical TEXT,
  og_image TEXT,
  related_products_json TEXT DEFAULT '[]',
  faqs_json TEXT DEFAULT '[]',
  ai_summary TEXT,
  ai_citation_text TEXT,
  published_at TEXT,
  modified_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pseo_status ON pseo_pages(status);
CREATE INDEX IF NOT EXISTS idx_pseo_slug ON pseo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_pseo_pattern ON pseo_pages(pattern);
CREATE INDEX IF NOT EXISTS idx_pseo_keyword ON pseo_pages(target_keyword);
