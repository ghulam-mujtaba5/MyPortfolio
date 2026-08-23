# E2E Test Infra: Portfolio SEO, GEO, AIO, Schema & Performance Verification

## Test Philosophy
- Requirement-driven, opaque-box verification matching `ORIGINAL_REQUEST.md`.
- Verifies all 8 canonical routes (`/`, `/about`, `/projects`, `/services`, `/insights`, `/contact`, `/uses`, `/privacy-policy`), schema graphs, crawler files, and build integrity.

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Workload/Scenario) |
|---|---------|-------------|:-----------------:|:-----------------:|:----------------------:|:--------------------------:|
| 1 | On-Page Metadata (Titles & Descs) | R1, R2 | 5 tests | 5 tests | Pairwise | ✓ |
| 2 | Canonical URLs & OG / Twitter Meta | R2 | 5 tests | 5 tests | Pairwise | ✓ |
| 3 | Heading & Alt Text Hierarchy | R1, R2 | 5 tests | 5 tests | Pairwise | ✓ |
| 4 | JSON-LD Schemas (Person, WebSite, Org, Service) | R3 | 5 tests | 5 tests | Pairwise | ✓ |
| 5 | JSON-LD Schemas (Breadcrumbs, FAQ, Collection, Nav) | R3 | 5 tests | 5 tests | Pairwise | ✓ |
| 6 | Dynamic & Static Sitemaps | R4 | 5 tests | 5 tests | Pairwise | ✓ |
| 7 | AI Search Assets (llms.txt, llms-full.txt, robots.txt) | R4 | 5 tests | 5 tests | Pairwise | ✓ |
| 8 | Usability & Link Semantics (Navbar Links) | R5 | 5 tests | 5 tests | Pairwise | ✓ |
| 9 | SSR Rendering & Hydration | R5 | 5 tests | 5 tests | Pairwise | ✓ |
| 10 | Next.js Image Optimization Pipeline | R5 | 5 tests | 5 tests | Pairwise | ✓ |
| 11 | Production Build & Lint Compilation | Acceptance | 5 tests | 5 tests | Pairwise | ✓ |

## Test Architecture
- Test Suite Runner: Node.js / Jest test script validating file exports, HTML/SSR output, JSON-LD schema validity, sitemap generation, and character boundaries.
- Verification Script: `scripts/verify-seo-performance.js`
- Test Output: Formatted summary of passed/failed assertions across Tiers 1-5.
