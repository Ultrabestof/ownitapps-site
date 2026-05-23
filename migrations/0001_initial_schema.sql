CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  excerpt TEXT,
  content_markdown TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  canonical TEXT,
  og_image TEXT,
  category TEXT,
  tags_json TEXT,
  faqs_json TEXT,
  ai_summary TEXT,
  ai_citation_text TEXT,
  published_at TEXT,
  modified_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  category TEXT,
  price TEXT,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  content_markdown TEXT,
  features_json TEXT,
  screenshots_json TEXT,
  buy_url TEXT,
  demo_url TEXT,
  update_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  faqs_json TEXT,
  ai_summary TEXT,
  ai_citation_text TEXT,
  published_at TEXT,
  modified_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  mime_type TEXT,
  size INTEGER,
  r2_key TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
