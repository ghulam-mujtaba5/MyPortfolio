# TEST_READY — Portfolio SEO, GEO, AIO, Usability & Performance Test Suite

## Executive Summary
An automated, requirement-driven, deterministic E2E verification test suite has been established at `scripts/verify-seo-performance.js`. It validates all SEO, Generative Engine Optimization (GEO), AI Search (AIO), Usability, Schema.org Structured Data, and Performance requirements across all 8 canonical routes without requiring live external network dependencies or browser orchestration.

---

## Test Execution Guide

### Runner Command
```bash
# Run complete test suite (Tiers 1 - 4)
node scripts/verify-seo-performance.js

# Run specific tier
node scripts/verify-seo-performance.js --tier=1
node scripts/verify-seo-performance.js --tier=2
node scripts/verify-seo-performance.js --tier=3
node scripts/verify-seo-performance.js --tier=4

# Machine-readable JSON output for CI / agent orchestration
node scripts/verify-seo-performance.js --json
```

---

## 4-Tier Test Architecture & Matrix

| Tier | Name | Scope & Authority | Total Tests | Baseline Passed | Baseline Failed | Pass Rate |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Tier 1** | **Feature Coverage** | Metadata presence across 8 routes, OpenGraph tags, Twitter Card tags, JSON-LD Schema builders in `components/SEO.js`, robots.txt permissions & sitemap pointers, `llms.txt`/`llms-full.txt` discovery, desktop navbar semantic links. | **58** | **57** | **1** | 98% |
| **Tier 2** | **Boundary & Corner Cases** | Strict Title character bounds ($\le 60$), Meta Description bounds ($120 - 160$), JSON-LD syntax & `@context` integrity, zero broken links/redirects in schemas, single `<h1>` hierarchy, Next.js redirect safety, Image optimization unoptimized flags. | **29** | **21** | **8** | 72% |
| **Tier 3** | **Cross-Feature Consistency** | Sitemap `STATIC_PAGES` parity with 8 canonical routes, `navigationSchema` live endpoint parity, `llms.txt`/`llms-full.txt` link consistency, `professionalServiceSchema` OfferCatalog 4-service parity, SSR navigation inclusion. | **23** | **7** | **16** | 30% |
| **Tier 4** | **Real-World Crawler Scenario** | End-to-end 6-phase simulation of an AI search engine crawler indexing the site (robots check, sitemap harvest, context ingestion, route DOM crawl, Knowledge Graph `@id` resolution, SSR hydration check). | **6** | **4** | **2** | 67% |
| **TOTAL** | **Full E2E Suite** | **All 8 Canonical Routes & Supporting Infrastructure** | **116** | **89** | **27** | **77%** |

---

## Canonical Routes in Scope
The test suite strictly enforces the 8 public canonical routes (zero superfluous routes):
1. `/` (`pages/portfolio/index.js` + `components/welcome/welcome.js`)
2. `/about` (`pages/about.js`)
3. `/projects` (`pages/projects.js`)
4. `/services` (`pages/services.js`)
5. `/insights` (`pages/insights/index.js`)
6. `/contact` (`pages/contact.js`)
7. `/uses` (`pages/uses.js`)
8. `/privacy-policy` (`pages/privacy-policy.js`)

---

## Discovered Baseline Defects & Milestone Escalation Matrix

The 27 failing assertions precisely delineate the implementation tasks scheduled for Milestones M1 through M4:

### 1. Milestone M1: On-Page Metadata & Snippet Bounds
- **Defect #1**: Route `/` title is 65 characters (exceeds 60-char maximum).
- **Defect #2**: Route `/contact` title is 61 characters (exceeds 60-char maximum).
- **Defect #3**: Route `/` description is 187 characters (exceeds 160-char maximum).
- **Defect #4**: Route `/privacy-policy` description is 111 characters (under 120-char minimum).

### 2. Milestone M2: Schema.org Structured Data & JSON-LD
- **Defect #5**: `navigationSchema()` contains stale `/articles` redirect target instead of canonical `/insights`.
- **Defect #6**: `navigationSchema()` contains anchor target `/#contact-section` instead of canonical `/contact`.
- **Defect #7**: `navigationSchema()` lacks explicit canonical endpoints for `/insights` and `/contact`.
- **Defect #8**: `professionalServiceSchema()` contains only 3 services in `CORE_SERVICES` rather than the 4 services defined on `/services`.

### 3. Milestone M3: AI Search Assets & Sitemap Completeness
- **Defect #9**: `pages/sitemap.xml.js` `STATIC_PAGES` is missing `/services`.
- **Defect #10**: `pages/sitemap.xml.js` `STATIC_PAGES` is missing `/contact`.
- **Defect #11**: `pages/sitemap.xml.js` `STATIC_PAGES` is missing `/uses`.
- **Defect #12**: `public/llms.txt` references legacy `/articles` instead of `/insights`.
- **Defect #13**: `public/llms.txt` references non-canonical domain `campusaxis.com` instead of `campusaxis.pk`.
- **Defect #14**: `public/llms.txt` lacks `/services` and `/uses` in site structure.
- **Defect #15**: `public/llms-full.txt` references legacy `/articles` instead of `/insights`.
- **Defect #16**: `public/llms-full.txt` references non-canonical domain `campusaxis.com` instead of `campusaxis.pk`.

### 4. Milestone M4: Usability, SSR Navigation & Image Optimization
- **Defect #17**: `components/NavBar_Desktop/nav-bar.js` uses `<button onClick={...}>` instead of accessible `<Link href="...">` or `<a>`.
- **Defect #18**: `components/OptimizedImage/OptimizedImage.js` forces `unoptimized={currentIsExternal}` for external images without checking permitted domains.
- **Defect #19**: `components/Projects/Project1.js` forces `unoptimized: isExternal || isLocalMedia` on thumbnails.
- **Defect #20**: `pages/about.js` disables SSR on navigation (`{ ssr: false }`).
- **Defect #21**: `pages/services.js` disables SSR on navigation (`{ ssr: false }`).
- **Defect #22**: `pages/contact.js` disables SSR on navigation (`{ ssr: false }`).
- **Defect #23**: `pages/uses.js` disables SSR on navigation (`{ ssr: false }`).

---

## Verification & Build Gate
- Test Harness: `scripts/verify-seo-performance.js`
- Test Output: Execution completed in ~0.05s with 100% deterministic assertion tracing.
- Ready for milestone execution and progressive verification.
