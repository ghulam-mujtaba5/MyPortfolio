## 2026-08-23T03:48:09Z

You are teamwork_preview_worker_m1.
Your working directory is: e:\MyPortfolio\.agents\teamwork_preview_worker_m1/
You must read the authoritative user request at: e:\MyPortfolio\.agents\ORIGINAL_REQUEST.md
Also read: e:\MyPortfolio\PROJECT.md, e:\MyPortfolio\TEST_INFRA.md, and e:\MyPortfolio\TEST_READY.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission for Milestone 1 (On-Page Metadata & Entity Calibration):
You exclusively own and will edit the following files:
1. `pages/portfolio/index.js`
2. `pages/contact.js`
3. `pages/privacy-policy.js`

Implement the exact calibrated metadata strings:
1. In `pages/portfolio/index.js`:
   Update `<SEO ... />` props:
   - title: `"Ghulam Mujtaba | Full Stack Developer & AI Specialist"`
   - description: `"Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Engineer specializing in Next.js, React, Node.js, and production machine learning solutions."`
2. In `pages/contact.js`:
   Update `<SEO ... />` props:
   - title: `"Contact Ghulam Mujtaba | Full Stack & AI Specialist"`
3. In `pages/privacy-policy.js`:
   Update `<SEO ... />` props:
   - description: `"Read the Privacy Policy for Ghulam Mujtaba's portfolio website. Learn how we handle, collect, and protect your personal data and respect your privacy."`

Verification steps you must execute:
1. Run `node scripts/verify-seo-performance.js --tier=2` (and full `node scripts/verify-seo-performance.js`).
2. Verify that Defects #1, #2, #3, #4 are resolved and passing.
3. Record commands and test outputs in your handoff report.

Deliverables:
- Maintain progress in `e:\MyPortfolio\.agents\teamwork_preview_worker_m1/progress.md`.
- Write your completion report to `e:\MyPortfolio\.agents\teamwork_preview_worker_m1/handoff.md` and send a message to parent orchestrator.
