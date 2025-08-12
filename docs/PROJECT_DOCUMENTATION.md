# MyPortfolio — Technical Documentation

Last updated: 2025-08-12

## 1) Overview
- Purpose: Personal portfolio for Ghulam Mujtaba to showcase profile, projects, skills, and contact.
- Framework: Next.js ^15, React ^19.
- Styling: CSS Modules per component, some global CSS in `pages/global.css`.
- State: Simple Context for theme in `context/ThemeContext.js`.
- SEO: Centralized `components/SEO.js` and strong headers/CSP in `next.config.js`.
- Data: Currently static (hardcoded project entries). MongoDB connectivity verified via `/api/db-ping`.

## 2) Repository Structure
```
MyPortfolio/
  components/        # Reusable UI (Nav, Footer, Sections, Projects, etc.)
  context/           # Theme context (light/dark)
  lib/               # Client libs (MongoDB connection)
  pages/             # Next.js pages (routing)
    api/             # API routes (db-ping available)
    portfolio/       # Main landing pages
    softbuilt/       # Sub-site content
    projects.js      # All projects page (currently static)
    _app.js, 404.js, privacy-policy.js, etc.
  public/            # Static assets
  utils/             # Helpers (currently cookieConsent)
  next.config.js     # Rewrites, headers (CSP), source maps
```

## 3) Pages & Routing
- `pages/portfolio/index.js`: Main portfolio landing. Sections include welcome, about, skills, certifications (BadgeScroll), projects preview, contact, footer.
- `pages/projects.js`: Projects gallery with filters (tags) and rich layout, currently static data.
- `pages/softbuilt/index.js`: Softbuilt subdomain content (served via rewrites).
- `pages/privacy-policy.js` and `pages/PrivacyPolicy.module.css`.
- `pages/api/db-ping.js`: Health check for DB connection.
- `pages/404.js`: Custom 404.
- Rewrites in `next.config.js` route `/:path*` to portfolio or softbuilt based on host.

## 4) Components (high-level)
- Navigation: `components/NavBar_Desktop/`, `components/NavBar_Mobile/` (responsive menus).
- Hero/Profile: `components/welcome/`, `components/profile-picture-desktop/`.
- About: `components/AboutMe/` and `components/AboutMeCompany/` variants.
- Skills: `components/Skills/SkillFrame`.
- Languages: `components/Languages/Languages`.
- Badges/Certs: `components/Badges/BadgeScroll` with themed CSS modules.
- Projects: `components/Projects/` includes `Project1`, preview grid, and CSS modules. Currently uses static array.
- Contact: `components/Contact/ContactUs` with modular styles.
- Footer: `components/Footer/Footer`.
- Icons: `components/Icon/gmicon.js`, `sbicon.js` with CSS.
- Cookie Consent: `components/CookieConsentBanner/`.
- SEO: `components/SEO.js` central meta/OG tags helper.

## 5) Theming & Brand System
- Theme Context: `context/ThemeContext.js` toggles light/dark, persists in `localStorage`, applies `data-theme` to `documentElement`.
- Global fonts in `pages/global.css`: Open Sans, Manrope, Poppins, Inter.
- CSS Modules: Light/Dark variants per component (e.g., `*Light.module.css`, `*Dark.module.css`).
- Branding Proposal:
  - Primary: Indigo 600 `#4f46e5` / Accent Blue 500 `#3b82f6` (already used in gradients/text in some dark mode styles).
  - Neutral: Gray scale from `#111827` to `#f3f4f6`.
  - Success `#10b981`, Warning `#f59e0b`, Danger `#ef4444` for status badges.
  - Typography hierarchy: Poppins (headings), Inter/Open Sans (body). Keep 1.25–1.5 line-height.
  - Spacing scale: 4px base unit.
  - Shadows: subtle elevation only on interactive cards.
  - Focus states: visible outlines meeting WCAG 2.1 AA.

## 6) UX & IA Guidelines
- Navigation: Keep desktop and mobile menus in sync with section anchors and routes (`/projects`, `/resume`).
- Accessibility: Hidden headings are used for sections (`visually-hidden` class). Maintain semantic headings h1–h2–h3.
- Motion: `framer-motion` present (dependency). Use sparingly and prefers-reduced-motion checks.
- Images: Prefer Next.js Image for optimization; currently some components use plain `<img>`.
- Content density: Cards capped ~420px width for readability.
- External links: `rel="noopener noreferrer"` and `target="_blank"` where applicable.

