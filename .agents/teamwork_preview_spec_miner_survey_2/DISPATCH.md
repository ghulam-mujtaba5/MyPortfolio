## 2026-08-23T01:22:23+05:00

Survey and extract all specifications and existing implementations for:
1. Structured Data & Schema.org JSON-LD:
   - Identify all current JSON-LD scripts and schema components across all 8 routes (`/`, `/about`, `/projects`, `/services`, `/insights`, `/contact`, `/uses`, `/privacy-policy`).
   - Audit required schemas: `Person`, `ProfilePage`, `WebSite`, `ItemList`, `CreativeWork`/`Project`, `Service`, `FAQPage`, `BreadcrumbList`, and `SameAs` entity linkages.
   - Detect missing fields, broken entity relationships, schema syntax errors, or GSC Rich Results gaps.
2. AI Search & Crawler Assets:
   - Inspect `public/robots.txt`, `public/llms.txt`, `public/llms-full.txt`.
   - Inspect dynamic & static sitemaps (`pages/sitemap.xml.js`, `next-sitemap-config.js` or related).
   - Evaluate whether all public routes are accurately represented, whether crawler permissions are optimal, and whether AI summary files capture the full entity and tech stack profile.
