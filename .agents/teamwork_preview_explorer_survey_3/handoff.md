# Handoff Report — Survey 3: Performance, Usability, Core Web Vitals & Build Setup

**Author:** `teamwork_preview_explorer_survey_3`  
**Working Directory:** `e:\MyPortfolio\.agents\teamwork_preview_explorer_survey_3`  
**Date:** August 23, 2026  
**Type:** Hard Handoff (Task Complete)  

---

## 1. Observation

1. **Next.js & Build Manifest (`package.json`)**:
   - Next.js version: `^16.1.0`, React version: `^19.2.3` (`package.json:36, 44`).
   - Sharp installed: `sharp: "^0.34.5"` (`package.json:73`).
   - Postbuild script: `"node scripts/generate-sitemap-paths.js && next-sitemap --config next-sitemap-config.js"` (`package.json:12`).
   - Build script: `"build": "next build"` (`package.json:9`).

2. **Next.js Configuration (`next.config.js`)**:
   - Modern image formats configured: `formats: ["image/avif", "image/webp"]` (`next.config.js:57`).
   - Remote patterns defined for Cloudinary, Freepik, Unsplash, GitHub, jsdelivr (`next.config.js:14-55`).
   - Caching headers: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` on public pages (`next.config.js:140-143`) and `Cache-Control: public, max-age=2592000` on static assets (`next.config.js:164-167`).
   - Security headers: CSP, CSP-Report-Only, Reporting-Endpoints, HSTS, COOP, and X-Frame-Options (`next.config.js:183-219`).
   - Turbopack config: `turbopack: {}` (`next.config.js:10`).

3. **Font Loading in `pages/_document.js`**:
   - Lines 48–72 load Google Fonts via `<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Poppins:wght@500;600;700&display=swap" />` with `media="print"` and inline script `document.getElementById('google-fonts-stylesheet').media='all';`. It does not use `next/font/google`.

4. **Image Optimization Bypasses**:
   - In `components/OptimizedImage/OptimizedImage.js:177`:
     ```javascript
     unoptimized={currentIsExternal}
     ```
     Forces `unoptimized={true}` for all external image URLs (including Cloudinary and Unsplash).
   - In `components/Projects/Project1.js:39-44`:
     ```javascript
     const isLocalMedia = /^\/api\/media\//i.test(img);
     return {
       src: isExternal ? img : img.startsWith("/") ? img : `/${img}`,
       unoptimized: isExternal || isLocalMedia,
       fit: project?.imageFit || "cover",
     };
     ```
     Forces `unoptimized: true` on `/api/media/` and external project card images.

5. **Navigation Usability & HTML Semantics**:
   - In `components/NavBar_Desktop/nav-bar.js:176-275`: Navigation buttons use `<button className={...} onClick={() => handleNavigation(path)}>Home</button>` and `<button ... onClick={() => handleNavigation("/about")}>About</button>` instead of `<Link href="...">` or `<a>`.
   - In `pages/services.js:9-10, 46-50, 78` and `pages/uses.js:9-10, 19-23, 50`: `NavBarDesktop` and `NavBarMobile` are imported with `{ ssr: false }` and rendered via client-side state `{isMobile ? <NavBarMobile /> : <NavBarDesktop />}`, omitting navigation markup from initial SSR HTML.

6. **Static Sitemap Discrepancy (`pages/sitemap.xml.js:9-16`)**:
   - `STATIC_PAGES` array contains:
     ```javascript
     const STATIC_PAGES = [
       { path: "/", changefreq: "weekly", priority: 1.0 },
       { path: "/about", changefreq: "monthly", priority: 0.9 },
       { path: "/resume", changefreq: "monthly", priority: 0.8 },
       { path: "/projects", changefreq: "weekly", priority: 0.9 },
       { path: "/insights", changefreq: "weekly", priority: 0.9 },
       { path: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
     ];
     ```
     Omits `/services`, `/uses`, and `/contact`.

7. **Production Build Baseline (`build-report.txt`)**:
   - `next build` previously succeeded with 18 pages compiled (`Compiled successfully in 11.0s`, `Generating static pages (18/18)`). Shared first-load JS is 119 kB.

