# Technical Performance, Usability, Core Web Vitals & Build Survey

**Author:** `teamwork_preview_explorer_survey_3` (Performance, Usability & Build Specialist)  
**Date:** August 23, 2026  
**Scope:** `e:\MyPortfolio` (Next.js 16 + React 19 Portfolio)  
**Integrity Mode:** Development (Read-Only Investigation)  

---

## 1. Executive Summary & Audit Scorecard

This survey delivers an exhaustive technical audit of the performance, asset delivery, usability, accessibility (a11y), Core Web Vitals (LCP, CLS, INP), and build configuration across the portfolio codebase at `e:\MyPortfolio`.

### Audit Scorecard

| Dimension | Baseline Status | Grade | Core Findings / Bottlenecks |
|---|---|---|---|
| **Build Configuration & Bundling** | Healthy & Static-Ready | **A-** | Next.js 16.1.0 + React 19.2.3 with Turbopack support, bundle analyzer configured, clean build output with 18 static/dynamic routes. |
| **Asset & Font Loading** | Needs Upgrade | **B-** | Google Fonts loaded via external `<link rel="preload">` + JS media swap rather than zero-roundtrip `next/font/google`. |
| **Image Optimization & CWV (LCP/CLS)** | Mixed / Bypasses Found | **C+** | AVIF/WebP enabled in `next.config.js`, but `OptimizedImage.js` and `Project1.js` force `unoptimized: true` on external & media routes. |
| **Usability & a11y (Navigation & HTML)** | Usability Issues | **C** | Desktop Navbar uses `<button>` tags with `router.push()` instead of semantic `<Link href="...">`, preventing crawler indexation and tab navigation. |
| **Hydration & SSR Navigation Delivery** | Partial Disconnect | **B-** | `pages/services.js` and `pages/uses.js` dynamically import NavBars with `{ ssr: false }` controlled by client-only `isMobile` state. |
| **Security Headers & Caching** | Production-Grade | **A** | Strong CSP, HSTS (`63072000`), COOP, X-Frame-Options, 30-day immutable asset cache, and `s-maxage=3600` public caching. |

---

## 2. Next.js & Build System Configuration Survey

### 2.1 Package Manifest (`package.json`)
- **Next.js Version:** `^16.1.0` (Pages Router architecture)
- **React Version:** `^19.2.3`, `react-dom: ^19.2.3`
- **Native Image Optimizer:** `sharp: ^0.34.5` is explicitly present in `devDependencies`.
- **Bundle Analyzer:** `@next/bundle-analyzer: ^16.2.6` integrated for build bundle diagnostics.
- **Accessibility Linting:** `eslint-plugin-jsx-a11y: ^6.10.2` and `eslint-config-next: ^16.1.0`.
- **Testing Setup:** `jest: ^30.2.0`, `@testing-library/react: ^16.3.1`, `@testing-library/dom: ^10.4.1`, `@testing-library/jest-dom: ^6.9.1`.
- **Build Scripts:**
  - `dev`: `next dev`
  - `build`: `next build`
  - `postbuild`: `node scripts/generate-sitemap-paths.js && next-sitemap --config next-sitemap-config.js`
  - `lint`: `next lint`
  - `test`: `jest`

### 2.2 Next.js Configuration (`next.config.js`)
- **Strict Mode:** `reactStrictMode: true` enabled.
- **Turbopack Compatibility:** `turbopack: {}` explicitly declared to prevent Next.js 16 mixed compiler warnings.
- **Image Optimization Setup (`next.config.js:13-64`):**
  - Modern formats enabled: `formats: ["image/avif", "image/webp"]`.
  - Cache TTL: `minimumCacheTTL: 2592000` (30 days).
  - SVG security: `dangerouslyAllowSVG: true`, `contentDispositionType: "attachment"`, `contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"`.
  - Allowed remote hosts in `remotePatterns`: `res.cloudinary.com`, `**.cloudinary.com`, `ghulammujtaba.com`, `www.ghulammujtaba.com`, `img.freepik.com`, `images.unsplash.com`, `cdn.jsdelivr.net`, `raw.githubusercontent.com`, `github.com`.
