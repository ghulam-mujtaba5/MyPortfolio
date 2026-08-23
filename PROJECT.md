# Project: Portfolio SEO, GEO, AIO, Usability, Schema & Performance Optimization

## Architecture & Scope
- **Framework**: Next.js 16 (Pages Router) + React 19 + Tailwind CSS + Sharp
- **Primary Domain**: `https://ghulammujtaba.com`
- **Canonical Routes (8 public routes - STRICTLY NO NEW ROUTES)**:
  1. `/` (served via `pages/portfolio/index.js`)
  2. `/about` (`pages/about.js`)
  3. `/projects` (`pages/projects.js` & `pages/projects/[slug].js`)
  4. `/services` (`pages/services.js`)
  5. `/insights` (`pages/insights/index.js` & `pages/insights/[slug].js`)
  6. `/contact` (`pages/contact.js`)
  7. `/uses` (`pages/uses.js`)
  8. `/privacy-policy` (`pages/privacy-policy.js`)
- **Shared Components**:
  - `components/SEO.js` — Centralized Schema.org JSON-LD & OpenGraph metadata builder
  - `components/NavBar_Desktop/nav-bar.js` — Main desktop navigation bar
  - `components/NavBar_Mobile/nav-bar.js` — Mobile navigation menu
  - `components/OptimizedImage/OptimizedImage.js` — Core image component
  - `components/Projects/Project1.js` — Projects showcase component

---

## Feature Inventory
| # | Feature / Requirement | Description | Milestone | Source |
|---|------------------------|-------------|-----------|--------|
| 1 | On-Page Metadata & Snippet Calibration | Fix Homepage title (<60 chars) & description (120-160 chars), Privacy Policy description (120-160 chars), verify all 8 routes | M1 | R1, R2 |
| 2 | Heading & Semantic Tag Auditing | Verify single `<h1>` hierarchy, accessible labels, and descriptive `alt` tags across all 8 routes | M1 | R1, R2 |
| 3 | Navigation Schema Correction | Update `navigationSchema()` in `components/SEO.js`: fix `/articles` -> `/insights` and `/#contact-section` -> `/contact` | M2 | R3 |
| 4 | OfferCatalog & Services Schema Alignment | Harmonize `professionalServiceSchema()` with the 4 actual services on `/services` | M2 | R3 |
| 5 | Route Schema Enrichment | Add structured `WebPage` schemas to `/uses` and `/privacy-policy` | M2 | R3 |
| 6 | Dynamic Sitemap Completeness | Add `/services`, `/uses`, and `/contact` to `STATIC_PAGES` in `pages/sitemap.xml.js` | M3 | R4 |
| 7 | AI Search Assets Synchronization | Update `public/llms.txt` and `public/llms-full.txt` (fix `/articles` -> `/insights`, `campusaxis.com` -> `campusaxis.pk`, add missing routes) | M3 | R4 |
| 8 | Crawler Permissions & Robots Directives | Verify `public/robots.txt` directives for AI bots and sitemap index pointer | M3 | R4 |
| 9 | Navigation Usability & Link Semantics | Convert `<button onClick={...}>` to accessible `<Link href="...">` in `nav-bar.js` | M4 | R5 |
| 10 | SSR Navigation Inclusion | Remove `{ ssr: false }` dynamic imports on `/services.js` and `/uses.js` for full SSR HTML navigation | M4 | R5 |
| 11 | Image Optimization & AVIF/WebP Conversion | Remove forced `unoptimized: true` on permitted domains in `OptimizedImage.js` and `Project1.js` | M4 | R5 |
| 12 | Comprehensive E2E Verification & Build Validation | Run test suite (Tiers 1-5), verify `npm run build` with 0 errors, full forensic audit | M5 | Acceptance Criteria |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | On-Page Metadata & Entity Calibration | Fix titles & descriptions to strict snippet bounds, verify headings & alts across 8 routes | Survey | PLANNED |
| M2 | Schema.org Structured Data & JSON-LD | Fix `navigationSchema`, align `professionalServiceSchema`, enrich `/uses` and `/privacy-policy` | M1 | PLANNED |
| M3 | AI Search Assets & Sitemap Sync | Update `pages/sitemap.xml.js`, `public/llms.txt`, `public/llms-full.txt`, verify `robots.txt` | M1, M2 | PLANNED |
| M4 | Usability, SSR Navigation & Image Optimization | Convert navbar buttons to `<Link>`, fix SSR navbar in `services.js`/`uses.js`, unblock Next.js image optimization | M1, M2, M3 | PLANNED |
| M5 | E2E Testing, Adversarial Hardening & Build Gate | Execute full test suite (Tiers 1-5), run `next build`, independent review and forensic integrity audit | M1-M4 | PLANNED |

---

## Interface Contracts & Code Layout
### Code Layout
- `pages/portfolio/index.js` — Homepage metadata (`<SEO>`)
- `pages/privacy-policy.js` — Privacy Policy metadata
- `components/SEO.js` — Schema.org builders (`navigationSchema`, `professionalServiceSchema`, `personSchema`, `webPageSchema`)
- `pages/sitemap.xml.js` — Dynamic sitemap generator (`STATIC_PAGES`)
- `public/llms.txt` & `public/llms-full.txt` — AI crawler context files
- `components/NavBar_Desktop/nav-bar.js` — Desktop navigation links
- `pages/services.js` & `pages/uses.js` — SSR navigation imports
- `components/OptimizedImage/OptimizedImage.js` & `components/Projects/Project1.js` — Image optimization logic
- `test/` or `scripts/` — Automated E2E verification test harness
