# Comprehensive Technical Survey: Structured Data (Schema.org JSON-LD) & AI Crawler Assets

**Author**: `teamwork_preview_spec_miner_survey_2` (Specification Miner)  
**Date**: 2026-08-23  
**Target Repository**: `e:\MyPortfolio`  
**Scope**: All 8 Routes (`/`, `/about`, `/projects`, `/services`, `/insights`, `/contact`, `/uses`, `/privacy-policy`), secondary routes (`/resume`, `/search`, `/[slug]`), JSON-LD Schemas, Entity Relationships, GSC Rich Results, `public/robots.txt`, `public/llms.txt`, `public/llms-full.txt`, Dynamic & Static Sitemaps, and IndexNow.

---

## Executive Summary

A comprehensive architectural and code-level audit was conducted across all 8 canonical routes, dynamic routes, structured data helper modules (`components/SEO.js`), crawler configuration files (`public/robots.txt`, `public/llms.txt`, `public/llms-full.txt`), and sitemap generation pipelines (`pages/sitemap.xml.js`, `next-sitemap-config.js`, `sitemap-paths.json`).

The existing codebase demonstrates strong initial SEO foundation with centralized `<SEO />` components, JSON-LD builders, and AI crawler directives. However, critical discrepancies, missing static pages in sitemaps, route name drift (`/articles` vs `/insights`), mismatched service schema structures, missing rich schemas on `/uses` and `/privacy-policy`, and entity URL mismatches (`campusaxis.pk` vs `campusaxis.com`) were identified.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Structured Data | `personSchema` | Primary entity definition for Ghulam Mujtaba with occupation, credentials, education, social profiles, and topic competencies | Optional overrides object (`url`, `sameAs`, `hasOccupation`) | JSON-LD object typed `@type: "Person"` with `@id: "https://ghulammujtaba.com/#person"` | Defaults to core persona fields if overrides empty | `components/SEO.js:181` |
| 2 | Structured Data | `profilePageSchema` | Google Profile Page structured data triggering rich personal entity cards | Optional overrides object (`mainEntity`, `dateModified`) | JSON-LD object typed `@type: "ProfilePage"` with `@id: "https://ghulammujtaba.com/#profilepage"` | Falls back to current date for `dateModified` | `components/SEO.js:359` |
| 3 | Structured Data | `webSiteSchema` | WebSite schema enabling Google Sitelinks Searchbox | None | JSON-LD object typed `@type: "WebSite"` with `potentialAction: SearchAction` pointing to `/search?q={search_term_string}` | Static schema template | `components/SEO.js:380` |
| 4 | Structured Data | `organizationSchema` | Organization entity establishing brand linkage | None | JSON-LD object typed `@type: "Organization"` with founder linked to `/#person` | Static schema template | `components/SEO.js:405` |
| 5 | Structured Data | `navigationSchema` | SiteNavigationElement hints for Google Sitelinks | None | JSON-LD object typed `@type: "ItemList"` with 5 `SiteNavigationElement` entries | Static schema; contains `/articles` link drift | `components/SEO.js:430` |
| 6 | Structured Data | `breadcrumbSchema` | BreadcrumbList generator for hierarchical SERP navigation | Array of `{ name, url }` items | JSON-LD object typed `@type: "BreadcrumbList"` with 1-indexed `ListItem` elements starting from Home (`/`) | Gracefully handles empty array (yields Home only) | `components/SEO.js:474` |
| 7 | Structured Data | `collectionPageSchema` | CollectionPage markup for listing views (Projects & Insights) | `{ name, url, description, items: Array<{ name, url, description, image }> }` | JSON-LD object typed `@type: "CollectionPage"` with nested `ItemList` | Omitted item fields filtered out cleanly | `components/SEO.js:498` |
| 8 | Structured Data | `softwareProjectSchema` | SoftwareSourceCode schema for codebases and project portfolios | `{ name, description, url, codeRepository, programmingLanguages, image }` | JSON-LD object typed `@type: "SoftwareSourceCode"` with author linked to `/#person` | `codeRepository` omitted if undefined | `components/SEO.js:525` |
| 9 | Structured Data | `serviceSchema` | Atomic Service schema builder | `{ name, description, serviceType, areaServed, url }` | JSON-LD object typed `@type: "Service"` with provider linked to `/#person` | Defaults `serviceType` to `name`, `areaServed` to Worldwide | `components/SEO.js:550` |
| 10 | Structured Data | `professionalServiceSchema` | Freelance/consulting entity with nested OfferCatalog | Optional overrides | JSON-LD object typed `@type: "ProfessionalService"` with `@id: "https://ghulammujtaba.com/#service"` and 3 `CORE_SERVICES` offers | Defaults to 3 services (mismatches `/services` page's 4 services) | `components/SEO.js:591` |
| 11 | Structured Data | `faqSchema` | FAQPage schema generating rich expandable question/answer SERP snippets | Array of `{ question, answer }` | JSON-LD object typed `@type: "FAQPage"` with `mainEntity` Question/Answer array | Returns empty `mainEntity` if no FAQs passed | `components/SEO.js:627` |
| 12 | Structured Data | `speakableSchema` | Speakable WebPage specification for Google Assistant & TTS readers | `{ url, cssSelectors }` | JSON-LD object typed `@type: "WebPage"` with `SpeakableSpecification` | Defaults to `['h1', '[data-speakable]', "meta[name='description']"]` | `components/SEO.js:644` |
| 13 | Structured Data | `articleSchema` | Article schema for technical writing and insights posts | `{ headline, description, image, url, datePublished, dateModified, keywords, readingTime, wordCount }` | JSON-LD object typed `@type: "Article"` with publisher Organization and author Person | Reading time converted to ISO `PT{x}M` | `components/SEO.js:661` |
| 14 | Crawlers | `robots.txt` AI Policy | User-agent directives permitting LLM & AI indexing bots | Web crawler requests | HTTP text response allowing `GPTBot`, `ChatGPT-User`, `Claude-Web`, `PerplexityBot`, etc. | Disallows `/admin/`, `/api/`, `/search` | `public/robots.txt` |
| 15 | Crawlers | `llms.txt` Profile | Structured markdown summary for LLM context ingestion | AI search agent fetch | Markdown file outlining bio, skills, certifications, notable projects, and social links | Contains outdated `/articles` link and `campusaxis.com` URL | `public/llms.txt` |
| 16 | Crawlers | `llms-full.txt` Detailed Spec | Comprehensive LLM-optimized portfolio knowledge document | AI search agent fetch | In-depth markdown covering full bio, tech taxonomy, experience, project case studies, and FAQs | Contains outdated `/articles` link and `campusaxis.com` URL | `public/llms-full.txt` |
| 17 | Sitemaps | Dynamic Sitemap (`sitemap.xml.js`) | SSR-generated XML sitemap pulling dynamic DB slugs | Crawler GET `/sitemap.xml` | XML sitemap containing static pages and dynamic `/insights/*` and `/projects/*` URLs with fresh `lastmod` | Missing `/services`, `/contact`, `/uses` in `STATIC_PAGES` | `pages/sitemap.xml.js` |
| 18 | Sitemaps | `next-sitemap` Static Fallback | Build-time sitemap generator outputting `sitemap-0.xml` via `sitemap-paths.json` | `npm run postbuild` | Static `public/sitemap-0.xml` file | Gracefully falls back if DB unreachable during build | `next-sitemap-config.js` |
| 19 | Indexing | IndexNow Submissions | Real-time indexing notifier for Bing, Yandex, Seznam | `urls` (string or array) | HTTP POST to `https://api.indexnow.org/indexnow` with verification key | Returns `false` on network or HTTP error | `lib/indexnow.js` |
| 20 | RSS / Feeds | `feed.xml.js` RSS Feed | RSS 2.0 XML endpoint for syndication and AI feed consumers | GET `/feed.xml` | RSS 2.0 feed with CDATA content, categories, enclosures, and author details | Handled via SSR; `X-Robots-Tag: noindex` in headers | `pages/feed.xml.js` |

---

## Route-by-Route Structured Data (JSON-LD) Audit

### 1. Route: `/` (Homepage — `pages/portfolio/index.js`)
- **Current JSON-LD Schemas**:
  1. `Person` (`@id: "https://ghulammujtaba.com/#person"`)
  2. `ProfilePage` (`@id: "https://ghulammujtaba.com/#profilepage"`)
  3. `WebSite` (`@id: "https://ghulammujtaba.com/#website"`, Sitelinks Searchbox)
  4. `Organization` (`@id: "https://ghulammujtaba.com/#organization"`)
  5. `ProfessionalService` (`@id: "https://ghulammujtaba.com/#service"`)
  6. `ItemList` (`SiteNavigationElement`)
  7. `WebPage` (`SpeakableSpecification`)
  8. `FAQPage` (8 Q&As)
- **Validation & Rich Results Status**:
  - Valid syntax; interconnected `@id` graph.
  - **Discrepancy 1**: In `navigationSchema()`, Item 4 has URL `${SITE_URL}/articles` (which is redirected to `/insights`) and Item 5 has `${SITE_URL}/#contact-section` (instead of the dedicated `/contact` page).
  - **Discrepancy 2**: Organization name is `"Ghulam Mujtaba"` rather than `"Megicode"` or `"Ghulam Mujtaba Portfolio"`.

### 2. Route: `/about` (`pages/about.js`)
- **Current JSON-LD Schemas**:
  1. `Person`
  2. `ProfilePage`
  3. `BreadcrumbList` (Home > About)
  4. `FAQPage` (4 Q&As)
  5. `WebPage` (`SpeakableSpecification`)
- **Validation & Rich Results Status**:
  - Fully compliant with GSC ProfilePage and FAQ rich results.

### 3. Route: `/projects` (`pages/projects.js` & `pages/projects/[slug].js`)
- **Listing Page (`/projects`)**:
  - `CollectionPage` with nested `ItemList` of projects.
  - `BreadcrumbList` (Home > Projects).
  - Up to 10 `SoftwareSourceCode` schemas for projects with live URLs or code repositories.
- **Detail Pages (`/projects/[slug]`)**:
  - `CreativeWork` (`name`, `description`, `url`, `image`, `author`, `publisher`, `datePublished`, `dateModified`, `keywords`).
  - `BreadcrumbList` (Home > Projects > [Project Title]).
  - `SoftwareSourceCode` (conditional when `project.links.github` is present).
- **Validation & Rich Results Status**:
  - Schema types are syntactically valid and connect properly to `/#person`.

### 4. Route: `/services` (`pages/services.js`)
- **Current JSON-LD Schemas**:
  1. `ProfessionalService` (`@id: "https://ghulammujtaba.com/#service"`)
  2. `BreadcrumbList` (Home > Services)
- **Validation & Rich Results Status**:
  - **Defect / Drift**: `professionalServiceSchema()` imports default `CORE_SERVICES` which contains 3 items (*UI & UX Design*, *Full-Stack Web & Mobile Development*, *Data Science & AI Solutions*), whereas `pages/services.js` actually defines and presents 4 distinct services (*Full-Stack Web Development*, *Custom AI & Chatbot Development*, *Cross-Platform Mobile Apps*, *Data Science & Analytics*).
  - **Recommendation**: Pass page-specific services into `professionalServiceSchema()` or generate discrete `Service` schemas with `hasOfferCatalog` matching the 4 on-page services.

### 5. Route: `/insights` (`pages/insights/index.js` & `pages/insights/[slug].js`)
- **Listing Page (`/insights`)**:
  - `CollectionPage` with nested `ItemList` of articles.
  - `BreadcrumbList` (Home > Insights).
- **Detail Pages (`/insights/[slug]`)**:
  - `Article` schema with `headline`, `description`, `image`, `datePublished`, `dateModified`, `keywords`, `timeRequired` (`PT{readingTime}M`), `author: Person`, `publisher: Organization`.
  - `BreadcrumbList` (Home > Insights > [Article Title]).
  - `SpeakableSpecification` (`.article-title`, `.article-excerpt`).
- **Validation & Rich Results Status**:
  - 100% compliant with Google Search Console Article Rich Results.

### 6. Route: `/contact` (`pages/contact.js`)
- **Current JSON-LD Schemas**:
  1. `Person`
  2. `ProfessionalService`
  3. `BreadcrumbList` (Home > Contact)
- **Validation & Rich Results Status**:
  - Valid syntax. Could optionally include `@type: "ContactPage"` with `mainEntity: { "@id": "https://ghulammujtaba.com/#person" }`.

### 7. Route: `/uses` (`pages/uses.js`)
- **Current JSON-LD Schemas**:
  1. `BreadcrumbList` (Home > Uses)
- **Validation & Rich Results Status**:
  - **Gap**: `/uses` has only a `BreadcrumbList`. It lacks an `ItemPage` / `WebPage` schema or `ItemList` describing the hardware, software, and tools profile with `about: { "@id": "https://ghulammujtaba.com/#person" }`.

### 8. Route: `/privacy-policy` (`pages/privacy-policy.js`)
- **Current JSON-LD Schemas**:
  1. `BreadcrumbList` (Home > Privacy Policy)
- **Validation & Rich Results Status**:
  - **Gap**: Only has `BreadcrumbList`. Could be augmented with a `WebPage` entity stating `publisher: { "@id": "https://ghulammujtaba.com/#person" }` and `dateModified`.

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Dynamic Sitemap (`pages/sitemap.xml.js`) | GET `/sitemap.xml` | Returns XML sitemap. `STATIC_PAGES` contains `/`, `/about`, `/resume`, `/projects`, `/insights`, `/privacy-policy`. **Omitted**: `/services`, `/contact`, `/uses`. |
| 2 | Static Fallback Sitemap (`next-sitemap-config.js`) | Build time generation | Emits `sitemap-0.xml` (redirected to `sitemap.xml` in `next.config.js`). Reads `sitemap-paths.json` or queries Mongo. |
| 3 | Route Drift `/articles` vs `/insights` | `navigationSchema()` in `components/SEO.js` | Item 4 hardcodes `https://ghulammujtaba.com/articles`, causing search bots to encounter a 301 redirect instead of the canonical `/insights`. |
| 4 | LLM Knowledge Files (`public/llms.txt` & `llms-full.txt`) | Bot fetching LLM context | Contains obsolete references to `https://ghulammujtaba.com/articles` and lists CampusAxis as `https://www.campusaxis.com` (instead of active `https://campusaxis.pk`). |
| 5 | Services Schema Catalog Drift | `pages/services.js` rendering `professionalServiceSchema()` | Schema outputs 3 generic services, ignoring the 4 specialized service cards and tech stacks rendered on the page. |
| 6 | Social Profile Consistency | `personSchema.sameAs` across components | `personSchema()` in `components/SEO.js` has 13 links; `/resume.js` has 11 links with Kaggle, LeetCode, StackOverflow included; `public/llms-full.txt` has 12 links. |
| 7 | Next.js Image Security & Caching Headers | `next.config.js` | Allows Cloudinary, Freepik, Unsplash, jsDelivr, RawGitHub, and GitHub. `minimumCacheTTL: 2592000` (30 days), modern formats `AVIF` and `WebP`. |
| 8 | Search Page Indexing (`pages/search.js`) | GET `/search?q=...` | Emits `SearchResultsPage` JSON-LD with `SearchAction`, but correctly enforces `noindex: true` and `<meta name="robots" content="noindex, follow" />` to prevent SERP index bloat. |
| 9 | Secondary Dynamic Sitemaps (`pages/sitemap-dynamic.xml.js`) | GET `/sitemap-dynamic.xml` | Responds with HTTP 301 redirect to `/sitemap.xml`. |
| 10 | Security & CSP Headers (`next.config.js`) | HTTP request headers | Enforces strict CSP, HSTS (`max-age=63072000`), COOP (`same-origin`), and XFO (`DENY`). Includes CSP reporting endpoint. |

---

## Detailed Gap Analysis & Recommendations

### Gap 1: Missing Static Routes in Sitemap (`pages/sitemap.xml.js`)
- **Issue**: In `pages/sitemap.xml.js`, the `STATIC_PAGES` array contains only 6 routes (`/`, `/about`, `/resume`, `/projects`, `/insights`, `/privacy-policy`). `/services`, `/contact`, and `/uses` are completely absent.
- **Impact**: Search engines and AI crawlers consuming `https://ghulammujtaba.com/sitemap.xml` will not see `/services`, `/contact`, or `/uses` in the primary sitemap index.
- **Remedy**: Add `{ path: "/services", changefreq: "weekly", priority: 0.9 }`, `{ path: "/contact", changefreq: "monthly", priority: 0.8 }`, and `{ path: "/uses", changefreq: "monthly", priority: 0.7 }` to `STATIC_PAGES`.

### Gap 2: Link Drift in `navigationSchema()` (`components/SEO.js`)
- **Issue**: `navigationSchema()` specifies `https://ghulammujtaba.com/articles` (position 4) and `https://ghulammujtaba.com/#contact-section` (position 5).
- **Impact**: Google Sitelinks will receive a redirected endpoint (`/articles` -> `/insights`) and an in-page fragment (`/#contact-section` vs `/contact`).
- **Remedy**: Update position 4 to `https://ghulammujtaba.com/insights` (name: `"Insights"`) and position 5 to `https://ghulammujtaba.com/contact` (name: `"Contact"`), or add `/services`.

### Gap 3: Service Schema Inconsistency on `/services` (`pages/services.js`)
- **Issue**: `pages/services.js` invokes default `professionalServiceSchema()`, which embeds 3 legacy `CORE_SERVICES` from `components/SEO.js`. The actual UI showcases 4 distinct service categories with specific tech stacks.
- **Impact**: Schema.org OfferCatalog does not match on-page content, diminishing rich result relevance.
- **Remedy**: Update `professionalServiceSchema()` or allow passing custom services array matching the 4 services rendered on `/services`.

### Gap 4: Synchronization of `public/llms.txt` and `public/llms-full.txt`
- **Issue**:
  - `llms.txt` and `llms-full.txt` link to `/articles` instead of `/insights`.
  - CampusAxis URL is listed as `https://www.campusaxis.com` (while active site is `https://campusaxis.pk`).
  - Site structure in `llms.txt` omits `/services`, `/contact`, `/uses`, `/privacy-policy`.
  - Graduation is marked as "expected 2026" (degree completed June 2026).
- **Impact**: AI search models (ChatGPT Search, Perplexity, Gemini, Claude) ingesting `llms.txt` will index outdated URLs and incorrect platform domains.
- **Remedy**: Update `llms.txt` and `llms-full.txt` with canonical routes, accurate domain links, and comprehensive entity metadata.

### Gap 5: Enriching `/uses` and `/privacy-policy` Schemas
- **Issue**: `/uses` and `/privacy-policy` only include `breadcrumbSchema`.
- **Impact**: Missed opportunity to establish structured entity context for developer tooling (`ItemPage`/`WebPage`) and compliance policy metadata.
- **Remedy**: Add `WebPage` schema with `about: { "@id": "https://ghulammujtaba.com/#person" }` and `publisher: { "@id": "https://ghulammujtaba.com/#person" }`.

### Gap 6: AI Crawler Directives in `public/robots.txt`
- **Issue**: While `robots.txt` includes 12 AI bots, emerging AI indexing bots (`Bytespider`, `Applebot-Extended`, `Diffbot`, `DuckAssistBot`, `cohere-ai`, `Amazonbot`) are not explicitly listed.
- **Impact**: Some bots default to standard crawler behavior or may benefit from explicit allow directives.
- **Remedy**: Add explicit `User-agent: <bot>` / `Allow: /` entries for all major modern AI crawlers.
