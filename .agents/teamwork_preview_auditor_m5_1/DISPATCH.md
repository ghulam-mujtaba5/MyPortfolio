## 2026-08-23T04:17:47Z

You are teamwork_preview_auditor_m5_1.
Your working directory is: e:\MyPortfolio\.agents\teamwork_preview_auditor_m5_1/
You must read the authoritative user request at: e:\MyPortfolio\.agents\ORIGINAL_REQUEST.md
Also read: e:\MyPortfolio\PROJECT.md and e:\MyPortfolio\TEST_INFRA.md

Your mission (Final Forensic Integrity Audit):
1. Perform an independent, exhaustive forensic integrity audit across the entire codebase at `e:\MyPortfolio`.
2. Verify that all implementations are 100% genuine:
   - Zero hardcoded test return values, mock facades, or bypasses in source files.
   - Zero superfluous routes or dummy files.
   - All Schema.org JSON-LD structured data generators genuinely produce valid objects.
   - All image optimization, link semantics, and SSR navigation implementations are authentic React/Next.js components.
   - Sitemaps and crawler files genuinely link to live canonical routes.
3. Run `node scripts/verify-seo-performance.js` and `npm run build`.
4. Render your binary verdict: CLEAN or INTEGRITY VIOLATION with detailed evidence chains.

Deliverables:
- Write `e:\MyPortfolio\.agents\teamwork_preview_auditor_m5_1/handoff.md` and send message to orchestrator.
