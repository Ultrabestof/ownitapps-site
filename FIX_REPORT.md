# OwnitApps Site Fix Report

Fixed package: `ownitapps-site-fixed.zip`

## Build status

✅ `npm run build` completed successfully.
✅ 84 static pages generated.
✅ Broken internal link scan returned 0 missing internal routes.

## Major fixes applied

1. Switched Astro from hybrid/server output to static output for pSEO-first publishing.
2. Removed the Node adapter from active Astro config.
3. Removed active Keystatic integration from the static production build because Keystatic API routes require server/hybrid output.
4. Kept Keystatic config files for future CMS/backend reactivation.
5. Fixed Tailwind ESM config by replacing `require('@tailwindcss/typography')` with an ESM import.
6. Removed remote Google Fonts from `BaseLayout.astro` to respect the OwnitApps no-remote-font rule.
7. Updated typography tokens to safe system fallbacks.
8. Replaced `font-display` with the defined `font-heading` class.
9. Replaced `var(--gold-400)` usage with `var(--gold)` and added a compatibility alias.
10. Added compatibility utilities for custom opacity classes such as `bg-white/2`, `bg-white/3`, `bg-white/4`, and `border-white/8`.
11. Fixed sitemap pSEO pattern mapping for `alternative`, `comparison`, `problem`, `use-case`, `local-first`, and `solution` patterns.
12. Added missing public routes: `/about`, `/resources`, `/start-here`, `/update`, `/updates`, `/privacy`, `/terms`.
13. Added missing source-of-truth pages: `/privacy-first-tools`, `/buy-once-apps`, `/local-data-tools`, `/html-apps-that-work-offline`.
14. Added missing pSEO hub pages: `/compare`, `/alternatives`, `/no-subscription`, `/offline-tools`, `/privacy-first`, `/use-cases`, `/buy-once`, `/local-first`, `/best`, `/solutions`, `/problems`.
15. Added missing admin routes: `/admin/dashboard`, `/admin/categories`, `/admin/import-export`, `/admin/media`, `/admin/settings`.
16. Added `/rss.xml`.
17. Added required public assets: favicon SVG/PNGs, Apple touch icon, logo SVG, site manifest, default OG image.
18. Added missing glossary terms: HTML apps, private by default, data ownership, browser-based apps, perpetual license.
19. Added pSEO sample content for `/use-cases/manage-family-documents-offline` and `/local-first/local-first-personal-dashboard`.
20. Added singular compatibility redirects for `/problem/[slug]` and `/use-case/[slug]`.
21. Fixed homepage broken product/blog slugs.
22. Softened unsupported subscription-spending claims to safer wording.
23. Removed all `ownitapps.com/update-os` references.
24. Normalized many public light-mode classes for better visual consistency.
25. Fixed static preview pSEO route so it no longer blocks static builds.

## Notes

- The production build is static-first.
- Keystatic is not active in `astro.config.mjs` because the static deployment target cannot generate Keystatic API routes.
- To use Keystatic later, re-enable the integration and switch to server/hybrid deployment, or keep it as a separate editing environment.
