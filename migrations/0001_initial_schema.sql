-- OwnitApps Cloudflare D1 initial CMS schema
-- Run with: npx.cmd wrangler d1 migrations apply ownitapps_db --remote

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published','archived')),
  excerpt TEXT,
  content_markdown TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  canonical TEXT,
  og_image TEXT,
  category TEXT,
  tags_json TEXT DEFAULT '[]',
  faqs_json TEXT DEFAULT '[]',
  ai_summary TEXT,
  ai_citation_text TEXT,
  published_at TEXT,
  modified_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published','archived','coming-soon')),
  category TEXT,
  price TEXT,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  content_markdown TEXT,
  features_json TEXT DEFAULT '[]',
  screenshots_json TEXT DEFAULT '[]',
  buy_url TEXT,
  demo_url TEXT,
  update_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  faqs_json TEXT DEFAULT '[]',
  ai_summary TEXT,
  ai_citation_text TEXT,
  published_at TEXT,
  modified_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  mime_type TEXT,
  size INTEGER,
  r2_key TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_r2_key ON media(r2_key);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seo_audits (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  seo_score INTEGER DEFAULT 0,
  llm_score INTEGER DEFAULT 0,
  issues_json TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO settings(key, value) VALUES
('site_name', 'OwnitApps'),
('site_url', 'https://ownitapps.com'),
('updates_url', 'https://ownitapps.com/update'),
('brand_promise', 'Your OS. Your Data. Your Rules.');
