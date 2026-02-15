# DEVELOPMENT TASKS — Code Changes Required

> All tasks are code/config level changes for this project.  
> Organized by priority. Each task has the file(s) to edit, what to change, and why.

---

## PRIORITY 1 — CRITICAL (Do First)

---

### TASK 1: Remove Production Source Maps

**File:** `next.config.js` (line 4)  
**What:** Remove `productionBrowserSourceMaps: true` and the webpack source-map devtool  
**Why:** Ships full source maps to every visitor, inflating JS bundle size by ~30-40%. Hurts page load speed and Core Web Vitals (which Google uses for ranking).

```diff
  const nextConfig = {
    reactStrictMode: true,
-   productionBrowserSourceMaps: true,
    turbopack: {},
```

Also remove from the webpack config block (line ~93):

```diff
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
-   if (!isServer) {
-     config.devtool = "source-map";
-   }
    return config;
  },
```

---

### TASK 2: Fix Sitemap — Dynamic Pages Missing on Vercel

**File:** `next-sitemap-config.js` (line 1 and line 31)  
**What:** Remove the `isCI` guard that skips all dynamic article/project URLs during Vercel builds  
**Why:** Your sitemap currently returns ZERO article/project URLs in production. Google literally cannot discover your dynamic content.

```diff
- const isCI = process.env.VERCEL === "1" || String(process.env.CI).toLowerCase() === "true";

  module.exports = {
    siteUrl: "https://ghulammujtaba.com",
    ...
    additionalPaths: async (config) => {
-     if (isCI) {
-       return [];
-     }
      try {
```

**Alternative approach (if DB is not available at build time):**  
Use a build-time script that pre-fetches slugs from your API and writes them to a JSON file, then read that JSON in `additionalPaths` instead of hitting the DB directly.

Create `scripts/generate-sitemap-paths.js`:

```javascript
// Run before build: node scripts/generate-sitemap-paths.js
const fs = require("fs");

async function main() {
  // Fetch from your own API or directly from DB
  const SITE = process.env.SITE_URL || "https://ghulammujtaba.com";
  
  try {
    const [artRes, projRes] = await Promise.all([
      fetch(`${SITE}/api/articles?limit=1000&fields=slug,updatedAt`),
      fetch(`${SITE}/api/projects?limit=1000&fields=slug,updatedAt`),
    ]);
    
    const articles = artRes.ok ? (await artRes.json()).articles || [] : [];
    const projects = projRes.ok ? (await projRes.json()).data || [] : [];

    const paths = [
      ...articles.map(a => ({
        loc: `/articles/${a.slug}`,
        lastmod: a.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
      })),
      ...projects.map(p => ({
        loc: `/projects/${p.slug}`,
        lastmod: p.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
      })),
    ];

    fs.writeFileSync("sitemap-paths.json", JSON.stringify(paths, null, 2));
    console.log(`Wrote ${paths.length} sitemap paths`);
  } catch (e) {
    console.warn("sitemap path generation failed:", e.message);
    fs.writeFileSync("sitemap-paths.json", "[]");
  }
}

main();
```

Then in `next-sitemap-config.js`:

```javascript
additionalPaths: async (config) => {
  try {
    const fs = require("fs");
    const paths = JSON.parse(fs.readFileSync("sitemap-paths.json", "utf-8"));
    return paths.map(p => ({
      loc: `${config.siteUrl}${p.loc}`,
      changefreq: p.changefreq,
      priority: p.priority,
      lastmod: p.lastmod ? new Date(p.lastmod).toISOString() : undefined,
    }));
  } catch {
    return [];
  }
},
```

Update `package.json` scripts:

```diff
  "scripts": {
-   "postbuild": "next-sitemap --config next-sitemap-config.js",
+   "postbuild": "node scripts/generate-sitemap-paths.js && next-sitemap --config next-sitemap-config.js",
  }
```

---

