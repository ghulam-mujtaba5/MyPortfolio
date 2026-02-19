# Copilot Instructions — MyPortfolio

## Architecture Overview

Next.js 16 (Pages Router) portfolio + CMS deployed on Vercel. MongoDB (Mongoose) backend, Cloudinary for media, NextAuth for admin auth.

**Two routing layers coexist:**
- `pages/portfolio/` — actual page files for Home (`index.js`), Resume, Search
- `next.config.js` rewrites map `/` → `/portfolio` and `/resume` → `/portfolio/resume`
- Public pages: `pages/about.js`, `pages/projects.js`, `pages/articles/`, `pages/privacy-policy.js`
- Admin pages under `pages/admin/` — protected by `middleware.js` (JWT check) + `lib/withAdminAuth.js` (client HOC)
- API routes: `pages/api/` — admin endpoints under `pages/api/admin/` require auth

## Data Fetching Patterns

| Page | Strategy | Why |
|---|---|---|
| `articles/[slug]` | `getStaticProps` + ISR (30min) | High traffic, content rarely changes |
| `projects/[slug]` | `getServerSideProps` | Needs fresh data per request |
| `projects.js` | `getStaticProps` + ISR | Listing page |
| `articles/index` | `getServerSideProps` | Supports search/filter/pagination via query params |
| `portfolio/index` | `getStaticProps` | Homepage |

All DB pages use `lib/mongoose.js` for connection pooling (cached global). Always call `await dbConnect()` before any model query.

## CSS & Theming

- **Design tokens** in `styles/tokens.css` — use CSS variables (`--brand-primary`, `--bg-page`, etc.)
- **Theme** managed by `context/ThemeContext.js` — provides `theme` (`"light"` | `"dark"`) and `mode` (`"auto"` | `"light"` | `"dark"`)
- **Two CSS patterns coexist:**
  - Older portfolio components: separate `ComponentLight.module.css` + `ComponentDark.module.css`, selected via `const s = theme === "dark" ? darkStyles : lightStyles`
  - Admin + newer components: single `.premium.module.css` using `[data-theme="dark"]` selectors
- **New components** should use the `[data-theme]` CSS selector pattern (single file) — see `components/Admin/AdminLayout/AdminLayout.premium.module.css`
- Admin pages additionally import `styles/admin-premium.css` and `styles/admin-design-system.css`

## SEO — Critical Rules

- Every public page **must** use the `<SEO>` component from `components/SEO.js` with `canonical` set to the exact `https://ghulammujtaba.com/...` URL
- JSON-LD schemas are built with helper functions exported from `SEO.js` (`personSchema`, `breadcrumbSchema`, `articleSchema`, etc.) — pass as `jsonLd={[...]}` prop
- `noindex` pages: admin, search, 404 — never add `noindex` to content pages
- Sitemaps: `pages/sitemap.xml.js` (index) → `public/sitemap-0.xml` (static, built at deploy) + `pages/sitemap-dynamic.xml.js` (SSR, includes all static + dynamic pages)
- `robots.txt` is manually managed in `public/robots.txt` — do NOT use `generateRobotsTxt` in next-sitemap

## Validation

- Zod schemas in `lib/validation/schemas.js` for Article and Project forms
- `lib/validation/validator.js` exports `validate(schema)` — wraps API handlers as middleware: `export default validate(mySchema)(handler)`
- Supports both Zod (`.safeParse`) and Joi (`.validateAsync`) schemas

## Key Conventions

- **Navigation sections**: single source of truth at `constants/navigation.js` (`MAIN_SECTIONS`) — used by both desktop and mobile navbars
- **Animations**: use `<ScrollReveal animation="fadeInUp">` from `components/AnimatedUI/ScrollReveal.js`; see `docs/ANIMATIONS_GUIDE.md`
- **Dynamic imports**: heavy components (Footer, NavBars, charts) use `next/dynamic` with `{ ssr: false }`
- **Images**: use Cloudinary URLs for uploaded media; `next.config.js` `images.remotePatterns` must include any new external domain
- **Models**: Mongoose models in `models/` — always check `published: true` in public queries

## Commands

```sh
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (runs postbuild: sitemap generation)
npm run lint         # ESLint
npm test             # Jest + React Testing Library
npm run test:watch   # Jest in watch mode
```

## Environment Variables Required

`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## File References

| Purpose | Path |
|---|---|
| DB connection | `lib/mongoose.js` |
| Auth middleware (edge) | `middleware.js` |
| Auth HOC (client) | `lib/withAdminAuth.js` |
| SEO + JSON-LD helpers | `components/SEO.js` |
| Design tokens | `styles/tokens.css` |
| Zod schemas | `lib/validation/schemas.js` |
| API validation wrapper | `lib/validation/validator.js` |
| All Mongoose models | `models/` |
| Sitemap generation config | `next-sitemap-config.js` |