- **Canonical Routing, Rewrites & Redirects (`next.config.js:66-125`):**
  - Rewrites: Internal mapping from `/` to `/portfolio` and `/resume` to `/portfolio/resume`.
  - Redirects (301 Permanent):
    - `/portfolio` → `/`
    - `/portfolio/resume` → `/resume`
    - `/portfolio/search` → `/search`
    - `/blog` & `/blog/:slug*` → `/insights` / `/insights/:slug*`
    - `/articles` & `/articles/:slug*` → `/insights` / `/insights/:slug*`
    - `/sitemap-0.xml` → `/sitemap.xml`
- **HTTP Headers & Caching Policies (`next.config.js:133-220`):**
  - Public pages: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
  - Static media (`png|jpg|webp|avif|svg|woff2`): `Cache-Control: public, max-age=2592000, stale-while-revalidate=86400`.
  - API & Feed protection: `X-Robots-Tag: noindex, nofollow`.
  - Admin protection: `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: no-store`.
  - Security headers: CSP, CSP-Report-Only, Reporting-Endpoints, HSTS (`max-age=63072000; includeSubDomains; preload`), COOP (`same-origin`), X-Frame-Options (`DENY`).

### 2.3 Edge Middleware (`middleware.js`)
- Protects administrative pages (`/admin/:path*`) and internal admin endpoints (`/api/admin/:path*`) using NextAuth JWT validation. Unauthenticated requests are redirected to `/admin/login?callbackUrl=...`.
- Implements rate limiting on credential sign-in (`/api/auth/callback/credentials`).

### 2.4 Sitemap & Postbuild Pipeline
- `scripts/generate-sitemap-paths.js` fetches dynamic paths from the live/local API endpoint into `sitemap-paths.json`.
- `next-sitemap-config.js` consumes `sitemap-paths.json` or queries MongoDB directly via Mongoose.
- Dynamic route `pages/sitemap.xml.js` generates sitemaps at runtime on incoming requests with `Cache-Control: public, s-maxage=3600`.
- **Finding:** `STATIC_PAGES` array in `pages/sitemap.xml.js` only lists `/`, `/about`, `/resume`, `/projects`, `/insights`, and `/privacy-policy`. Standalone canonical routes `/services`, `/uses`, and `/contact` are currently omitted from `STATIC_PAGES`.

---

## 3. Asset & Resource Loading Strategy Survey

### 3.1 Font Loading Strategy
- **Current Setup (`pages/_document.js:48-72`):**
  ```html
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Poppins:wght@500;600;700&display=swap" />
  <link id="google-fonts-stylesheet" rel="stylesheet" href="https://fonts.googleapis.com/css2?..." media="print" />
  <script dangerouslySetInnerHTML={{ __html: "document.getElementById('google-fonts-stylesheet').media='all';" }} />
  ```
- **Performance Evaluation:**
  - While the `media="print"` swap script prevents render-blocking CSS, it still requires external DNS lookup, TLS handshake, and font binary downloads from `fonts.googleapis.com` and `fonts.gstatic.com`.
  - External font downloads introduce Flash of Unstyled Text (FOUT) or Cumulative Layout Shift (CLS) when custom font weights replace system fallbacks.
  - **Optimization Opportunity:** Migrate font loading to Next.js 16's `next/font/google` (`Open_Sans` and `Poppins` with `display: 'swap'` and CSS variables). `next/font` downloads and self-hosts font binaries during `next build`, achieving zero external network roundtrips and zero font-related layout shifts via automatic size-adjust CSS fallbacks.

### 3.2 Script Execution & Analytics
- **Google Analytics (`pages/_app.js:239-265`):**
  - Uses `next/script` with `strategy="afterInteractive"`.
  - Configures Google Consent Mode v2 default parameters (`analytics_storage: 'denied'`, `ad_storage: 'denied'`), respecting user privacy and GDPR.
  - Dynamically updates consent state upon cookie banner acceptance (`utils/cookieConsent.js`).
- **Service Worker / PWA (`pages/_app.js:20-27`):**
  - Registers `/service-worker.js` gracefully inside `window.addEventListener('load')` in client environment.