### TASK 3: Add Google Search Console Verification Meta Tag

**File:** `pages/_document.js` (inside `<Head>`)  
**What:** Add the verification meta tag after you get it from Google Search Console  
**Why:** Without this, Google Search Console can't verify you own the site. Without Search Console, you can't submit sitemaps, see indexing errors, or track search performance.

```diff
  <Head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
+   {/* Google Search Console verification — replace with your actual code */}
+   <meta name="google-site-verification" content="YOUR_CODE_FROM_SEARCH_CONSOLE" />
```

**Steps to get the code:**
1. Go to https://search.google.com/search-console
2. Click "Add Property" → enter `https://ghulammujtaba.com`
3. Choose "HTML tag" verification method
4. Copy the `content` value and paste it above
5. Deploy → verify in Search Console → submit sitemap URL: `https://ghulammujtaba.com/sitemap.xml`

---

### TASK 4: Fix Canonical URL Inconsistency

**File:** `components/SEO.js` (line 28) and `pages/portfolio/index.js` (line 108)  
**What:** Make canonical URLs consistent (with or without trailing slash — pick one)  
**Why:** Google treats `ghulammujtaba.com` and `ghulammujtaba.com/` as different URLs. Inconsistency splits ranking signals.

SEO.js default:
```javascript
canonical = "https://ghulammujtaba.com",  // no trailing slash
```

Homepage override:
```javascript
canonical="https://ghulammujtaba.com/"     // trailing slash
```

**Fix — pick NO trailing slash (more conventional) and update the homepage:**

```diff
  // pages/portfolio/index.js
  <SEO
    ...
-   canonical="https://ghulammujtaba.com/"
+   canonical="https://ghulammujtaba.com"
    ...
  />
```

Also search all other pages for canonical URLs and ensure consistency.  
Files to check: `pages/about.js`, `pages/projects.js`, `pages/articles/index.js`, `pages/articles/[slug].js`, `pages/projects/[slug].js`, `pages/portfolio/resume.js`.

---

### TASK 5: Fix Twitter Handle Typo

**File:** `components/SEO.js` (line 32-33)  
**What:** The Twitter handles say `@gabormujtaba` — verify this is correct, or fix to your actual handle  
**Why:** Wrong Twitter handle means social sharing credit goes to the wrong person.

```javascript
twitterSite = "@gabormujtaba",     // Is this correct? Or should it be @ghulammujtaba?
twitterCreator = "@gabormujtaba",
```

---

## PRIORITY 2 — HIGH (Do This Week)

---

### TASK 6: Convert Key Pages from SSR to ISR

**Files:** `pages/portfolio/index.js`, `pages/projects.js`, `pages/articles/index.js`  
**What:** Change `getServerSideProps` to `getStaticProps` with `revalidate`  
**Why:** ISR serves static HTML (instant load, great for Google) and regenerates in the background. SSR makes Google wait for your DB on every crawl.

**Example for `pages/portfolio/index.js`:**

```diff
- export async function getServerSideProps() {
+ export async function getStaticProps() {
    try {
      await dbConnect();
      // ... existing fetch logic ...
      return {
        props: {
          previewProjects: JSON.parse(JSON.stringify(docs)),
          previewArticles: JSON.parse(JSON.stringify(art)),
        },
+       revalidate: 3600, // Regenerate every hour
      };
    } catch (e) {
-     return { props: { previewProjects: [], previewArticles: [] } };
+     return {
+       props: { previewProjects: [], previewArticles: [] },
+       revalidate: 60, // Retry sooner on error
+     };
    }
  }
```

**Example for `pages/projects.js`:**

```diff
- export async function getServerSideProps() {
+ export async function getStaticProps() {
    try {
      // ... existing logic ...
      return {
        props: { projects: ..., projectsError: ... },
+       revalidate: 3600,
      };
    } catch (err) {
      return {
        props: { projects: [], projectsError: ... },
+       revalidate: 60,
      };
    }
  }
```

