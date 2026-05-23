// src/pages/llms.txt.ts
// /llms.txt — Helps AI answer engines understand and cite OwnitApps correctly
// Based on the llms.txt standard for AI crawler guidance

import type { APIRoute } from 'astro';
import { generateLLMsTxt } from '../lib/llm-seo';

export const GET: APIRoute = () => {
  const content = generateLLMsTxt();

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