### 3.3 CSS Architecture & Critical Rendering Path
- **Token System (`styles/tokens.css`):**
  - Defines cohesive design tokens for light and dark modes (`--brand-primary: #4573df`, `--bg-page`, `--text-primary`, `--space-4`, `--radius-md`).
- **Theme Flash Prevention (`pages/_document.js:5-20`):**
  - A synchronous inline script (`themeScript`) executes before React hydration, reading `localStorage.getItem('themeMode')` and applying `data-theme` and `backgroundColor` directly to `document.documentElement`. This completely eliminates white/dark Flash of Unstyled Content (FOUC).
- **CSS Modules:** Co-located and route-scoped styles are used across pages (`Search.module.css`, `ServicesPage.module.css`, `UsesPage.module.css`, `CaseCard.module.css`, `AboutPageCommon.module.css`).

---

## 4. Image Optimization & Core Web Vitals (LCP, CLS, INP)

### 4.1 `next/image` vs `OptimizedImage` vs `<img>` Audit

1. **The `OptimizedImage` Bypass Issue (`components/OptimizedImage/OptimizedImage.js:177`):**
   - In `OptimizedImage.js`, line 177 passes:
     ```javascript
     unoptimized={currentIsExternal}
     ```
   - **Critical Problem:** When an image originates from an external domain (e.g. `https://res.cloudinary.com/...` or `https://images.unsplash.com/...`), `currentIsExternal` evaluates to `true`. This causes Next.js to **bypass all image optimization, AVIF/WebP transcoding, and edge resizing** for all external images, even though Cloudinary and Unsplash are explicitly configured in `next.config.js` `remotePatterns`!
   - **Impact:** Heavy full-size original assets are transferred to mobile visitors, increasing Largest Contentful Paint (LCP) and bandwidth consumption.

2. **The Project Card Media Bypass Issue (`components/Projects/Project1.js:39-44`):**
   - In `Project1.js`:
     ```javascript
     const isLocalMedia = /^\/api\/media\//i.test(img);
     return {
       src: isExternal ? img : img.startsWith("/") ? img : `/${img}`,
       unoptimized: isExternal || isLocalMedia,
       fit: project?.imageFit || "cover",
     };
     ```
   - **Critical Problem:** All `/api/media/` and `https://` project cover images are flagged with `unoptimized: true`. As noted in `SMALL_FIXES.md`, unoptimized media files (e.g. 3.4 MB PNGs from MongoDB GridFS) ship uncompressed without resizing, causing severe LCP degradation on project grids.

3. **Legacy `<img>` Elements Detected:**
   - `components/NavBar_Desktop/nav-bar.js:228`: Wordmark uses `<img className={styles.nameIcon} ... />` instead of `<Image>` or inline SVG.
   - `pages/about.js:353 & 408`: Venture logos and timeline organization logos use standard `<img>` tags.
   - `components/Contact/ContactUs.js:436`: Email icon uses `<img ... loading="lazy" />`.

### 4.2 LCP (Largest Contentful Paint) Element Analysis
- **Homepage LCP Element (`PortfolioPictureImage.js`):**
  - Properly uses Next.js `<Image src="/images/portfolio-picture.png" width={imageSize} height={imageSize} priority />`.
  - The `priority` flag ensures `fetchpriority="high"` and preload hints are generated.
- **Article Detail LCP Element (`ArticleDetail.js:256-273`):**
  - Cover image uses `<Image src={coverImage} width={900} height={450} priority placeholder="blur" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 900px, 900px" />`.
  - Properly configured for rapid above-the-fold delivery.

### 4.3 CLS (Cumulative Layout Shift) & Layout Stability
- **Homepage Portrait Shift (`PortfolioPictureImage.js:92-120`):**
  - `const [imageSize, setImageSize] = useState(500);` initializes to 500px during SSR.
  - In `useEffect`, `if (window.innerWidth <= 576) setImageSize(380);` updates state after mount on mobile devices.
  - This causes a post-hydration re-render and dimension shift on mobile viewports.
  - **Remedy:** Use CSS responsive sizing or `<Image fill />` / CSS aspect-ratio container rather than mutating React state based on `window.innerWidth`.