**For `pages/articles/[slug].js` — needs `getStaticPaths` too:**

```javascript
export async function getStaticPaths() {
  await dbConnect();
  const articles = await Article.find({ published: true }, { slug: 1 }).lean();
  return {
    paths: articles.map(a => ({ params: { slug: a.slug } })),
    fallback: "blocking", // New slugs render on-demand then cache
  };
}

export async function getStaticProps(context) {
  const { params, preview = false, previewData } = context;
  await dbConnect();
  // ... existing article fetch logic ...
  
  // NOTE: Remove the DailyStat view tracking from here
  // (move it to a client-side API call instead — see Task 7)
  
  return {
    props: { article: ..., relatedArticles: ..., preview },
    revalidate: 1800, // 30 min
  };
}
```

**Important:** `getStaticProps` cannot do per-request operations like view tracking. Move view tracking to client-side (Task 7).

---

### TASK 7: Move Article View Tracking to Client-Side API Call

**Files:**  
- `pages/articles/[slug].js` — remove `DailyStat` tracking from SSR  
- `pages/api/track-view.js` — (likely already exists, verify and use)  

**What:** Move the `DailyStat.updateOne()` call from `getServerSideProps` (which won't work in `getStaticProps`) to a client-side `useEffect` that hits an API route.

**In `pages/articles/[slug].js` — add client-side tracking:**

```javascript
useEffect(() => {
  if (article?.slug && !preview) {
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: article.slug, type: "article" }),
    }).catch(() => {}); // fire-and-forget
  }
}, [article?.slug, preview]);
```

**Remove from `getServerSideProps` the `DailyStat.updateOne(...)` block** so it's compatible with `getStaticProps`.

---

### TASK 8: Load Google Analytics Without Cookie Gate (Anonymized)

**File:** `pages/_app.js` (lines ~246-269)  
**What:** Load GA always in anonymized mode; enable full tracking only after cookie consent  
**Why:** Currently you can't see ANY traffic data because GA only loads after cookie consent (which most visitors don't grant).

```diff
  {/* Google Analytics - Production only */}
- {process.env.NODE_ENV === "production" && cookiesAccepted && (
+ {process.env.NODE_ENV === "production" && (
    <>
      <Script
        id="google-analytics"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
-         gtag('config', '${gtag.GA_TRACKING_ID}', {
-           page_path: window.location.pathname,
-           cookie_domain: 'ghulammujtaba.com',
-           cookie_flags: 'SameSite=None; Secure'
-         });
+         gtag('consent', 'default', {
+           analytics_storage: '${cookiesAccepted ? "granted" : "denied"}',
+           ad_storage: 'denied',
+         });
+         gtag('config', '${gtag.GA_TRACKING_ID}', {
+           page_path: window.location.pathname,
+           anonymize_ip: true,
+           cookie_domain: 'ghulammujtaba.com',
+           cookie_flags: 'SameSite=None; Secure'
+         });
        `}
      </Script>
    </>
  )}
```

This uses GA4's **Consent Mode** — it loads always but only uses cookies when consent is granted. You get anonymized pageview counts without cookies.

---

### TASK 9: Add `/blog` Redirect to `/articles`

**File:** `next.config.js` — add to `async rewrites()` or add a new `async redirects()`  
**Why:** "blog" has much higher search volume than "articles". People searching for "ghulam mujtaba blog" should land on your articles page.

```diff
  // next.config.js — add after rewrites()
