# Small Fixes — Deferred (do when convenient)

Non-frontend items found during the premium upgrade passes. None block the UI work; listed here so they don't get lost.

## 1. Media API 404s — RESOLVED (verified 2026-07-04)
Previously suspected: some project/article images reference `/api/media/file/<id>` URLs that 404 due to missing GridFS/MediaAsset records.

**Verified fixed.** Ran `scripts/audit-media.mjs` against the production MongoDB (Atlas `myportfolio` db):
- 29 GridFS files ↔ 29 MediaAsset docs, all healthy (0 orphaned either direction)
- All 8 Project docs' `image`/`gallery` fields resolve to existing GridFS files
- Extended the check to the `articles` collection (3 articles, 6 media refs) — all healthy

Then live-tested every referenced `/api/media/file/<id>` against `https://ghulammujtaba.com` directly (GET, following redirects) — all returned `200` with correct content-type/size. No 404s reproduce. Re-run `node scripts/audit-media.mjs` any time to re-verify DB integrity after future uploads/deletes.

## 2. Canonical public email — currently inconsistent
Three different addresses are live on the site:

| Address | Used in |
|---|---|
| `hello@ghulammujtaba.com` | contact page, privacy policy, SEO org schema (`components/SEO.js:598`) |
| `ghulammujtaba1005@gmail.com` | about page mailto, resume page, `feed.xml` (author/webmaster), SEO person schema (`components/SEO.js:187`), homepage FAQ answer (`pages/portfolio/index.js:104`) |

**Fix:** decide the one public address (recommend `hello@ghulammujtaba.com` if the mailbox/forwarding actually works — custom domain reads more professional), then update every location above. Verify mail delivery before switching.

## 3. `npm run lint` is broken
Next 16 removed `next lint` and the repo has no flat ESLint config.

**Fix:** add `eslint.config.mjs` (flat config) with `eslint-config-next`, and change the `lint` script to `eslint .`. Until then, verification is `npm run build` + puppeteer screenshots.

## 4. Legacy CSS-module patterns (migrate opportunistically only)
Per the engagement convention, only NEW components must use the single-module + `[data-theme]` pattern. Still on the old triple-file (Common/Light/Dark) pattern, migrate only when a redesign touches them anyway:
- `components/Articles/ArticleCard.js` (+ ArticleCard.light/dark modules)
- `components/Articles/ArticleDetail*` / `ArticlesListPage*` / `ArticlesPreview*` module trios
- `components/NavBar_Mobile/*` (Common/Light/Dark) — panel now animated by Framer Motion but theming still split
- `components/AboutPage/*` (Common/Light/Dark)

## 5. Dead CSS in `profile-picture.module.css`
The kebab-case `.image-container` rules are dead code (component uses `styles.imageContainer`). Delete the kebab-case block on the next touch of that file.

## 6. Verify external links still live
- `topmate.io/ghulam_mujtaba` (mentioned in homepage FAQ speakable answer)
- `aestheticsplace.pk`, `megilance.site`, `campusaxis.site` (project cards' Live links)

Dead outbound links hurt trust and SEO — quick quarterly check.
