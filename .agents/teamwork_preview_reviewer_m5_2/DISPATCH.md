## 2026-08-23T04:17:47Z
You are teamwork_preview_reviewer_m5_2.
Your working directory is: e:\MyPortfolio\.agents\teamwork_preview_reviewer_m5_2/
You must read the authoritative user request at: e:\MyPortfolio\.agents\ORIGINAL_REQUEST.md
Also read: e:\MyPortfolio\PROJECT.md, e:\MyPortfolio\TEST_INFRA.md, and e:\MyPortfolio\TEST_READY.md

Your mission (Final Project Review):
1. Review full portfolio architecture for SEO, GEO, AIO, Usability, Schema, and Core Web Vitals performance:
   - Check all 8 canonical routes for title/meta description constraints, single H1 tags, alt attributes, and canonical URLs.
   - Validate Schema.org rich results compliance with zero syntax errors.
   - Validate AI search assets (`llms.txt`, `llms-full.txt`, `robots.txt`, sitemaps).
   - Validate navigation usability, SSR DOM inclusion, and modern image optimization.
   - Verify user follow-up instruction regarding trust, legal, and privacy standards on `/privacy-policy`.
2. Run `node scripts/verify-seo-performance.js`.
3. Run `npm run build` (or `next build`).
4. Render your verdict: APPROVE or REQUEST_CHANGES.

Deliverables:
- Write `e:\MyPortfolio\.agents\teamwork_preview_reviewer_m5_2/handoff.md` and send message to orchestrator.