+ async redirects() {
+   return [
+     {
+       source: "/blog",
+       destination: "/articles",
+       permanent: true,
+     },
+     {
+       source: "/blog/:slug",
+       destination: "/articles/:slug",
+       permanent: true,
+     },
+   ];
+ },
```

---

### TASK 10: Add Cache Headers for Static Pages

**File:** `next.config.js` — `async headers()`  
**What:** Add caching headers for public pages so CDN/browser caches them  
**Why:** Faster repeat visits, reduces server load, improves Google's crawl experience

```javascript
// Add to the headers() array:
{
  source: "/((?!admin|api).*)",
  headers: [
    {
      key: "Cache-Control",
      value: "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  ],
},
```

---

## PRIORITY 3 — MEDIUM (Do This Month)

---

### TASK 11: Create a Services / Hire-Me Page

**File:** Create `pages/services.js` (new file)  
**What:** A page targeting "hire developer" / "freelance developer pakistan" keywords  
**Why:** Converts visitors into clients. This is a high-intent keyword page.

**Minimum content needed:**
- Your services (Web Dev, AI/ML, Data Science, UI/UX)
- Tech stack for each service
- Pricing tiers or "Get a Quote" CTA
- Testimonials if available
- Contact form link
- SEO keywords: "hire full stack developer", "freelance developer pakistan", "next.js developer for hire"

Add navigation link in `constants/navigation.js` and NavBar components.

---

### TASK 12: Create a Uses / Tech Stack Page

**File:** Create `pages/uses.js` (new file)  
**What:** A `/uses` page showing your development setup, tools, hardware  
**Why:** Very popular in developer communities (uses.tech lists thousands). Gets backlinks and traffic from people searching for tool recommendations.

**Content ideas:**
- Editor & extensions (VS Code setup)
- Terminal & CLI tools
- Frameworks you use (Next.js, React, etc.)
- Design tools (Figma, etc.)
- Hosting (Vercel, MongoDB Atlas, Cloudinary)
- Hardware (laptop, monitor, etc.)

---

### TASK 13: Create a Snippets Listing Page

**File:** Create `pages/snippets/index.js` and `pages/snippets/[slug].js`  
**What:** You already have a `models/Snippet.js` model — expose it publicly  
**Why:** Code snippets rank for long-tail searches like "next.js api route example", "mongodb connection string example". Each snippet is a separate indexable page.

---

### TASK 14: Implement Service Worker Caching

**File:** `public/service-worker.js`  
**What:** Currently the service worker does nothing. Add caching strategies.  
**Why:** Improves repeat-visit performance and makes the PWA actually work offline.

```javascript
const CACHE_NAME = "gm-portfolio-v1";
const PRECACHE_URLS = ["/", "/about", "/projects", "/articles"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
      return cached || fetched;
    })
  );
});
```

---

### TASK 15: Add Bing Webmaster Verification

**File:** `pages/_document.js` (inside `<Head>`)  
**What:** Add Bing verification tag  
**Why:** Bing also sends traffic. Free to register at bing.com/webmasters.

```html
<meta name="msvalidate.01" content="YOUR_BING_CODE" />
```

---

### TASK 16: Add RSS Feed for Articles

**File:** Create `pages/feed.xml.js` (new file)  
**What:** Server-rendered RSS feed of your published articles  
**Why:** RSS feeds let people subscribe. Also helps with content syndication and some search engines index RSS directly.

```javascript
import dbConnect from "../lib/mongoose";
import Article from "../models/Article";

