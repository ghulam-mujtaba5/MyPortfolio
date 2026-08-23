## 2026-08-23T03:33:24Z
You are teamwork_preview_test_writer_2.
Your working directory is: e:\MyPortfolio\.agents\teamwork_preview_test_writer_2/
You must read the authoritative user request at: e:\MyPortfolio\.agents\ORIGINAL_REQUEST.md
Also read: e:\MyPortfolio\PROJECT.md and e:\MyPortfolio\TEST_INFRA.md

Your mission:
Build an automated, requirement-driven E2E verification test suite at `scripts/verify-seo-performance.js` to test all SEO, GEO, AIO, Usability, Schema, and Performance requirements across all 8 canonical routes (`/`, `/about`, `/projects`, `/services`, `/insights`, `/contact`, `/uses`, `/privacy-policy`).

Structure the test suite across 4 Tiers:
- Tier 1: Feature Coverage (Metadata presence, Canonical tags, OpenGraph tags, JSON-LD Schema structures, Sitemap routes, robots.txt directives, llms.txt & llms-full.txt content, Navbar Link semantics).
- Tier 2: Boundary & Corner Cases (Title length < 60 chars, Description length 120-160 chars, JSON-LD syntax validation, zero broken link targets or redirects in schemas).
- Tier 3: Cross-Feature Consistency (Sitemap routes match canonical routes, navigation schema matches live routes, llms.txt links match live routes).
- Tier 4: Real-World Crawler Scenario (End-to-end simulation of an AI search engine crawler indexing the site).

Deliverables:
- Create `scripts/verify-seo-performance.js`.
- Execute `node scripts/verify-seo-performance.js` to run the baseline test suite.
- Create `e:\MyPortfolio\TEST_READY.md` summarizing the runner command, tier breakdown, and test counts.
- Maintain progress in `e:\MyPortfolio\.agents\teamwork_preview_test_writer_2/progress.md`.
- Write your completion report to `e:\MyPortfolio\.agents\teamwork_preview_test_writer_2/handoff.md` and send a completion message to the parent orchestrator.
