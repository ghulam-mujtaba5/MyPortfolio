## 2026-08-23T04:00:52Z
You are teamwork_preview_worker_m2.
Your working directory is: e:\MyPortfolio\.agents\teamwork_preview_worker_m2/
You must read the authoritative user request at: e:\MyPortfolio\.agents\ORIGINAL_REQUEST.md
Also read: e:\MyPortfolio\PROJECT.md, e:\MyPortfolio\TEST_INFRA.md, and e:\MyPortfolio\TEST_READY.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission for Milestone 2 (Schema.org Structured Data & JSON-LD):
You exclusively own and will edit:
1. `components/SEO.js`
2. `pages/uses.js`
3. `pages/privacy-policy.js`

Implement the following structured data enhancements:
1. In `components/SEO.js`:
   - In `navigationSchema()`:
     - Update Item 4 to target `https://ghulammujtaba.com/insights` with name `"Insights"` (replacing `/articles`).
     - Update Item 5 to target `https://ghulammujtaba.com/contact` with name `"Contact"` (replacing `/#contact-section`).
   - In `professionalServiceSchema()`:
     - Harmonize `CORE_SERVICES` array to represent the 4 actual services from `/services`:
       1. "Full-Stack Web Development" (`https://ghulammujtaba.com/services#web-development` or `https://ghulammujtaba.com/services`)
       2. "Custom AI & Chatbot Development" (`https://ghulammujtaba.com/services#ai-solutions` or `https://ghulammujtaba.com/services`)
       3. "Cross-Platform Mobile Apps" (`https://ghulammujtaba.com/services#mobile-development` or `https://ghulammujtaba.com/services`)
       4. "Data Science & Analytics" (`https://ghulammujtaba.com/services#data-science` or `https://ghulammujtaba.com/services`)
2. In `pages/uses.js` and `pages/privacy-policy.js`:
   - Ensure clean Schema.org structured data (e.g. `webSiteSchema` or `webPageSchema` + `breadcrumbSchema`) is provided and exported without any syntax or validation errors.

Verification steps you must execute:
1. Run `node scripts/verify-seo-performance.js --tier=1` and `node scripts/verify-seo-performance.js --tier=3`.
2. Run full `node scripts/verify-seo-performance.js`.
3. Confirm that Defects #5, #6, #7, and #8 are resolved and passing.

Deliverables:
- Maintain progress in `e:\MyPortfolio\.agents\teamwork_preview_worker_m2/progress.md`.
- Write your completion report to `e:\MyPortfolio\.agents\teamwork_preview_worker_m2/handoff.md` and send a completion message to the parent orchestrator.
