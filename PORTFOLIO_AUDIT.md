# Portfolio Complete UI/UX & Code Audit

**Audited By:** AI Code Auditor  
**Date:** February 15, 2026  
**Scope:** All public-facing pages (admin portal excluded)  
**Project:** Next.js 16 + React 19 Portfolio — ghulammujtaba.com

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [P0 — Critical Bugs (Broken Behavior)](#2-p0--critical-bugs-broken-behavior)
3. [P1 — Major UI/UX Issues](#3-p1--major-uiux-issues)
4. [P2 — Design Inconsistencies](#4-p2--design-inconsistencies)
5. [P3 — Performance Problems](#5-p3--performance-problems)
6. [P4 — Accessibility Violations](#6-p4--accessibility-violations)
7. [P5 — SEO & Content Issues](#7-p5--seo--content-issues)
8. [P6 — Code Quality & Maintainability](#8-p6--code-quality--maintainability)
9. [P7 — Modern Design Suggestions (2026 Trends)](#9-p7--modern-design-suggestions-2026-trends)
10. [Page-by-Page Breakdown](#10-page-by-page-breakdown)
11. [Recommended Fixes (Priority Order)](#11-recommended-fixes-priority-order)

---

## 1. Executive Summary

### What's Good
- **Design token system** (`styles/tokens.css`) is well-structured with dark/light themes, spacing scale, shadows, z-index, etc.
- **SEO component** (`components/SEO.js`) is comprehensive: Open Graph, Twitter Card, JSON-LD, hreflang, favicons, etc.
- **Accessibility foundations** exist: ARIA labels, `role` attributes, `prefers-reduced-motion` support, 
- **Error boundaries** and loading states are implemented globally.
- **View Transitions API** integration for page transitions.
- **ScrollReveal** component for scroll-triggered animations.
- **Theme system** (auto/light/dark) with localStorage persistence and system preference detection.
- **PWA support** with service worker and manifest.

### What Needs Work
- **26 bugs/issues** identified across 7 severity levels.
- **Navigation is fragmented** — 3 pages have no desktop nav, 1 page has no nav at all.
- **Search page is completely unstyled** — no nav, no footer, no theme support.
- **4 Google Fonts loaded** — massive performance hit, inconsistent typography.
- **Hard-coded colors everywhere** — the design token system is bypassed on most pages.pefrect i usee the brand hardcored color not chneg color scheme 
- **Inline styles and JSX `<style>` blocks** — 300+ lines of CSS in the projects page alone.
- **Footer social icons are not links** — they're images with `onClick`, breaking accessibility.
- **Multiple duplicate meta tags** — viewport, preconnect, manifest declared in two places.

### Severity Distribution
| Severity | Count | Description |
|----------|-------|-------------|
| P0 | 7 | Broken functionality, users can't use features |
| P1 | 8 | Major UX problems, looks broken |
| P2 | 9 | Design inconsistencies, confusing patterns |
| P3 | 6 | Performance degradation |
| P4 | 7 | Accessibility violations |
| P5 | 6 | SEO/content inaccuracies |
| P6 | 8 | Code quality / maintainability debt |
| P7 | 10 | Modern design improvement suggestions |

---

## 2. P0 — Critical Bugs (Broken Behavior)

### BUG-001: Search Page Has No Navigation, Footer, or Theme Support
**File:** `pages/search.js`  
**Impact:** Users landing on the search page have no way to navigate back to the site. Dark mode users see broken colors.

**Details:**
- No `NavBarDesktop` or `NavBarMobile` imported or rendered.
- No `Footer` component.
- All colors are hardcoded inline: `color: "#555"`, `color: "#444"`, `background: "#f3f4f6"` — these don't change with dark theme.
- The `<main>` has inline margin/padding that doesn't account for nav height.
- Tags use hardcoded `background: "#f3f4f6"` which looks invisible on dark backgrounds.
- Search input and button have no styling at all — uses default browser styling.
- No `useTheme()` hook used — the component is completely theme-unaware.

**Fix:** Add NavBar (desktop + mobile), Footer, use theme context, replace inline colors with design tokens or CSS modules.

---

### BUG-002: Privacy Policy Page Missing Desktop NavBar
**File:** `pages/privacy-policy.js` (line 3)  
**Impact:** On desktop screens (>768px), there is NO navigation whatsoever.

**Details:**
```javascript
// Only imports NavBarMobile — never the desktop version
import NavBar from "../components/NavBar_Mobile/NavBar-mobile";
```
The `NavBarMobile` component has `display: none` by default and only appears at `@media (max-width: 768px)`. So on desktop, users see the privacy policy with absolutely no navigation.

**Fix:** Import and render both `NavBarDesktop` and `NavBarMobile`, matching the pattern used on other pages.

---

### BUG-003: Duplicate `<meta name="viewport">` Tag
**Files:** `pages/_document.js` (line 73) and `pages/_app.js` (line 241)

**Details:**
- `_document.js`: `width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes`
- `_app.js`: `minimum-scale=1, initial-scale=1, width=device-width`

Next.js warns about viewport tags in `_document.js` (should only be in `_app.js`). Having two conflicting viewport declarations can cause unpredictable rendering across browsers.

Also, the `_document.js` version is more correct (allows zooming for accessibility), but the `_app.js` version is what Next.js actually uses.

**Fix:** Remove viewport from `_document.js`. Merge the better values into `_app.js`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=5.0, user-scalable=yes" />
```

---

### BUG-004: Duplicate Preconnect, Manifest, and Theme-Color Tags
**Files:** `pages/_document.js` and `pages/_app.js`

**Both files declare:**
- `<link rel="preconnect" href="https://fonts.googleapis.com" />`
- `<link rel="preconnect" href="https://fonts.gstatic.com" />`
- `<link rel="manifest" href="/manifest.json" />`
- `<meta name="theme-color" ...>` (conflicting values: `#23272F` in `_document.js` vs `#1d2127` in `_app.js`)

**Impact:** Duplicate DOM nodes, confusing for crawlers, inconsistent browser chrome colors.

**Fix:** Keep preconnect/manifest/theme-color only in `_document.js` (they belong there since they should be on every page), remove from `_app.js`.

---

### BUG-005: Resume Page Has No Navigation
**File:** `pages/portfolio/resume.js`  
**Impact:** Users on the resume page have no way to navigate to other pages.

**Details:**
- No NavBar (desktop or mobile) is imported or rendered.
- Only `Footer` and `Resume` component are shown.
- There's a download button but no way to go back to home, projects, etc.
- The entire page is just the `Resume` component and a download link floating in space.

**Fix:** Add both NavBar components with proper sections array.

---

### BUG-006: CTA Buttons on About Page Cause Full Page Reload
**File:** `pages/about.js` (lines 568-582)

**Details:**
```javascript
onClick={(e) => {
  if (document.startViewTransition) {
    e.preventDefault();
    startTransition(() => {
      window.location.href = '/contact';  // FULL PAGE RELOAD!
    });
  }
}}
```

The "Get In Touch" and "View Portfolio" buttons use `window.location.href` inside the view transition callback. This causes a full page reload instead of client-side navigation, losing all React state, and negating Next.js SPA benefits. The loading animation also doesn't trigger because the navigation bypasses the router.

**Fix:** Use `router.push()` instead of `window.location.href`:
```javascript
startTransition(() => {
  router.push('/contact');
});
```

---

### BUG-007: Article & Project Detail "Not Found" States Are Bare
**Files:** `pages/articles/[slug].js` (line 68), `pages/projects/[slug].js` (line 55)

**Details:**
```javascript
if (!article) {
  return <div>Article not found.</div>;
}
```
When article/project is not found:
- No navigation (no NavBar, no Footer)
- No styling (plain unstyled div)
- No theme awareness
- No link to go back
- No search suggestions

The `ProjectDetail` component has a slightly better fallback (line 66-75), but it's inline-styled and still lacks navigation.

**Fix:** Create a proper "not found" state component with navigation, styling, and a back link. Or better yet, return `{ notFound: true }` from `getServerSideProps` and let Next.js handle it via the 404 page (which already has good styling).

---

## 3. P1 — Major UI/UX Issues

### UX-001: Inconsistent Navigation Pattern Across Pages
**Impact:** Users experience different navigation on every page, creating cognitive dissonance.

| Page | Desktop Nav | Mobile Nav | Footer | Skip Nav |
|------|------------|------------|--------|----------|
| Home (`/portfolio`) | ✅ Static import | ✅ Static import | ✅ Dynamic | ✅ |
| About (`/about`) | ✅ Dynamic `ssr:false` | ✅ Dynamic `ssr:false` | ✅ Inside `<main>` | ❌ |
| Projects (`/projects`) | ✅ Static import | ✅ Static + custom logo row | ✅ | ❌ |
| Articles (`/articles`) | ✅ Static import | ✅ Static import | ✅ | ❌ |
| Article Detail | ✅ Dynamic `ssr:false` | ✅ Dynamic `ssr:false` (conditional) | ✅ Dynamic | ❌ |
| Project Detail | ✅ Dynamic `ssr:false` | ✅ Dynamic `ssr:false` (conditional) | ✅ Dynamic | ❌ |
| Privacy Policy | ❌ **MISSING** | ✅ Only NavBarMobile | ✅ | ❌ |
| Search (`/search`) | ❌ **MISSING** | ❌ **MISSING** | ❌ **MISSING** | ❌ |
| Resume (`/portfolio/resume`) | ❌ **MISSING** | ❌ **MISSING** | ✅ | ❌ |
| 404 Page | ❌ By design (OK) | ❌ By design (OK) | ❌ By design (OK) | ❌ |

**Fix Areas:**
1. Add nav to Search, Resume, and Privacy Policy (desktop)
2. Standardize dynamic vs static import pattern
3. Add skip-nav to all pages
4. Footer should consistently be outside `<main>`

---

### UX-002: Mobile Navigation Menu Doesn't Close on Route Navigation
**File:** `components/NavBar_Mobile/NavBar-mobile.js` (lines 22-32)

**Details:**
```javascript
const handleScrollOrRoute = useCallback((sectionOrRoute) => {
  if (sectionOrRoute.startsWith("/")) {
    router.push(sectionOrRoute);
    // Menu stays OPEN during the route transition!
  } else {
    const section = document.getElementById(sectionOrRoute);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);  // Only closes for scroll targets
    }
  }
}, [router]);
```

When a user clicks "Projects" or "Articles" in the mobile menu, the menu stays open while the page navigates. It only closes for in-page scroll targets.

**Fix:** Add `setIsMenuOpen(false)` before or after `router.push()`.

---

### UX-003: Footer Social Icons Are Images, Not Links
**File:** `components/Footer/Footer.js` (lines 59-87)

**Details:**
```javascript
<Image
  className={commonStyles.linkedinIcon}
  alt="LinkedIn"
  src={theme === "dark" ? "/LinkedinDark.svg" : "/linkedin-icon.svg"}
  onClick={onLinkedinIconClick}  // window.open() in a callback
  role="button"
  aria-label="LinkedIn"
  style={{ cursor: "pointer" }}
/>
```

**Problems:**
1. No URL visible in browser status bar on hover
2. No right-click "Open in new tab" context menu
3. Screen readers announce "button", not "link" — confusing since it navigates
4. Keyboard `Tab` may not reach these (no `tabIndex`)
5. Middle-click doesn't open in new tab
6. Not crawlable by search engines

**Fix:** Wrap each `<Image>` in an `<a>` tag:
```javascript
<a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
  <Image src="..." alt="" width={24} height={24} />
</a>
```

---

### UX-004: Home Page Has No Max-Width Container
**File:** `pages/portfolio/index.js`

**Details:**
- All sections have `style={{ width: "100%" }}` but no `max-width`
- On ultrawide monitors (2560px+), content stretches edge-to-edge
- Text lines become extremely long, reducing readability (ideal is 60-80 characters per line)
- The NavBar has no max-width either — buttons spread across the full viewport

**Fix:** Add a container wrapper with `max-width: 1200px` and `margin: 0 auto`.

---

### UX-005: ThemeToggleIcon Renders Before NavBar in Home Header
**File:** `pages/portfolio/index.js` (lines 141-157)

**Details:**
```javascript
<header>
  <ThemeToggleIcon style={{ width: "100%", height: "auto" }} />  {/* This renders FIRST */}
  <nav>
    <NavBarDesktop style={{ width: "100%", height: "80px" }} />
  </nav>
  <nav>
    <NavBarMobile ... />
  </nav>
</header>
```

The `ThemeToggleIcon` component (which is actually the GM icon logo, NOT a theme toggle) renders at full width before the nav. Additionally, there's a separate floating `ThemeToggle` component rendered globally in `_app.js`, so there may be two theme toggles visible.

**Fix:** Re-evaluate whether `ThemeToggleIcon` in the header is needed since the NavBar already has the logo.

---

### UX-006: WelcomeFrame Has Fixed Height
**File:** `pages/portfolio/index.js` (line 172)

```javascript
<WelcomeFrame style={{ width: "100%", height: "400px", ... }} />
```

A fixed 400px height will clip content on smaller screens where the typewriter text wraps to more lines. The welcome section should use `min-height` instead of `height`.

---

### UX-007: Contact Section Email/Phone Use `<p>`/`<div>` Instead of `<a>`
**File:** `components/Contact/ContactUs.js` (lines 310-340)

**Details:**
The email and phone number are rendered as `<p>` and `<div>` elements with `onClick` handlers that trigger `window.location.href = "mailto:..."` and `tel:...`. They use `role="button"` and `cursor: pointer`.

**Problems:**
- Not recognized as links by search engines
- No link preview in browser status bar
- Can't be right-clicked to copy link
- `<p>` with `role="button"` is semantically wrong for a link action
- Phone number uses the deprecated `onKeyPress` instead of `onKeyDown`

**Fix:** Use `<a href="mailto:...">` and `<a href="tel:...">` directly.

---

### UX-008: Contact Form Has a Duplicate Theme Toggle Button
**File:** `components/Contact/ContactUs.js` (lines 357-379)

The contact section renders its own "Light Mode"/"Dark Mode" toggle button. But `_app.js` already renders a global `ThemeToggle` floating button on every page. This means:
- Two theme toggles visible simultaneously
- Different UI styles for the same action
- Confusing for users

**Fix:** Remove the contact section's theme toggle. The global one in `_app.js` suffices.

---

## 4. P2 — Design Inconsistencies

### DES-001: Four Google Fonts Loaded (Typography Chaos)
**File:** `pages/global.css` (lines 1-4)

```css
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
```

**Where each font is used:**
| Font | Used In |
|------|---------|
| Open Sans | NavBar, Footer, 404 page, Welcome section, contact form labels |
| Inter | Design tokens (`--font-sans`), some page body text |
| Poppins | Likely in some component CSS modules (not widely used) |
| Manrope | Only one weight (600), very limited use if any |

**Problems:**
1. **~400-600KB total download** for 4 font families with multiple weights
2. **Render-blocking** via CSS `@import` (worst possible loading method)
3. **Visual inconsistency** — different sections use different typefaces
4. Most of these fonts have similar characteristics (sans-serif, geometric/humanist)

**Fix:**
1. Pick ONE primary font (Inter is the best choice — modern, highly readable, free)
2. Optionally keep ONE display font for headings (Manrope or Poppins, not both)
3. Load via `<link>` in `_document.js` (not CSS `@import`)
4. Use `next/font` for automatic optimization:
```javascript
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

---

### DES-002: Hardcoded Colors Bypass Design Token System
**Impact:** The design tokens in `styles/tokens.css` are excellent but largely unused.

| File | Hardcoded Colors Found |
|------|----------------------|
| `pages/projects.js` | `#1d2127`, `#ffffff`, `#3b82f6`, `#60a5fa`, `#a5b4fc`, `#22223b`, `#4b5563`, `#bbb`, `#eee`, `#23272f`, `#cccccc` |
| `pages/articles/index.js` | `#1d2127`, `#ffffff`, `#22223b`, `#e0e0e0`, `#23272f`, `#eee` |
| `pages/search.js` | `#555`, `#444`, `#f3f4f6`, `#eee` |
| `pages/portfolio/resume.js` | `#272c34`, `#e8ebee`, `#ffffff`, `#000000` |
| `pages/privacy-policy.js` | `#1d2127`, `#ffffff` |
| `pages/portfolio/index.js` | `#1d2127`, `#ffffff`, `#222` (in global style) |
| `components/NavBar_Desktop/nav-bar.module.css` | `#1d2127`, `#f8fafc`, `#e2e8f0`, `#1f2937`, `#4573df` |
| `components/Footer/FooterCommon.module.css` | `"Open Sans"` (should be `var(--font-sans)`) |

**Fix:** Replace ALL hardcoded hex values with CSS custom properties from `tokens.css`. For example:
- `#1d2127` → `var(--bg-page)` (dark) or wrap in theme conditionals
- `#ffffff` → `var(--bg-elevated)` 
- `#4b5563` → `var(--text-secondary)`
- `#3b82f6` → `var(--primary)` pefrectly wiotu misatke nad chngeing major brand colors by mistake not please 

---

### DES-003: Inconsistent Responsive Breakpoints not dertcition do of existing repsoviness i wna make ti repsoivenive by too much difficulty 
**Problem:** At least 7 different breakpoints used across the codebase.

| Breakpoint | Used In | Purpose |
|-----------|---------|---------|
| `480px` | `tokens.css` | Mobile touch targets |
| `560px` | `resume.js` | Download button sizing |
| `576px` | `FooterCommon.module.css` | Footer layout |
| `600px` | `projects.js`, `articles/index.js` | Card grid, hero text |
| `768px` | `global.css`, `NavBarCommon.module.css`, `nav-bar.module.css` | Nav show/hide |
| `800px` | `projects.js` | Nav show/hide (conflicts with 768px!) |
| `900px` | `projects.js` | Grid columns |
| `1024px` | `nav-bar.module.css` | Tablet nav sizing |

**Critical conflict:** The desktop NavBar hides at `768px` (`nav-bar.module.css`), but the Projects page hides it at `800px` (inline JSX style). Between 768-800px, BOTH navbars are hidden!

**Fix:** Define 3-4 standard breakpoints as CSS custom properties:
```css
:root {
  --bp-mobile: 480px;
  --bp-tablet: 768px;
  --bp-desktop: 1024px;
  --bp-wide: 1440px;
}
```

---

### DES-004: Footer Uses Absolute Positioning (Fragile Layout)
**File:** `components/Footer/FooterCommon.module.css`

**Details:**
All footer elements (copyright icon, label, social icons) use `position: absolute` with pixel-based `left`/`right` offsets. This creates:
- Overlap on certain screen sizes
- Copyright text overflow with `text-overflow: ellipsis` on mobile (content cut off)
- Fixed 80px height that can't accommodate wrapped content
- Social icons at fixed positions that clash with copyright text on tablets

**Fix:** Replace with flexbox:
```css
.footerFrame {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  gap: 1rem;
}
.socialIcons {
  display: flex;
  gap: 0.75rem;
}
```

---

### DES-005: Projects Page Has Custom Mobile NavBar Layout
**File:** `pages/projects.js` (lines 169-181)

The Projects page builds its own mobile nav structure with a custom logo row:
```javascript
<div className="show-on-mobile mobile-navbar-container">
  <div className="mobile-navbar-row">
    <div className="mobile-logo-align">
      <Icon name="gmicon" size={32} />
    </div>
    <div className="mobile-hamburger-align">
      <NavBarMobile sections={sections} />
    </div>
  </div>
</div>
```

No other page does this. The Articles page, About page, etc. just render `<NavBarMobile sections={sections} />` directly. This creates a visual difference on mobile between pages.

---

### DES-006: Different Background Color Values for Same Theme
**Problem:** Multiple different hex values used for "dark background":

| Value | Used In |
|-------|---------|
| `#1d2127` | projects.js, portfolio/index.js, privacy-policy.js, nav-bar.module.css |
| `#23272f` | projects.js (dark tag buttons, dark cards), about page sections |
| `#0f1419` | article/project detail pages (gradient start) |
| `#1f2937` | article/project detail pages (gradient middle) |
| `#111827` | article/project detail pages (gradient end) |
| `#0b0f14` | tokens.css `--bg-page` (dark mode) |
| `#181a1b` | PrivacyPolicy.module.css |
| `#272c34` | resume.js |

That's **8 different "dark background" colors**! The design token system defines `--bg-page: #0b0f14` for dark mode, but almost no page actually uses it.

---

### DES-007: Inconsistent Card Elevation/Shadow Patterns
**Problem:** Cards across different sections use visually different elevation levels.

| Component | Shadow |
|-----------|--------|
| Project cards | `box-shadow: 0 8px 32px 0 rgba(60, 60, 100, 0.18)` on hover |
| Article cards | Uses CSS module classes (varies by theme) |
| About page stat cards | No box-shadow, uses `theme === 'dark' ? dark.card : light.card` |
| Privacy Policy sections | `var(--shadow, 0 2px 16px rgba(0, 0, 0, 0.07))` |
| Search page | `borderBottom: "1px solid #eee"` (no cards at all) |

**Fix:** Use the shadow tokens consistently: `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)`.

---

### DES-008: Tag/Filter Buttons Duplicated Across Pages
**Problem:** Projects page and Articles page both define nearly identical tag/filter button styles, but they're implemented differently:

- **Projects:** Inline `<style jsx>` CSS with `.project-tag-btn` class
- **Articles:** Inline `<style jsx>` CSS with `.article-tag-btn` class
- Both have identical styling, hover effects, and dark mode overrides

This is clear code duplication. Should be extracted into a shared component or CSS module.

---

### DES-009: Two Different Mobile/Desktop Detection Methods
**Problem:**
1. **CSS-based:** `.hide-on-mobile` / `.show-on-mobile` classes in `global.css` (768px breakpoint)
2. **JavaScript-based:** `useState` + `window.innerWidth < 768` resize listener in article/project detail pages

The JS approach causes:
- Content flash (wrong nav shows first)
- Extra re-render on mount
- SSR mismatch warnings

**Fix:** Use CSS-only approach consistently. It's more reliable and doesn't cause hydration issues.

---

## 5. P3 — Performance Problems

### PERF-001: Fonts Loaded via Render-Blocking CSS @import
**File:** `pages/global.css` (lines 1-4)

CSS `@import` is render-blocking — the browser must download and parse each font CSS file before rendering ANY content. With 4 fonts, this creates a significant First Contentful Paint (FCP) delay.

**Estimated impact:** +400-800ms to FCP on 3G connections.

**Fix Options (best to worst):**
1. **Best:** Use `next/font` (built-in optimization, self-hosted, no layout shift)
2. **Good:** Use `<link rel="preload">` in `_document.js`
3. **OK:** Use `<link>` in `_document.js` (at least not render-blocking)
4. **Current (worst):** CSS `@import`

---

### PERF-002: All Article Card Images Set to `priority`
**File:** `components/Articles/ArticleCard.js` (line 51)

```javascript
<Image src={img} alt={article.title} fill priority ... />
```

The `priority` prop tells Next.js to preload the image in the `<head>`. When a page has 9 article cards (the default page size), ALL 9 images are preloaded simultaneously. This:
- Blocks other critical resources from loading
- Defeats the purpose of lazy loading
- Can cause significant bandwidth use on mobile

**Fix:** Only set `priority` on the first 1-2 visible images. Use the `index` prop:
```javascript
priority={index < 2}
```

---

### PERF-003: Welcome Section Uses Scroll Event Without IntersectionObserver
**File:** `components/welcome/welcome.js` (lines 25-35)

```javascript
useEffect(() => {
  const handleScroll = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();  // Triggers layout recalculation!
      setInView(rect.top < window.innerHeight && rect.bottom >= 0);
    }
  };
  window.addEventListener("scroll", handleScroll);  // Fires 60+ times per second!
  ...
});
```

`getBoundingClientRect()` triggers a forced synchronous layout recalculation on every scroll event. The `ScrollReveal` component already uses `IntersectionObserver` — the welcome section should too.

---

### PERF-004: Excessive `useEffect` in Articles Page
**File:** `pages/articles/index.js`

The Articles page has **8 separate `useEffect` hooks**, several of which interact with each other:
1. Mount sync
2. Client-side fallback fetch
3. Category sync from URL
4. Search debounce
5. Plus router query tracking via `useMemo`

These create a cascade of re-renders on mount and navigation, especially with the 400ms debounce timer constantly running.

---

### PERF-005: ProjectDetail & ArticleDetail Modify `document.body.style`
**Files:** `components/Projects/ProjectDetail.js` (lines 37-55), `components/Articles/ArticleDetail.js` (lines 88-105)

```javascript
useEffect(() => {
  const body = document.body;
  const html = document.documentElement;
  body.style.background = 'linear-gradient(...)';
  html.style.background = 'linear-gradient(...)';
  ...
});
```

Directly modifying `document.body.style` and `document.documentElement.style` in a component:
- Causes layout thrashing
- Can leak styles to other pages during client-side navigation
- The cleanup function may not run in all edge cases (error boundaries, etc.)
- The gradient is already applied via the parent `<div>` in the page component — duplicating it on both body AND html is unnecessary

---

### PERF-006: Large Inline `<style jsx>` Blocks
**File:** `pages/projects.js` — ~290 lines of inline CSS  
**File:** `pages/articles/index.js` — ~80 lines of inline CSS

Inline `<style jsx>` is compiled at build time but still:
- Increases JavaScript bundle size (CSS is embedded as strings in JS)
- Cannot be cached separately by the browser
- Makes components harder to maintain
- Duplicates globals like `@keyframes fadeInUp`, `@keyframes fadeIn` already defined in `global.css` and `animations.css`

---

## 6. P4 — Accessibility Violations

### A11Y-001: `onKeyPress` is Deprecated (Used in Multiple Places)
**Files:**
- `components/NavBar_Mobile/NavBar-mobile.js` (line 81): `onKeyPress`
- `components/Contact/ContactUs.js` (line 348): `onKeyPress`

`onKeyPress` has been deprecated since React 17 and may be removed in future versions. It also doesn't fire for non-printable keys.

**Fix:** Replace with `onKeyDown`:
```javascript
onKeyDown={(e) => {
  if (e.key === "Enter" || e.key === " ") handleAction();
}}
```

---

### A11Y-002: Mobile Nav Items Are `<li>` with `onClick` (Not Interactive Elements)
**File:** `components/NavBar_Mobile/NavBar-mobile.js` (lines 67-85)

```javascript
<li
  className={...}
  onClick={() => handleScrollOrRoute(section.id || section.route)}
  role="menuitem"
  tabIndex={0}
  onKeyPress={...}
>
  {section.label}
</li>
```

`<li>` is not an interactive element. Even with `role="menuitem"` and `tabIndex={0}`, some assistive technologies may not announce it properly. The ARIA menu pattern also requires specific keyboard handling (arrow keys, Home/End).

**Fix:** Use `<button>` or `<a>` inside the `<li>`:
```javascript
<li role="none">
  <button role="menuitem" onClick={...}>{section.label}</button>
</li>
```

---

### A11Y-003: Skip Navigation Missing on Most Pages
**Current state:** Only `pages/portfolio/index.js` has a skip link:
```javascript
<a href="#main-content" className="skip-link">Skip to main content</a>
```

All other pages (About, Projects, Articles, Search, Privacy Policy, Resume) have no skip link. Keyboard-only users must Tab through the entire navigation on every page.

---

### A11Y-004: Images with `role="button"` in Footer
**File:** `components/Footer/Footer.js`

The `<Image>` components use `role="button"` but they navigate to external URLs. The correct role would be `role="link"`, or better yet, use actual `<a>` tags.

---

### A11Y-005: Contact Form Icons Are `<img>` Tags Without `role`
**File:** `components/Contact/ContactUs.js` (lines 381-391)

```javascript
<img className={...} alt="Email" src="email icon.svg" loading="lazy" />
<img className={...} alt="Phone" src="phone-icon.svg" loading="lazy" />
```

These are decorative icons next to the email/phone text. They should have `alt=""` and `aria-hidden="true"` since the adjacent text already describes the content. Currently, screen readers would announce "Email" and "Phone" redundantly.

Also note: `src="email icon.svg"` has a space in the filename, which can cause issues on some servers.

---

### A11Y-006: ProjectDetail Uses Emojis as Link Icons
**File:** `components/Projects/ProjectDetail.js` (lines 231-233)

```javascript
<span className={baseStyles.linkIcon}>🚀</span>
<span className={baseStyles.linkIcon}>📂</span>
```

Emoji rendering varies across browsers and platforms. Some screen readers read these aloud ("rocket", "open file folder") which may be confusing. Use SVG icons instead for consistency and add `aria-hidden="true"`.

---

### A11Y-007: ArticleCard `role="link"` on `<article>` Element
**File:** `components/Articles/ArticleCard.js` (line 33)

```javascript
<article className={...} role="link" tabIndex={0} onClick={goToDetail} ...>
```

Putting `role="link"` on an `<article>` element overrides its implicit `role="article"`. The entire card becomes announced as a "link" to screen readers, which loses the article landmark semantics. Additionally, there are nested `<Link>` elements inside, creating nested interactive elements.

**Fix:** Either make the card a `<div>` with `role="link"`, or keep the `<article>` semantic and use a CSS-only stretched link technique.

---

## 7. P5 — SEO & Content Issues

### SEO-001: Conflicting Certification Information
**File:** `pages/about.js`

Two different certification arrays with contradicting information:

**Array 1 (line ~91) — `certifications`:**
```javascript
const certifications = [
  'Meta Front-End Developer',
  'Google UX Design',
  'Google Data Analytics',
  'Google Project Management',
  'Google Cybersecurity',
];
```

**Array 2 (line ~173) — `certificationsData`:**
```javascript
const certificationsData = [
  { name: 'Google Cloud Professional Data Engineer', date: '2024' },
  { name: 'Google Data Analytics Certificate', date: '2023' },
  { name: 'Machine Learning Specialization', date: '2023' },
  { name: 'TensorFlow Developer Certificate', date: '2023' }
];
```

These contradict each other. Array 1 mentions "Meta Front-End Developer" and "Google Cybersecurity" which Array 2 doesn't. Array 2 mentions "Machine Learning Specialization" and "TensorFlow Developer Certificate" which Array 1 doesn't. **The FAQ schema sent to Google also cites Array 1 — if Array 2 is more accurate, Google has wrong data.**

---

### SEO-002: Resume Page Fetches from `NEXT_PUBLIC_API_URL` in `getServerSideProps`
**File:** `pages/portfolio/resume.js` (lines 121-129)

```javascript
export async function getServerSideProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume`);
  ...
}
```

`getServerSideProps` runs on the server. Using `NEXT_PUBLIC_API_URL` (the public-facing URL) means:
- The server makes an HTTP request to itself via the public internet
- If `NEXT_PUBLIC_API_URL` isn't set, this crashes
- In production, this adds unnecessary network latency
- Should use the database directly or an internal URL

**Fix:** Import the Resume model and query MongoDB directly:
```javascript
import dbConnect from "../../lib/mongoose";
import Resume from "../../models/Resume";

export async function getServerSideProps() {
  await dbConnect();
  const resume = await Resume.findOne().lean();
  return { props: { resume: JSON.parse(JSON.stringify(resume)) } };
}
```

---

### SEO-003: Twitter Handle May Be Wrong
**File:** `components/SEO.js` (line 38)

```javascript
twitterSite = "@gabormujtaba",
twitterCreator = "@gabormujtaba",
```

Is `@gabormujtaba` the correct Twitter/X handle? It seems like it could be a typo (should it be `@ghulammujtaba` or `@gmujtaba`?).

---

### SEO-004: `og:image:type` Hardcoded as PNG
**File:** `components/SEO.js` (line 71)

```javascript
<meta property="og:image:type" content="image/png" />
```

Not all OG images may be PNG format. The article and project detail pages pass their cover images which could be JPEG, WebP, etc. This should be dynamically determined or removed.

---

### SEO-005: Home Page URL Mismatch
**File:** `pages/portfolio/index.js`

The home page renders at `/portfolio` (or `/portfolio/index`) but all SEO tags reference `https://ghulammujtaba.com` (root). Where is the actual root `/` page? If `next.config.js` has a redirect from `/` to `/portfolio`, the canonical URL should match the final URL. If there's no redirect, the root page may be a 404.

---

### SEO-006: Missing `og:type` for Articles
**File:** `pages/articles/[slug].js`

The article detail page uses the centralized `<SEO>` component but doesn't explicitly set `type="article"`. The default is `type="website"`. For proper Open Graph article parsing, it should be:
```javascript
<SEO type="article" ... />
```

---

## 8. P6 — Code Quality & Maintainability

### CODE-001: EmailJS Credentials Hardcoded in Source
**File:** `components/Contact/ContactUs.js` (lines 103-107)

```javascript
const result = await emailjs.send(
  "service_ewji0vl",      // Service ID - hardcoded
  "template_3kv9gje",     // Template ID - hardcoded
  { user_name: name, ... },
  "LFm2JfW5ThGTsvKYr",   // Public Key - hardcoded
);
```

While EmailJS public keys are meant to be client-side, hardcoding service IDs and template IDs makes it harder to change email providers and exposes your email configuration to anyone viewing the source. Use environment variables:
```javascript
emailjs.send(
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE,
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE,
  { ... },
  process.env.NEXT_PUBLIC_EMAILJS_KEY
);
```

---

### CODE-002: `console.log` / `console.error` Left in Production Code
**Files:**
- `components/Contact/ContactUs.js` (line 106): `console.log("Email sent!", result);`
- `components/Contact/ContactUs.js` (line 111): `console.error("Error sending email:", error);`
- `components/welcome/welcome.js` (line 84): `console.error("Error in animation:", error);`
- `pages/articles/index.js` (line 83): `console.error("Client-side article fetch failed:", err);`

**Fix:** Remove `console.log` calls. For errors, use a proper error reporting service (Sentry, etc.) or at least guard with `process.env.NODE_ENV !== 'production'`.

---

### CODE-003: Mixed Import Patterns (Static vs Dynamic)
**Problem:** Inconsistent use of static imports vs `dynamic()` for the same components:

| Component | Home Page | About | Projects | Articles | Article Detail |
|-----------|----------|-------|----------|----------|---------------|
| NavBarDesktop | Static | Dynamic `ssr:false` | Static | Static | Dynamic `ssr:false` |
| NavBarMobile | Static | Dynamic `ssr:false` | Static | Static | Dynamic `ssr:false` |
| Footer | Dynamic `ssr:false` | Dynamic `ssr:false` | Static | Static | Dynamic `ssr:false` |

**Why it matters:**
- Dynamic `ssr:false` components don't render during SSR → layout shift when they load
- Static imports include the component in the SSR output → no layout shift
- Mixed patterns mean the NavBar layout shifts on About/Article Detail but not on Home/Projects

**Fix:** Pick one approach and apply consistently. For NavBar/Footer, static imports are better (they're above the fold).

---

### CODE-004: `dangerouslySetInnerHTML` Used for Project Descriptions
**Files:**
- `components/Projects/Project1.js` (line 181): `dangerouslySetInnerHTML={{ __html: project?.description || "" }}`
- `components/Projects/ProjectDetail.js` (line 219): `dangerouslySetInnerHTML={{ __html: description }}`

While the content comes from the CMS (admin portal), there's no visible sanitization. If a project description contains `<script>` tags or malicious HTML, it would execute. Use a sanitizer like DOMPurify:
```javascript
import DOMPurify from 'dompurify';
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
```

---

### CODE-005: Inconsistent Error Handling in `getServerSideProps`
**Problem:** Different pages handle SSR errors differently:

| Page | Error Handling |
|------|---------------|
| Projects | Returns `{ projects: [], projectsError: "ssr_failed" }` — client fallback fetch |
| Articles | Returns empty arrays — client fallback fetch |
| Resume | Returns `{ resume: null }` — no fallback |
| Search | No try/catch at all — crash = 500 error |
| Article Detail | Returns `{ notFound: true }` — proper 404 handling |
| Project Detail | Similar to Article Detail |

**Fix:** Standardize error handling with a consistent pattern.

---

### CODE-006: The `sections` Array is Defined Differently Everywhere
**Problem:** The mobile nav `sections` array is defined locally in each page component, with slight variations:

```javascript
// pages/projects.js
const sections = [
  { route: "/#home-section", label: "Home" },
  { route: "/#about-section", label: "About" },
  { route: "/resume", label: "Resume" },
  { route: "/projects", label: "Projects" },
  { route: "/articles", label: "Articles" },
  { route: "/#contact-section", label: "Contact" },
];

// pages/articles/[slug].js
const sections = [
  { label: "Home", route: "/#home-section" },
  { label: "About", route: "/#about-section" },
  { label: "Resume", route: "/resume" },
  { label: "Projects", route: "/projects" },
  { label: "Articles", route: "/articles" },
  { label: "Contact", route: "/#contact-section" },
];

// pages/privacy-policy.js (DIFFERENT items!)
const sections = [
  { label: "Home", route: "/" },
  { label: "Projects", route: "/projects" },
  { label: "Articles", route: "/articles" },
  { label: "Contact", route: "/#contact-section" },
  { label: "Privacy Policy", route: "/privacy-policy" },
];
```

Some use `id` (for scroll targets), some use `route` (for page navigation), some mix both. Some include "About" and "Resume", others don't.

**Fix:** Create a shared `constants/navigation.js` file:
```javascript
export const MAIN_SECTIONS = [
  { label: "Home", route: "/" },
  { label: "About", route: "/#about-section" },
  { label: "Resume", route: "/resume" },
  { label: "Projects", route: "/projects" },
  { label: "Articles", route: "/articles" },
  { label: "Contact", route: "/#contact-section" },
];
```

---

### CODE-007: No TypeScript — Frequent Defensive Null Checks
**Impact:** Without TypeScript, the codebase has excessive defensive checks like:
```javascript
const slug = project?.slug || project?.slug?.toString?.();
typeof p?.slug === "string" ? p.slug : ""
typeof p?.title === "string" && p.title.trim() ? p.title : "Untitled"
```

This makes code harder to read and maintain. TypeScript types would eliminate 90% of these checks.

---

### CODE-008: Commented-Out Code Left in Files
**Files:**
- `next.config.js` (lines 1-23): Entire old config commented out
- `pages/projects.js` (lines 162, 314-317): Commented-out positioning rules
- `pages/portfolio/index.js` (line 19): Commented-out Project import

**Fix:** Remove all commented-out code. Git history preserves old versions if needed.

---

## 9. P7 — Modern Design Suggestions (2026 Trends)

### MODERN-001: Add Scroll-Based Progress Indicator on Detail Pages
**Status:** Already partially implemented in `ProjectDetail.js` and `ArticleDetail.js` (scroll progress bar). But:
- The progress bar is a thin line at the top — consider making it more prominent
- Could add estimated reading time next to the progress

---

### MODERN-002: Add Page Transition Animations Between Routes
**Status:** View Transitions API is integrated but the current animations (fade with slight slide) are very subtle. Consider:
- Different transition types for different navigation directions (forward = slide left, back = slide right)
- Hero image morphing transitions between list → detail pages
- Staggered reveal for list items on navigation

---

### MODERN-003: Add a Command Palette / Search Shortcut
Modern portfolio sites (2025-2026) often have `Cmd+K` / `Ctrl+K` command palettes for quick navigation. Given you already have a search page, this would be a great addition:
- Quick search across projects and articles
- Navigation shortcuts
- Theme switching

---

### MODERN-004: Add Bento Grid Layout for Skills/Stats
The current "Quick Stats" section on the About page uses a simple 4-column grid. A **bento grid** (popularized by Apple in 2023, still trending) would make it more visually engaging:
```
┌──────────────┬──────────┐
│   3+ Years   │ 15+ Proj │
│   AI/ML      │ Delivered│
├──────┬───────┼──────────┤
│  5   │  ∞   │ Featured │
│ Cert │ Growth│ Projects │
└──────┴───────┴──────────┘
```

---


### MODERN-006: Improve the 404 Page
The current 404 page is clean but basic. Modern portfolio 404 pages often include:
- Interactive animation (particle effects, canvas animation)
- Search functionality ("Were you looking for...")
- Recent projects/articles suggestions
- Fun illustration related to your brand

---

### MODERN-007: Add a "Currently Working On" / Status Section
Show what you're currently building or learning. Dynamic, real-time content signals that the portfolio is actively maintained:
- GitHub activity integration
- "Now playing" or "Currently reading" widget
- Live project status indicators

---

### MODERN-008: Replace Typewriter Effect with a More Modern Hero
The character-by-character typewriter animation was popular in 2019-2021. Modern hero sections (2025-2026) use:
- **Morphing text** (smooth transitions between different titles)
- **Split text animations** (words/characters fly in from different directions)
- **Blur reveal** (text goes from blurred to sharp)
- **Gradient text with motion** (animated gradient background on text)

---

### MODERN-009: Add Dark Mode Toggle Animation
The current theme toggle works but the transition is abrupt (just swaps colors). Modern implementations:
- Circular reveal animation (dark mode expands from the toggle button)
- Use View Transitions API for theme switching (already integrated for navigation — extend to theme)
- Smooth color interpolation with CSS transitions (partially implemented via `.theme-transition` class but not widely applied)

---

### MODERN-010: Consider a Blog-Style Article Layout
The current article list page is a basic grid of cards. Consider:
- **Featured article** hero at the top (larger card, more prominent)

---

## 10. Page-by-Page Breakdown

### Home Page (`/portfolio`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐⭐⭐⭐ | Both navbars present, skip link exists |
| Layout | ⭐⭐⭐ | No max-width container, content stretches on wide screens |
| Typography | ⭐⭐ | Mixed fonts (Open Sans nav, Inter body), inconsistent sizing |
| Dark Mode | ⭐⭐⭐⭐ | Theme context works, token-based colors partially used |
| SEO | ⭐⭐⭐⭐⭐ | Comprehensive JSON-LD, Open Graph, Twitter Card |
| Accessibility | ⭐⭐⭐⭐ | Skip link, ARIA labels, visually-hidden headings |
| Performance | ⭐⭐⭐ | 4 fonts loaded, dynamic imports for some components |
| Mobile | ⭐⭐⭐ | Fixed heights may clip, nav pattern OK |
| Animation | ⭐⭐⭐⭐ | ScrollReveal, typewriter (dated), badge scroll |

### About Page (`/about`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐⭐⭐ | Dynamic imports cause layout shift, no skip link |
| Layout | ⭐⭐⭐⭐ | Good card-based sections, stats grid, CTA section |
| Typography | ⭐⭐⭐ | Uses CSS module classes for consistent sizing |
| Dark Mode | ⭐⭐⭐⭐ | Light/dark CSS module variants, proper theme switching |
| SEO | ⭐⭐⭐⭐⭐ | Person schema, FAQ, breadcrumbs, speakable |
| Accessibility | ⭐⭐⭐⭐ | ARIA labels, section headings, tooltip component |
| Performance | ⭐⭐⭐ | Many scroll animation hooks, dynamic imports |
| Mobile | ⭐⭐⭐⭐ | Responsive grids, staggered animations |
| Content | ⭐⭐ | Conflicting certification data, duplicate sections removed but references remain |

### Projects Page (`/projects`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐⭐⭐ | Custom mobile nav layout, 800px breakpoint mismatch |
| Layout | ⭐⭐⭐⭐ | Good grid, tag filtering, hero section |
| Typography | ⭐⭐⭐ | Gradient headline animation is nice but font sizes vary |
| Dark Mode | ⭐⭐ | Many hardcoded hex values in inline styles |
| SEO | ⭐⭐⭐⭐⭐ | CollectionPage, SoftwareSourceCode schemas |
| Accessibility | ⭐⭐⭐ | Article roles, ARIA pressed for filters |
| Performance | ⭐⭐ | 290 lines inline CSS, SVG background, stagger animations |
| Mobile | ⭐⭐⭐ | Responsive grid, proper card sizing |
| Cards | ⭐⭐⭐⭐ | Good card design with image, title, description, tech stack, action buttons |

### Articles Page (`/articles`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐⭐⭐⭐ | Both navbars, proper sections array |
| Layout | ⭐⭐⭐⭐ | Search bar, sort dropdown, category filters, pagination |
| Typography | ⭐⭐⭐ | Skeleton loading is good |
| Dark Mode | ⭐⭐⭐ | Some hardcoded colors in inline styles |
| SEO | ⭐⭐⭐⭐⭐ | CollectionPage schema, breadcrumbs |
| Accessibility | ⭐⭐⭐ | Search/sort have ARIA labels, but category buttons are not buttons |
| Performance | ⭐⭐ | All images have `priority`, 8 useEffects, 400ms debounce |
| Mobile | ⭐⭐⭐⭐ | Good responsive layout |

### Article Detail (`/articles/[slug]`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐⭐⭐ | Dynamic imports, conditional mobile detection |
| Layout | ⭐⭐⭐⭐⭐ | Reading progress, TOC, share buttons, related articles |
| Typography | ⭐⭐⭐⭐ | Good reading experience with proper line heights |
| Dark Mode | ⭐⭐⭐ | Modifies document.body.style directly |
| SEO | ⭐⭐⭐⭐⭐ | Article schema, breadcrumbs, speakable |
| Accessibility | ⭐⭐⭐⭐ | Heading anchors, code block copy, progress bar ARIA |
| Performance | ⭐⭐⭐ | Throttled scroll handler (good), but body style mutation |
| Content | ⭐⭐⭐⭐ | Rich content rendering, estimated read time |

### Project Detail (`/projects/[slug]`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐⭐⭐ | Dynamic imports, conditional mobile detection |
| Layout | ⭐⭐⭐⭐ | Breadcrumbs, gallery, meta tags, action links |
| Dark Mode | ⭐⭐⭐ | Modifies document.body.style directly |
| SEO | ⭐⭐⭐⭐ | CreativeWork, SoftwareSourceCode, breadcrumbs (but uses raw `<Head>` instead of `<SEO>` component) |
| Accessibility | ⭐⭐⭐ | Uses emoji as icons (🚀, 📂), good ARIA on links |
| Content | ⭐⭐⭐⭐ | Share functionality, related projects |

### Search Page (`/search`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐ | **NO navigation, NO footer** |
| Layout | ⭐ | All inline styles, unstyled search input |
| Dark Mode | ⭐ | **COMPLETELY BROKEN** — no theme integration |
| SEO | ⭐⭐⭐⭐ | SearchResultsPage schema, SearchAction |
| Accessibility | ⭐⭐ | `role="search"` on form, but hardcoded colors fail contrast in dark mode |
| Performance | ⭐⭐⭐ | Server-side search with pagination (good architecture) |

### Privacy Policy (`/privacy-policy`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐⭐ | **Missing desktop nav** |
| Layout | ⭐⭐⭐⭐ | Clean card-based sections, good typography |
| Dark Mode | ⭐⭐⭐⭐ | CSS custom properties for theme switching (well done) |
| SEO | ⭐⭐⭐ | Basic meta tags, no JSON-LD |
| Content | ⭐⭐⭐⭐⭐ | Comprehensive, well-organized privacy policy |

### Resume Page (`/portfolio/resume`)
| Aspect | Rating | Notes |
|--------|--------|-------|
| Navigation | ⭐ | **NO navigation** |
| Layout | ⭐⭐⭐ | Resume component + download button |
| Dark Mode | ⭐⭐ | Hardcoded background colors (#272c34, #e8ebee) |
| SEO | ⭐⭐⭐⭐ | Person schema, breadcrumbs |
| Performance | ⭐⭐ | Fetches from NEXT_PUBLIC_API_URL instead of direct DB query |

### 404 Page
| Aspect | Rating | Notes |
|--------|--------|-------|
| Layout | ⭐⭐⭐⭐ | Clean, centered, animated |
| Dark Mode | ⭐⭐⭐⭐ | Proper theme switching with data-theme attribute |
| Animation | ⭐⭐⭐⭐ | Framer Motion entrance animations, logo pop effect |
| Content | ⭐⭐⭐ | Could add search or suggestions |

---

## 11. Recommended Fixes (Priority Order)

### Phase 1: Critical Fixes (Do First)
1. **Add NavBar and Footer to Search page** — with proper theme support and CSS modules
2. **Add Desktop NavBar to Privacy Policy page**
3. **Add NavBar to Resume page**
4. **Remove duplicate viewport/preconnect/manifest meta tags** — keep in `_document.js` only
5. **Fix CTA buttons on About page** — use `router.push()` instead of `window.location.href`
6. **Fix mobile nav menu close** — call `setIsMenuOpen(false)` before `router.push()`
7. **Convert Footer social icons** to proper `<a>` tags

### Phase 2: Design Consistency (Do Next)
8. **Consolidate to 1-2 fonts** — use `next/font` for automatic optimization
9. **Replace all hardcoded colors** with CSS custom properties from `tokens.css`

11. **Extract shared nav sections** — create `constants/navigation.js`
12. **Move inline `<style jsx>` to CSS modules** — especially the 290-line projects page styles
13. **Standardize dynamic vs static imports** — use static imports for NavBar/Footer
14. **Fix duplicate tag filter styles** — extract to shared module

### Phase 3: Performance (Do Before Launch)
15. **Switch font loading** from CSS `@import` to `next/font` or `<link>` in `_document.js`
16. **Fix ArticleCard `priority`** — only first 2 images should be priority
17. **Replace scroll listener** in welcome.js with IntersectionObserver
18. **Remove document.body.style mutations** — use CSS classes instead
19. **Config: Resume SSR should query DB directly** — not fetch from itself

### Phase 4: Accessibility
20. **Replace `onKeyPress`** with `onKeyDown` everywhere
21. **Add skip-nav links** to all pages
22. **Fix mobile nav `<li>` items** — use `<button>` or `<a>` inside
23. **Convert Footer `role="button"`** to proper semantic markup
24. **Fix emoji icons** in ProjectDetail — use SVG icons
25. **Fix ArticleCard `role="link"` on `<article>`**

### Phase 5: SEO & Content
26. **Resolve certification contradictions** on About page
27. **Verify Twitter handle** `@gabormujtaba` 
28. **Fix `og:image:type`** — make dynamic or remove
29. **Use `<SEO>` component** on Project Detail page (instead of raw `<Head>`)
30. **Add `type="article"`** to Article Detail page SEO

### Phase 6: Code Quality
31. **Move EmailJS credentials** to environment variables
32. **Remove `console.log` calls** in production code
33. **Remove commented-out code** from all files
34. **Remove duplicate theme toggle** from Contact section
35. **Sanitize `dangerouslySetInnerHTML`** content with DOMPurify

### Phase 7: Modern Improvements
36. **Replace typewriter** with a more modern hero animation
38. **Add bento grid** for skills/stats section
39. **Enhance 404 page** with search and suggestions
40. **Add micro-interactions** to project cards (tilt, magnetic effect)

---