## 7) System Design (Current and Target)
- Current:
  - Static content delivered via Next.js pages; no persistent storage for projects/blogs.
  - MongoDB connection available for future CMS work (`lib/mongodb.js` + `/api/db-ping`).
  - Theming via Context; SEO centralized; CSP headers hardened in `next.config.js`.
- Target (for scale & maintainability):
  - Content Layer: MongoDB collections `projects`, `blogs` with indexes (e.g., `blogs.slug` unique, `projects.featured` boolean, `createdAt`/`updatedAt`).
  - API Layer: Next.js API routes (CRUD) with token-based auth (or NextAuth/JWT for production).
  - Admin UI: `/admin` with protected access to manage content.
  - Caching: ISR or Route Handlers with `revalidate` for read endpoints; client-side SWR for lists.
  - Media: external store (e.g., Cloudinary) for images, store URLs in DB.
  - Observability: structured logs in API routes; integrate with Vercel/LogDrain.

## 8) Performance & SEO
- Next.js `productionBrowserSourceMaps: true` enabled for debugging.
- Headers: CSP/HSTS/COOP/X-Frame/Canonical set in `next.config.js`.
- SEO: Use `components/SEO.js` per page with correct `canonical`, `og:*`, Twitter cards.
- Perf: Code-split heavy components with `next/dynamic` (already used: `BadgeScroll`, `Footer`, `ContactUs`, `Project1`).
- Images: migrate to `next/image` where possible; add `priority` to above-the-fold assets.

## 9) Security
- Never commit secrets. `.env.local` should hold `MONGODB_URI` (and future tokens). Remove credentials from `README.md`.
- Add rate-limiting to API endpoints (e.g., middleware) when CRUD added.
- Sanitize HTML if blogs support rich text; prefer Markdown with a safe renderer.
- CSP already set; update `img-src`/`connect-src` if using external providers.

## 10) Maintainability Standards
- Naming: PascalCase for components, camelCase for functions/vars.
- Module boundaries: Keep present folder convention (component + CSS module colocated).
- Props typing: Consider adding TypeScript for reliability (incremental migration).
- Linting/Format: Add ESLint + Prettier config to enforce consistency.
- Tests: Add Jest/React Testing Library for components; integration tests for API.

## 11) Color Scheme (actual usage)
- Primary: `#4573df`
- Accent (occasional): `#33a552`
- Light backgrounds/text: `#ffffff`, text `#222`/`#333`/`#000`
- Dark backgrounds/text: `#1d2127`, text `#ffffff`/`#e5e5e5`/`#cccccc`
- Links/hover: `#4573df` / `#005bb5`
- Component neutrals: `#e8ebee`, `#272c34`, borders `#e3e6ea`

Note: A centralized tokens system is deferred per current preference. If reintroduced later, it should mirror these exact values to avoid visual drift.

## 12) Deployment
- Vercel recommended. Rewrites configured for hosts in `next.config.js`.
- Environment variables: set in Vercel dashboard (no secrets in repo).
- Analytics: `nextjs-google-analytics` available.

## 13) Backlog & Roadmap
- Phase 1: Clean-up
  - Remove secrets from README; rotate DB password.
  - Add `styles/tokens.css` and refactor key components to tokens.
  - Switch hero/profile images and project thumbnails to `next/image`.
- Phase 2: Projects CMS
  - `pages/api/projects` CRUD + indexes; admin UI for create/update/delete.
  - Wire `pages/projects.js` to API with filters from DB.
- Phase 3: Blog CMS
  - `pages/blogs` listing & `[slug]` pages; Markdown support with MDX or a safe renderer.
  - Admin editor (Markdown/WYSIWYG), draft/publish flow, slug uniqueness.
- Phase 4: Auth & Security
  - Add proper auth (NextAuth/JWT) for admin; rate limiting; audit logging.
- Phase 5: DX & QA
  - TypeScript migration; ESLint/Prettier; Jest + RTL tests; GitHub Actions for CI.

## 14) Contribution Guidelines (Draft)
- Branching: `main` (stable), `develop`, `feature/*`, `fix/*`.
- PRs require: description, screenshots, testing notes.
- Code review focuses: accessibility, performance, security, and tests.

---

For questions or improvements, open an issue or contact via LinkedIn.
