# BRIEFING — 2026-08-23T01:26:25+05:00

## Mission
Survey and extract all specifications, schemas, JSON-LD, entity graphs, AI search files (llms.txt, llms-full.txt), robots.txt, sitemaps, and crawler assets across all 8 routes of MyPortfolio.

## 🔒 My Identity
- Archetype: teamwork_preview_spec_miner_survey_2
- Roles: Specification Miner, SEO & Schema Auditor, Crawler & AI Search Specialist
- Working directory: e:\MyPortfolio\.agents\teamwork_preview_spec_miner_survey_2
- Original parent: abd5279d-d279-443c-a579-578cad0ad456
- Milestone: Survey & Specification Extraction (Schemas & Crawlers)

## 🔒 Key Constraints
- Read-only investigation: do NOT implement changes to project codebase.
- Audit all 8 routes: `/`, `/about`, `/projects`, `/services`, `/insights`, `/contact`, `/uses`, `/privacy-policy`.
- Deep audit of JSON-LD Schema.org (`Person`, `ProfilePage`, `WebSite`, `ItemList`, `CreativeWork`/`Project`, `Service`, `FAQPage`, `BreadcrumbList`, `SameAs`).
- Audit AI Search and crawler files (`robots.txt`, `llms.txt`, `llms-full.txt`, sitemaps).
- Output comprehensive findings to `survey_schemas_crawlers.md` and `handoff.md`.

## Current Parent
- Conversation ID: abd5279d-d279-443c-a579-578cad0ad456
- Updated: 2026-08-23T01:26:25+05:00

## Task Summary
- **What to build**: Comprehensive survey and specification document for structured data, JSON-LD, sitemaps, robots.txt, and AI crawler assets.
- **Success criteria**: Exhaustive mapping of all existing schema structures, missing fields, schema validation issues, crawler configurations, and AI context definitions.
- **Interface contracts**: Output formatted markdown tables and actionable spec guidelines.
- **Code layout**: Read from `e:\MyPortfolio\pages`, `e:\MyPortfolio\public`, `e:\MyPortfolio\components`, etc.

## Key Decisions & Findings Made
- Audited all 8 routes and secondary routes (`/resume`, `/search`, `/[slug]`).
- Identified missing routes in `pages/sitemap.xml.js` (`/services`, `/contact`, `/uses`).
- Identified route drift in `navigationSchema()` (`/articles` -> `/insights`).
- Identified service catalog drift on `/services` (3 schema services vs 4 UI services).
- Identified outdated links in `public/llms.txt` and `public/llms-full.txt`.
- Documented full discovery matrix and edge cases in `survey_schemas_crawlers.md`.

## Artifact Index
- `survey_schemas_crawlers.md` — Complete audit report and schema/crawler specifications
- `handoff.md` — 5-component handoff report for parent orchestrator
- `progress.md` — Liveness and step tracking