---

## 2. Logic Chain

1. **Font Strategy Evaluation**:
   - Observation 3 shows external Google Fonts are requested via `<link rel="preload">` from `fonts.googleapis.com` and `fonts.gstatic.com`.
   - Because font binaries are downloaded over the network during runtime, it requires external network connections and risks FOUT or CLS.
   - Migrating to `next/font/google` will self-host the font files at build time, eliminating external HTTP requests and leveraging automatic size-adjust fallbacks to eliminate font layout shifts.

2. **Image Optimization Analysis**:
   - Observation 2 demonstrates that `next.config.js` is properly configured with AVIF/WebP formats and remote patterns.
   - However, Observation 4 shows that both `OptimizedImage.js` and `Project1.js` force `unoptimized: true` on external URLs and local `/api/media/` endpoints.
   - Consequently, visitors on mobile or slow connections download original multi-megabyte images without AVIF/WebP conversion or Next.js edge resizing, which degrades Largest Contentful Paint (LCP).
   - Removing the forced `unoptimized` flag for permitted domains restores Next.js image optimization pipeline and improves LCP.

3. **Navigation & Crawler Discoverability**:
   - Observation 5 reveals desktop navigation links are `<button>` elements with JS click handlers.
   - Search crawlers (Googlebot, Bingbot, LLM bots) rely on standard HTML `<a>` tags with `href` attributes to crawl internal links. Furthermore, buttons break middle-click, right-click, and screen reader link navigation.
   - In addition, Observation 5 shows navigation is omitted from SSR HTML on `/services` and `/uses` due to client-only `{ ssr: false }` dynamic imports.
   - Converting navigation to semantic `<Link href="...">` and rendering both NavBars with SSR + CSS media queries resolves crawler discovery, SSR HTML completeness, and browser accessibility.

4. **Sitemap Completeness**:
   - Observation 6 shows that while `/services`, `/uses`, and `/contact` are valid public routes, they are missing from `STATIC_PAGES` in `pages/sitemap.xml.js`.
   - Adding these 3 routes ensures search engines and AI crawlers receive a 100% complete sitemap of all canonical public pages.

---

## 3. Caveats

- In accordance with the Explorer archetype constraints ("Read-only investigation — do NOT implement changes to project source code"), no modifications to project source files have been made in this phase.
- Live database queries (`MONGODB_URI`) were not executed directly; sitemap generation and ISR behaviors were verified via configuration files, build reports, and source code inspection.

---

## 4. Conclusion

The portfolio codebase at `e:\MyPortfolio` has a solid Next.js 16 + React 19 foundation with clean build characteristics, robust security headers, and static generation capability. However, critical opportunities exist to maximize its technical performance, Core Web Vitals, and search crawler visibility:
1. **Desktop & Mobile Navigation:** Convert `<button>` elements to semantic `<Link href="...">` tags and ensure SSR rendering across `/services` and `/uses`.
2. **Image Optimization:** Remove forced `unoptimized: true` flags in `OptimizedImage.js` and `Project1.js` to enable AVIF/WebP compression for external and media assets.
3. **Typography:** Migrate from external `<link>` Google Fonts to `next/font/google` for zero-roundtrip, self-hosted fonts.
4. **Sitemap Completeness:** Add `/services`, `/uses`, and `/contact` to `pages/sitemap.xml.js`.

---

## 5. Verification Method

To independently verify these findings:
1. **Check Image Optimization Bypasses**: Inspect `components/OptimizedImage/OptimizedImage.js` at line 177 and `components/Projects/Project1.js` at lines 39–44.
2. **Check Navigation Tags**: Inspect `components/NavBar_Desktop/nav-bar.js` at lines 176–275 and note `<button>` elements used in place of `<Link>`.
3. **Check SSR Navigation**: Inspect `pages/services.js` at lines 9–10, 46–50, and 78.
4. **Check Sitemap Routes**: Inspect `pages/sitemap.xml.js` at lines 9–16.
5. **Inspect Detailed Survey**: Read `e:\MyPortfolio\.agents\teamwork_preview_explorer_survey_3\survey_performance_build.md`.
