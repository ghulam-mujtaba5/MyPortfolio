## 2026-08-23T04:05:02Z
You are teamwork_preview_worker_m3.
Your working directory is: e:\MyPortfolio\.agents\teamwork_preview_worker_m3/
You must read the authoritative user request at: e:\MyPortfolio\.agents\ORIGINAL_REQUEST.md
Also read: e:\MyPortfolio\PROJECT.md, e:\MyPortfolio\TEST_INFRA.md, and e:\MyPortfolio\TEST_READY.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission for Milestone 3 (AI Search Assets & Sitemap Sync):
You exclusively own and will edit:
1. pages/sitemap.xml.js
2. public/llms.txt
3. public/llms-full.txt
4. public/robots.txt

Implement the following updates:
1. In pages/sitemap.xml.js:
   - Update STATIC_PAGES array to include all canonical public routes:
     - /services (priority 0.9, changefreq 'weekly' or 'monthly')
     - /contact (priority 0.8, changefreq 'monthly')
     - /uses (priority 0.7, changefreq 'monthly')
     Ensure /, /about, /resume, /projects, /services, /insights, /contact, /uses, /privacy-policy are all present.
2. In public/llms.txt:
   - Update any link from /articles to /insights (canonical URL).
   - Update any reference from https://www.campusaxis.com to https://campusaxis.pk.
   - Ensure the site navigation section includes /services, /uses, /contact, and /privacy-policy.
3. In public/llms-full.txt:
   - Update any link from /articles to /insights.
   - Update any reference from https://www.campusaxis.com to https://campusaxis.pk.
   - Ensure all route citations and descriptions match canonical endpoints.
4. In public/robots.txt:
   - Confirm directives cleanly allow AI search bots and point to canonical sitemap https://ghulammujtaba.com/sitemap.xml.

Verification steps you must execute:
1. Run 
ode scripts/verify-seo-performance.js --tier=1 and 
ode scripts/verify-seo-performance.js --tier=3.
2. Run full 
ode scripts/verify-seo-performance.js.
3. Confirm that Defects #9, #10, #11, #12, #13, #14, #15, and #16 are fully resolved and passing.

Deliverables:
- Maintain progress in :\MyPortfolio\.agents\teamwork_preview_worker_m3/progress.md.
- Write your completion report to :\MyPortfolio\.agents\teamwork_preview_worker_m3/handoff.md and send a message to parent orchestrator.