export async function getServerSideProps({ res }) {
  await dbConnect();
  const articles = await Article.find({ published: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const base = "https://ghulammujtaba.com";
  const items = articles.map((a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${base}/articles/${a.slug}</link>
      <description><![CDATA[${a.excerpt || a.description || ""}]]></description>
      <pubDate>${new Date(a.createdAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${base}/articles/${a.slug}</guid>
    </item>
  `).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ghulam Mujtaba — Articles</title>
    <link>${base}/articles</link>
    <description>Technical articles on Full Stack Development, AI, Data Science by Ghulam Mujtaba</description>
    <language>en</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Feed() { return null; }
```

Add RSS discovery link in `components/SEO.js`:

```diff
  {canonical && <link rel="canonical" href={canonical} />}
+ <link rel="alternate" type="application/rss+xml" title="Ghulam Mujtaba Articles" href="https://ghulammujtaba.com/feed.xml" />
```

Also add to `public/robots.txt`:

```diff
  Sitemap: https://ghulammujtaba.com/sitemap.xml
+ 
+ # RSS Feed
+ # https://ghulammujtaba.com/feed.xml
```

---

### TASK 17: Add Reading Time & Word Count to Article Model/Display

**File:** `models/Article.js`, article creation API  
**What:** Ensure `readingTime` and `wordCount` fields are computed and stored on save  
**Why:** These appear in JSON-LD structured data (already referenced in `articleSchema`) and improve SERP appearance. Also improves UX — visitors see estimated read time.

---

### TASK 18: Add Structured Data Testing Route (Dev Only)

**File:** Create `pages/api/debug/schema.js` (or similar dev-only route)  
**What:** An endpoint that outputs all JSON-LD schemas for your pages so you can paste into Google's Rich Results Test  
**Why:** Makes it easy to validate your structured data without manually inspecting source. Only enable in development.

---

## PRIORITY 4 — LOW (Nice to Have)

---

### TASK 19: Preload Critical Fonts

**File:** `pages/_document.js`  
**What:** If you're using Google Fonts, add `<link rel="preload">` for the font files  
**Why:** Eliminates FOIT (flash of invisible text). Currently you have `dns-prefetch` but not `preload`.

```html
<link
  rel="preload"
  href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
  as="font"
  type="font/woff2"
  crossOrigin=""
/>
```

---

### TASK 20: Add `X-Robots-Tag` for API Routes

**File:** `next.config.js` — `async headers()`  
**What:** Ensure all API routes return `noindex` header  
**Why:** Prevents Google from accidentally indexing your JSON API responses.

```javascript
{
  source: "/api/:path*",
  headers: [
    { key: "X-Robots-Tag", value: "noindex, nofollow" },
  ],
},
```

---

### TASK 21: Add `<link rel="alternate">` for www vs non-www

**File:** `components/SEO.js`  
**What:** Add alternate link to tell Google that www and non-www are the same  

```html
<link rel="alternate" href="https://www.ghulammujtaba.com" />
```

---

### TASK 22: Implement Open Graph Image Generation

**File:** Create `pages/api/og.js` (or use `@vercel/og`)  
**What:** Dynamically generate OG images per article/project  
**Why:** Custom OG images with the article title, your photo, and branding dramatically increase click-through rates from social media.

```javascript
// pages/api/og.js — using @vercel/og
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Ghulam Mujtaba";

  return new ImageResponse(
    (
      <div style={{ display: "flex", fontSize: 60, background: "#1d2127", color: "white", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", padding: 50 }}>
        <h1>{title}</h1>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

Then in articles: `image={`https://ghulammujtaba.com/api/og?title=${encodeURIComponent(article.title)}`}`

Requires: `npm install @vercel/og`

---

### TASK 23: Add Error Tracking for SEO Issues

**File:** Create `pages/api/seo-check.js` (admin-only endpoint)  
**What:** An endpoint that scans all published articles/projects for SEO issues:
- Missing meta description
- Title too long (> 60 chars) or too short (< 30 chars)  
- Missing cover image / OG image
- Missing slug
- Duplicate slugs
- Body content too short (< 300 words)

**Why:** Helps you maintain content quality before Google indexes bad pages.

---

### TASK 24: Add Sitemap Ping on Content Publish

**File:** In your article/project create/update API routes  
**What:** After publishing content, ping Google & Bing with your sitemap URL  

```javascript
// After successful publish:
await Promise.allSettled([
  fetch("https://www.google.com/ping?sitemap=https://ghulammujtaba.com/sitemap.xml"),
  fetch("https://www.bing.com/ping?sitemap=https://ghulammujtaba.com/sitemap.xml"),
]);
```

**Why:** Tells search engines "hey, I have new content" immediately instead of waiting for their next crawl.
