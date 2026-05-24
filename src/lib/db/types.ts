export type ContentStatus = 'draft' | 'published';

export interface D1Post {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  excerpt?: string | null;
  content_markdown: string;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical?: string | null;
  og_image?: string | null;
  category?: string | null;
  tags_json?: string | null;
  faqs_json?: string | null;
  ai_summary?: string | null;
  ai_citation_text?: string | null;
  published_at?: string | null;
  modified_at?: string | null;
  created_at?: string | null;
}

export interface D1Product {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  status: ContentStatus;
  category?: string | null;
  price?: string | null;
  currency?: string | null;
  description?: string | null;
  content_markdown?: string | null;
  features_json?: string | null;
  screenshots_json?: string | null;
  buy_url?: string | null;
  demo_url?: string | null;
  update_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  faqs_json?: string | null;
  ai_summary?: string | null;
  ai_citation_text?: string | null;
  published_at?: string | null;
  modified_at?: string | null;
  created_at?: string | null;
}

export interface D1Media {
  id: string;
  filename: string;
  url: string;
  alt?: string | null;
  mime_type?: string | null;
  size?: number | null;
  r2_key?: string | null;
  created_at?: string | null;
}