- **Skeleton / Shimmer Placeholders:**
  - `BadgeScroll`, `Footer`, and `ContactSection` are dynamically imported with explicit placeholder min-heights (`minHeight: "120px"`, `minHeight: "200px"`, `minHeight: "400px"`), preventing layout collapse during chunk streaming.

---

## 5. Usability & Accessibility (a11y) Review

### 5.1 Navigation Architecture & Crawler Usability
- **Desktop Navigation Links (`components/NavBar_Desktop/nav-bar.js:176-275`):**
  - Primary menu items (Home, About, Insights, Resume, Projects, Contact) are implemented as `<button onClick={() => handleNavigation(...)}>` elements instead of semantic `<Link href="...">` or `<a href="...">` anchor tags.
  - **Impact:**
    1. Web crawlers (Googlebot, Bingbot, LLM scrapers) cannot discover or follow internal routes via standard HTML `<a href="...">` attributes in the main navigation.
    2. Users cannot middle-click or right-click to "Open in new tab".
    3. Keyboard screen-reader assistive technology announces them as interactive buttons rather than navigation links.
  - **Remedy:** Convert navigation items to `<Link href="/about" className={...}>` with appropriate active classes and focus styles.

- **Mobile Navigation (`components/NavBar_Mobile/NavBar-mobile.js:122-140`):**
  - Similarly renders menu items as `<button onClick={() => handleScrollOrRoute(...)}>` instead of semantic links.

- **SSR Navigation Omission on `/services` and `/uses` (`pages/services.js:9-10, 42-50, 78` and `pages/uses.js:9-10, 18-23, 50`):**
  - `NavBarDesktop` and `NavBarMobile` are imported with `{ ssr: false }`.
  - Condition `{isMobile ? <NavBarMobile /> : <NavBarDesktop />}` evaluates on client mount.
  - **Result:** The initial SSR HTML for `/services` and `/uses` contains zero navigation markup.
  - **Remedy:** Render both navigation components with standard SSR and use CSS media queries (`@media (max-width: 768px)`) to toggle visibility, matching the robust pattern established in `pages/portfolio/index.js`.

### 5.2 Accessibility Landmarks & ARIA Attributes
- **Landmarks:** Proper `<header>`, `<main id="main-content">`, `<nav>`, `<footer>`, `<section aria-labelledby="...">`, `<article>` landmarks are present across major routes.
- **Skip Links:** `<a href="#main-content" className="skip-link">Skip to main content</a>` is present on `/`, `/search`, `/contact`, `/portfolio/resume`.
- **Keyboard Navigation & Focus Management:**
  - Interactive elements support `tabIndex="0"` and `onKeyDown` handlers (`Enter` and `Space` key interception).
  - Search page (`pages/search.js`) includes a semantic `<form role="search">` with `<input type="search" aria-label="Search term" />`.
- **Color Contrast & Theme Adaptation:**
  - Dark mode contrasts: Text `#f3f4f6` and `#e5e7eb` against dark background `#1d2127` achieve > 7:1 contrast ratio (WCAG AAA).
  - Light mode contrasts: Text `#1f2937` against light background `#ffffff` / `#f7f9fc` achieve > 10:1 contrast ratio (WCAG AAA).
  - Accent blue `#4573df` against dark/light backgrounds achieves > 4.5:1 contrast ratio (WCAG AA).

---

## 6. Baseline Build & Diagnostics Verification

### 6.1 Production Build Validation
- Build logs from `build-report.txt` confirm that Next.js static generation and compilation pass cleanly:
  - **Routes generated:** 18 pages (Static SSG + Dynamic SSR/ISR).
  - **First Load JS shared by all:** `119 kB` (framework: 57.8 kB, main: 36.8 kB, `_app`: 18.2 kB).
  - **Page bundle sizes:**
    - `/` (Home): 7.12 kB (First load JS: 176 kB)
    - `/about`: 5.73 kB (First load JS: 128 kB)
    - `/projects`: 4.43 kB (First load JS: 135 kB)
    - `/projects/[slug]`: 2.9 kB (First load JS: 123 kB)
    - `/insights`: 5.84 kB (First load JS: 169 kB)
    - `/insights/[slug]`: 5.35 kB (First load JS: 128 kB)
    - `/privacy-policy`: 4.95 kB (First load JS: 127 kB)
    - `/search`: 2.98 kB (First load JS: 125 kB)
    - `Middleware`: 33.5 kB

