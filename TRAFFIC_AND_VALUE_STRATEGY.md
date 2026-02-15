# WHY YOUR PORTFOLIO HAS ZERO TRAFFIC — AND HOW TO FIX IT

> **Domain:** ghulammujtaba.com  
> **Stack:** Next.js 16, MongoDB, Vercel  
> **Date of Audit:** February 15, 2026  

---

## EXECUTIVE SUMMARY

Your portfolio is technically well-built — you have proper SEO meta tags, JSON-LD structured data, sitemap, robots.txt, Google Analytics, and a modern Next.js stack. **But technical SEO alone does NOT bring traffic.** Your site is essentially an empty billboard on a deserted road. Here's the brutal truth about why you have zero traffic and exactly what to do about it.

---

## PART 1: WHY YOU HAVE ZERO TRAFFIC (Root Causes)

### 1. NO CONTENT = NO TRAFFIC (The #1 Problem)

Google sends traffic to pages that **answer people's questions**. Your site currently has:

| Page | Google's Perspective |
|------|---------------------|
| Homepage | "A personal page — no reason to rank this" |
| About | "Another personal page — not useful to searchers" |
| Projects | "Project listings — who's searching for your projects?" |
| Resume | "A resume — nobody googles for your resume" |

**Nobody is searching for "Ghulam Mujtaba portfolio"** — zero search volume. Your site has ZERO pages that target things people actually search for.

### 2. ARTICLES SECTION EXISTS BUT IS LIKELY EMPTY OR THIN

You built an entire articles system with slugs, categories, tags, and SSR — but **if you have 0-5 articles, Google has nothing to index**. Articles are your #1 traffic driver and they're underutilized.

### 3. YOUR SITE IS INVISIBLE TO GOOGLE (No Backlinks)

Even if you had great content:
- **Zero backlinks** = Google sees your site as untrustworthy
- No external sites link to you
- No social proof or authority signals
- Domain is relatively new with no reputation

### 4. NO KEYWORD STRATEGY

Your SEO keywords are vanity terms:
```
"Ghulam Mujtaba, Portfolio, Full Stack Developer, Data Scientist, AI, Projects, Resume"
```
Nobody searches for these. You need to target keywords that **real people actually search for**.

### 5. COOKIE CONSENT BLOCKS ANALYTICS