### 6.2 ESLint & Static Analysis Findings
From `lint-report.txt` and `build-report.txt`:
1. **`@next/next/no-img-element` Warnings:**
   - `components/Admin/ArticleCard/ArticleCard.js:64`
   - `components/Admin/MediaLibrary/MediaLibrary.js:184, 270, 327`
   - `components/Articles/NewArticleCard.js:30`
   - `components/Contact/ContactUs.js:356, 362`
   - `components/NavBar_Desktop/nav-bar.js:96, 108, 117`
   - `components/Resume/Resume.js:38`
   - `components/Services/ServicesFrame.js:101, 118`
2. **`react-hooks/exhaustive-deps` Warnings:**
   - Unnecessary memo dependencies in `AboutMeSectionLight.js` (`theme` dependency in static useMemos).
   - Missing dependencies or complex expressions in `ArticleForm.js`, `ProjectForm.js`, `CommandPalette.js`, `ImageUploader.js`, `MediaLibrary.js`, and `SavedSearches.js`.
   - Effect ref cleanup warnings in `sbicon.js`, `Languages.js`, `SkillFrame.js`.

---

## 7. Prioritized Optimization Recommendations

### P0 — High Impact (Crawler & Accessibility Correctness)
1. **Convert Desktop & Mobile Navbar `<button>` elements to semantic `<Link>` components:**
   - In `components/NavBar_Desktop/nav-bar.js` and `components/NavBar_Mobile/NavBar-mobile.js`, replace `<button onClick={() => handleNavigation(path)}>` with `<Link href={path} className={...}>`. This enables search crawlers to traverse all primary site routes and restores native browser tab behaviors.
2. **Fix SSR Navigation Delivery on `/services` and `/uses`:**
   - Remove `{ ssr: false }` and `isMobile` JS state gating for `NavBarDesktop` and `NavBarMobile` on `pages/services.js` and `pages/uses.js`. Render both components in the SSR tree and rely on CSS media queries for responsive display.

### P1 — Performance & Core Web Vitals (LCP / CLS)
3. **Remove `unoptimized` Forced Bypass in Image Wrappers:**
   - In `components/OptimizedImage/OptimizedImage.js`, allow Next.js image optimization for domains listed in `remotePatterns` rather than forcing `unoptimized={currentIsExternal}`.
   - In `components/Projects/Project1.js`, optimize local media and supported external CDNs.
4. **Migrate Google Fonts to `next/font/google`:**
   - Replace `<link rel="preload">` in `pages/_document.js` with `next/font/google` (`Open_Sans` and `Poppins`), eliminating external third-party requests and eliminating font layout shift risk.
5. **Eliminate Responsive State Re-render in Hero Image:**
   - In `PortfolioPictureImage.js`, replace `setImageSize(innerWidth <= 576 ? 380 : 500)` with CSS media queries or Next.js `sizes` prop to prevent post-hydration layout shifts on mobile devices.

### P2 — Consistency, Sitemap & SEO Completeness
6. **Synchronize Static Sitemap Routes in `pages/sitemap.xml.js`:**
   - Add `/services`, `/uses`, and `/contact` to the `STATIC_PAGES` array in `pages/sitemap.xml.js` so all public canonical pages are included in the generated XML sitemap.
7. **Sync `public/llms.txt` and `public/llms-full.txt`:**
   - Update `public/llms.txt` to reference `/insights` (instead of `/articles`), and ensure all service and uses descriptions match live canonical endpoints.
8. **Resolve ESLint `@next/next/no-img-element` Warnings:**
   - Replace residual raw `<img>` tags in public components (`AboutPage`, `NavBar_Desktop`, `ContactUs`) with `<Image>` or inline SVGs.