Your Google Analytics **only loads after cookie consent**:
```javascript
{process.env.NODE_ENV === "production" && cookiesAccepted && ( ... )}
```
This means most visitors (who don't accept cookies) are **never tracked**. You literally can't see the little traffic you might be getting.

### 6. ALL PAGES USE getServerSideProps (SSR) INSTEAD OF SSG

Every single page uses `getServerSideProps`. This means:
- Pages are rendered on every request (slower)
- Google may have trouble crawling if your server/DB is slow
- No static HTML for Google to easily cache
- Your CI/Vercel build skips sitemap generation for dynamic pages (`if (isCI) return []`)

**Your sitemap's `additionalPaths` returns `[]` on Vercel builds** — meaning articles and projects ARE NOT IN YOUR SITEMAP. Google can't find them.

---

## PART 2: THE VALUE EQUATION — WHAT MAKES A PORTFOLIO WORTH THE DOMAIN COST

A portfolio domain is worth it when it does **at least one** of these:

| Value Type | How It Works | Your Current State |
|-----------|-------------|-------------------|
| **Job Magnet** | Recruiters find you via Google | ❌ Not happening |
| **Client Pipeline** | Freelance clients find your services | ❌ No services page optimized |
| **Authority Builder** | People read your articles, know your name | ❌ No/few articles |
| **Lead Generator** | People sign up, contact you | ❌ Contact form exists but no traffic |
| **Revenue Source** | Ads, affiliate links, courses, tools | ❌ None |
| **Network Expander** | People share your content, connect with you | ❌ Nothing shareable |

---

## PART 3: THE 90-DAY TRAFFIC ACTION PLAN

### PHASE 1: Content Engine (Weeks 1-4) — THIS IS THE MOST IMPORTANT

**Write 2-3 articles per week targeting keywords people actually search for.**

#### High-Value Article Topics (with real search volume):

**Beginner/Tutorial Content (High Volume):**
1. "How to Build a Portfolio Website with Next.js — Step by Step"
2. "Next.js vs React: Which Should You Learn in 2026?"
3. "How to Connect MongoDB to Next.js (Complete Guide)"
4. "How to Deploy a Next.js App to Vercel (Free)"
5. "React useEffect Explained with Examples"
6. "How to Add Google Analytics to Next.js"
7. "Dark Mode in Next.js — Complete Implementation Guide"
8. "How to Build a REST API with Next.js API Routes"
9. "Framer Motion Animations in React — Beginner Guide"
10. "How to Implement Authentication in Next.js with NextAuth"

**AI/Data Science Content (Growing Niche):**
11. "How to Evaluate LLM Outputs — Practical Guide"
12. "Data Annotation Best Practices for Machine Learning"
13. "Building an AI-Powered App with Next.js and OpenAI API"
14. "Python vs JavaScript for Data Science in 2026"
15. "How to Build Your First Machine Learning Model"

**Career/Industry Content (High Engagement):**
16. "How I Got 5 Google Certifications — My Experience & Tips"
17. "Is a Computer Science Degree Worth It in 2026?"
18. "Software Engineering Internship Guide for Pakistani Students"
19. "How to Build a Freelancing Career as a Developer in Pakistan"
20. "COMSATS University Review — Software Engineering Program"

**Project Deep-Dives (Unique Content):**
21. "How I Built MegiLance — AI-Powered Freelancing Platform"
22. "Building a University Portal from Scratch — CampusAxis"
23. "How I Built a CMS for My Portfolio with Next.js"

#### Article Quality Requirements:
- **Minimum 1500 words** per article
- Include **code snippets** (you're a developer — show code)
- Add **screenshots/diagrams**
- Use **proper headings** (H1 → H2 → H3)
- Include a **table of contents**
- Add **internal links** to your other articles/projects
- End with a **call-to-action** (contact me, check my projects, etc.)

### PHASE 2: Technical Fixes (Weeks 1-2)

#### Fix 1: Sitemap Generation on Vercel

Your sitemap skips dynamic pages on CI. Fix this:

```javascript
// next-sitemap-config.js — Remove the isCI check or use build-time DB
additionalPaths: async (config) => {
  // REMOVE: if (isCI) { return []; }
  // Instead, always generate paths
}
```

**Or better: switch articles/projects to `getStaticProps` + `getStaticPaths` with `revalidate`** (ISR). This gives you:
- Pre-rendered static HTML (faster for Google)
- Automatic sitemap entries at build time
- Better Core Web Vitals scores

#### Fix 2: Google Analytics Without Cookie Gate

For your own analytics visibility, use a privacy-respecting approach:

```javascript
// Load GA always but in anonymized mode, full tracking only with consent
gtag('config', GA_TRACKING_ID, {
  anonymize_ip: true,
  page_path: window.location.pathname,
});
```

#### Fix 3: Add Google Search Console

**This is CRITICAL and you may not have done it:**
1. Go to https://search.google.com/search-console
2. Add property: `ghulammujtaba.com`
3. Verify ownership (DNS TXT record or HTML file)
4. Submit your sitemap: `https://ghulammujtaba.com/sitemap.xml`
5. Check "Coverage" → see what Google actually indexed

**Without Search Console, you're flying blind.** This is free and essential.

#### Fix 4: Add Google Search Console Verification

Add to your `_document.js` or SEO component:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

#### Fix 5: Fix Canonical URLs

Your homepage canonical has a trailing slash inconsistency:
- SEO component default: `canonical = "https://ghulammujtaba.com"` (no slash)
- Homepage override: `canonical="https://ghulammujtaba.com/"` (with slash)

Pick one and be consistent everywhere. Google treats these as different URLs.

#### Fix 6: Switch Key Pages to ISR (Incremental Static Regeneration)

```javascript
// Instead of getServerSideProps, use:
export async function getStaticProps() {
  // ... fetch data
  return {
    props: { ... },
    revalidate: 3600, // Regenerate every hour
  };
}
```

This makes pages load instantly (static HTML) and still stay fresh.

### PHASE 3: Off-Page SEO & Distribution (Weeks 2-8)

#### Backlink Building Strategy:

1. **Dev.to / Hashnode / Medium** — Cross-post your articles there (with canonical URL pointing to YOUR site). This gets:
   - Immediate traffic from their audience
   - Backlinks to your domain
   - SEO juice from high-authority domains

2. **GitHub Profile README** — Add your website link prominently
   
3. **LinkedIn Articles** — Share every article on LinkedIn with a link back

4. **Stack Overflow** — Answer questions related to your expertise, with relevant links

5. **Reddit** — Share in r/webdev, r/nextjs, r/learnprogramming, r/pakistan (where appropriate)

6. **Pakistani Developer Communities** — Post in Facebook groups, Discord servers

7. **Product Hunt** — Launch your projects (MegiLance, CampusAxis)

8. **Hacker News** — Submit genuinely interesting technical articles

### PHASE 4: Social Proof & Authority (Ongoing)

1. **Add testimonials** from clients/colleagues to your homepage
2. **Add a "Featured In" section** if you've been mentioned anywhere
3. **Add view counts/read times** to articles (you already track DailyStat!)
4. **Open source contributions** — contribute to popular repos, link from your site
5. **Speaking/writing** — guest posts on established tech blogs

---

## PART 4: TECHNICAL IMPROVEMENTS FOR SEO PERFORMANCE

### Critical Issues Found in Code:

| Issue | Severity | Impact |
|-------|----------|--------|
| Sitemap empty on Vercel (isCI check) | 🔴 Critical | Google can't find your dynamic pages |
| All pages SSR (no ISR/SSG) | 🟡 High | Slower page load, harder for Google to crawl |
| GA gated behind cookie consent | 🟡 High | You can't see your own traffic |
| Canonical URL inconsistency | 🟡 Medium | Potential duplicate content signals |
| `productionBrowserSourceMaps: true` | 🟡 Medium | Larger JS bundles, slower load |
| No `<link rel="alternate">` for www | 🟢 Low | Minor duplication risk |

### Performance Optimizations:

1. **Remove `productionBrowserSourceMaps: true`** — this ships source maps to users, increasing bundle size
2. **Lazy-load below-fold components** — you're already doing this with `dynamic()`, good
3. **Optimize images** — ensure all project/article images use Next.js `<Image>` with proper `width`/`height`
4. **Add `loading="lazy"` to non-critical images**
5. **Preload critical fonts** instead of just dns-prefetch

### Missing Pages That Would Help SEO:

| Page | Why It Helps |
|------|-------------|
| `/blog` (redirect to `/articles`) | "Blog" is a higher-volume search term |
| `/services` | If you freelance — people search for services |
| `/hire-me` or `/work-with-me` | Direct CTA for potential clients |
| `/tools` or `/resources` | Shareable resource pages attract backlinks |
| `/uses` (tech stack page) | Popular in developer communities |
| `/snippets` (you have a Snippet model!) | Useful micro-content that ranks for long-tail queries |

---

## PART 5: MONETIZATION STRATEGIES (Making the Domain Pay for Itself)

### Short-term (1-3 months):
1. **Freelance client pipeline** — optimize for "hire Next.js developer Pakistan" type searches
2. **Affiliate links in articles** — Vercel, MongoDB Atlas, Cloudinary, hosting providers
3. **Sponsored content** — once you have traffic, companies pay for mentions

### Medium-term (3-6 months):
4. **Digital products** — sell Next.js templates, starter kits, or mini-courses
5. **Newsletter** — build an email list through your articles
6. **Consulting calls** — offer paid 1:1 sessions (Calendly link on site)

### Long-term (6-12 months):
7. **Online course** — package your knowledge into a Udemy/own-platform course
8. **SaaS products** — build small tools that solve a problem (your projects like MegiLance)
9. **Job offers** — top portfolios attract recruiter attention

---

## PART 6: WHAT TOP ENGINEERS' PORTFOLIOS DO (That You're Missing)

| Feature | Top Engineers | You |
|---------|--------------|-----|
| Regular blog with 50+ articles | ✅ | ❌ Likely 0-5 articles |
| Open source projects with stars | ✅ | ❌ No popular repos |
| Active on Twitter/X with followers | ✅ | ❌ Little social presence |
| Guest posts on major blogs | ✅ | ❌ |
| Conference talks / YouTube | ✅ | ❌ |
| Newsletter with subscribers | ✅ | ❌ |
| Strong GitHub profile | ✅ | ❔ Unknown |
| Backlinks from authority sites | ✅ | ❌ Zero backlinks |
| Content that solves real problems | ✅ | ❌ Only personal showcase |

### Examples of Portfolios That Get Traffic:
- **Lee Robinson** (leerob.io) — VP of Vercel, writes about Next.js
- **Josh Comeau** (joshwcomeau.com) — Interactive tutorials
- **Dan Abramov** (overreacted.io) — Deep React articles
- **Kent C. Dodds** (kentcdodds.com) — Testing, React, courses

**What they ALL have in common: Massive amounts of high-quality, useful content.**

---

## PART 7: IMMEDIATE ACTION ITEMS (Do These TODAY)

### Priority 1 — This Week:
- [ ] **Set up Google Search Console** and submit sitemap
- [ ] **Fix sitemap generation** so articles/projects appear
- [ ] **Write your first high-value article** (pick from the list above)
- [ ] **Remove `productionBrowserSourceMaps: true`** from next.config.js
- [ ] **Fix canonical URL inconsistency**

### Priority 2 — This Month:
- [ ] Write 8-12 articles targeting real keywords
- [ ] Cross-post articles to Dev.to and Hashnode (with canonical back to your site)
- [ ] Share every article on LinkedIn
- [ ] Add Google Search Console verification meta tag
- [ ] Switch top pages to ISR (`getStaticProps` + `revalidate`)
- [ ] Create a `/services` or `/hire-me` page

### Priority 3 — Next 3 Months:
- [ ] Build up to 30+ articles
- [ ] Get backlinks from at least 10 external sites
- [ ] Start a newsletter
- [ ] Launch MegiLance on Product Hunt
- [ ] Contribute to popular open source projects
- [ ] Guest post on at least 2 established tech blogs

---

## PART 8: THE HARD TRUTH

**Your portfolio's code quality is actually very good.** The SEO component is comprehensive, JSON-LD is well-implemented, the architecture is solid. But:

> **A technically perfect website with no content is like a Ferrari with no fuel.**

The domain cost (~$10-15/year) is trivial. The real investment is **your time writing content**. If you commit to writing 2-3 quality articles per week for 3 months, you will:

1. Start ranking on Google within 2-3 months
2. Get 500-2000 monthly visitors within 6 months
3. Establish yourself as a known name in your niche
4. Attract recruiters and freelance clients
5. Have a portfolio that actually differentiates you from other engineers

**Without content, no amount of technical SEO optimization will save you.** The content IS the product. Everything else is infrastructure.

---

## QUICK WINS CHECKLIST

```
✅ Already done well:
  - SEO component with meta tags, OpenGraph, Twitter Cards
  - JSON-LD structured data (Person, ProfilePage, FAQ, etc.)
  - Sitemap infrastructure
  - robots.txt
  - Google Analytics integration
  - PWA manifest
  - Security headers
  - Dark/light theme
  - Mobile responsive
  - Image optimization config

❌ Missing / Broken:
  - Sitemap returns empty on Vercel deployment
  - Google Search Console not set up (probably)
  - Zero content / articles
  - No keyword strategy
  - No backlinks
  - No social distribution
  - No services/hire page
  - GA blocked by cookie consent (can't track yourself)
  - All pages SSR instead of ISR
  - Source maps shipped to production
  - No Open Graph image actually exists at /og-image.png (verify this!)
```

---

*This analysis is based on a full codebase audit. The #1 action item is: START WRITING ARTICLES. Everything else is secondary.*
