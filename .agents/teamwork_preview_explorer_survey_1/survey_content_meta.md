# Comprehensive Portfolio Codebase Survey Report: Routing, Metadata, Entity Profiles, & Headings

**Audit Date**: 2026-08-23T01:25:00+05:00  
**Target Codebase**: `e:\MyPortfolio`  
**Inspector**: `teamwork_preview_explorer_survey_1` (Read-Only Explorer)

---

## 1. Executive Summary

This survey provides a technical map of the portfolio codebase at `e:\MyPortfolio`, covering:
- **Routing & Page Architecture**: Mapping all 8 primary public routes (`/`, `/about`, `/projects`, `/services`, `/insights`, `/contact`, `/uses`, `/privacy-policy`) plus `/resume` and dynamic routes (`/projects/[slug]`, `/insights/[slug]`), source files, Next.js rewrite/redirect configurations, layout components, and data fetching strategies (ISR/SSR/Client fallback).
- **Metadata & `<Head>` Implementations**: Exact title tags, meta descriptions, character count audits, canonical URLs, OpenGraph tags, Twitter Card tags, robots directives, structured data (Schema.org JSON-LD), and AI crawler discovery tags (`llms.txt`).
- **Entity & Persona Profile Mapping**: Primary persona (`Ghulam Mujtaba`), verified affiliations (`Megicode`, `CampusAxis`, `MegiLance`, `COMSATS University`, `Appen`), core expertise, certifications, and `sameAs` entity knowledge graphs.
- **Headings & Accessibility Audit**: `<h1>` to `<h3>` hierarchy mapping and image `alt` tag assessment across all routes.
- **Identified Gaps & Optimization Opportunities**: Actionable technical findings for SEO, GEO (Generative Engine Optimization), and sitemap integrity.

---

## 2. Route & Page Structure Architecture

The site runs on Next.js 16 with custom rewrites and 301 redirects configured in `next.config.js`.

### 2.1 Route Mapping Matrix

| Public URL Route | Source File | Data Source & Fetch Method | Key Layout Components | Status / Rewrites |
| :--- | :--- | :--- | :--- | :--- |
| **`/`** (Homepage) | `pages/portfolio/index.js` | ISR (`getStaticProps`, revalidate: 3600) via MongoDB `Project` & `Article` models | `NavBarDesktop`, `NavBarMobile`, `PortfolioPictureImage`, `WelcomeFrame`, `TrustStrip`, `AboutMeSection`, `Languages`, `SkillFrame`, `BadgeScroll`, `ProjectsPreview`, `FounderJourney`, `ArticlesPreview`, `ContactSection`, `Footer` | Internal Rewrite: `/` → `/portfolio` in `next.config.js:71`; 301 redirect `/portfolio` → `/` |
| **`/about`** | `pages/about.js` | Static / `data/about-scraped.json` import | `NavBarDesktop`, `NavBarMobile`, `FounderJourney`, `Tooltip`, `Footer` | Direct Page Route |
| **`/projects`** | `pages/projects.js` | ISR (`getStaticProps`, revalidate: 3600) + Client fallback fetch (`/api/projects`) | `NavBarDesktop`, `NavBarMobile`, `Project1` (CaseCard), `ScrollReveal`, `Footer` | Direct Page Route |
| **`/services`** | `pages/services.js` | Static data array (`servicesList`) | `NavBarDesktop`, `NavBarMobile`, `Footer` | Direct Page Route |
| **`/insights`** | `pages/insights/index.js` | SSR (`getServerSideProps`) / ISR / Client fallback fetch (`/api/articles`) | `NavBarDesktop`, `NavBarMobile`, `ArticleCard`, `Spinner`, `Footer` | Direct Page Route; 301 redirects from `/blog`, `/articles` |
| **`/contact`** | `pages/contact.js` | Static + EmailJS client handler | `NavBarDesktop`, `NavBarMobile`, `ContactSection` (`PlexusCanvas`), `Footer` | Direct Page Route |
| **`/uses`** | `pages/uses.js` | Static data | `NavBarDesktop`, `NavBarMobile`, `Footer` | Direct Page Route |
| **`/privacy-policy`**| `pages/privacy-policy.js` | Static legal text | `NavBarDesktop`, `NavBarMobile`, `Footer` | Direct Page Route |
| **`/resume`** | `pages/portfolio/resume.js` | Static + API `/api/download-resume` | `NavBarDesktop`, `NavBarMobile`, `Resume`, `Footer` | Internal Rewrite: `/resume` → `/portfolio/resume` in `next.config.js:73` |
| **`/projects/[slug]`**| `pages/projects/[slug].js` | ISR (`getStaticPaths` + `getStaticProps`, revalidate: 3600) | `NavBarDesktop`, `NavBarMobile`, `ProjectDetail`, `Footer` | Dynamic Route |
| **`/insights/[slug]`**| `pages/insights/[slug].js` | ISR (`getStaticPaths` + `getStaticProps`, revalidate: 1800) | `NavBarDesktop`, `NavBarMobile`, `ArticleDetail`, `PreviewBanner`, `Footer` | Dynamic Route |

---

## 3. Metadata & `<Head>` Audit Across All Routes

All pages utilize the unified `<SEO>` component (`components/SEO.js`) which injects core meta, OpenGraph, Twitter Cards, canonical links, hreflang tags, DNS hints, favicons, and Schema.org JSON-LD scripts.

### 3.1 Metadata & Title/Description Character Count Audit

| Route | `<title>` Tag | Title Length (Target: <60) | `<meta name="description">` | Description Length (Target: 120-160) | Canonical URL | OpenGraph Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/`** | `Ghulam Mujtaba \| Founder, Megicode & CampusAxis · Full Stack + AI` | **65 chars** (⚠️ 5 chars over) | `Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Specialist. Founder of Megicode and CampusAxis, specializing in Next.js, React, Node.js, and machine learning solutions.` | **183 chars** (⚠️ 23 chars over) | `https://ghulammujtaba.com` | `website` |
| **`/about`** | `About Ghulam Mujtaba \| Full Stack Developer & AI Specialist` | **58 chars** (✅ Optimal) | `Learn about Ghulam Mujtaba, a professional full stack developer, software engineer, and AI specialist. Founder of Megicode and CampusAxis.` | **140 chars** (✅ Optimal) | `https://ghulammujtaba.com/about` | `website` |
| **`/projects`** | `Projects \| Ghulam Mujtaba — Full Stack & AI` | **43 chars** (✅ Optimal) | `Showcase of advanced, modern, and professional projects by Ghulam Mujtaba. Explore software, web, mobile, AI, data science, and UI/UX work.` | **140 chars** (✅ Optimal) | `https://ghulammujtaba.com/projects` | `website` |
| **`/services`** | `Full-Stack Web Development & AI Services \| Ghulam Mujtaba` | **57 chars** (✅ Optimal) | `Hire Ghulam Mujtaba, a professional Next.js full-stack developer and AI/ML specialist based in Pakistan. Offering customized software, chatbots, and APIs.` | **154 chars** (✅ Optimal) | `https://ghulammujtaba.com/services` | `website` |
| **`/insights`** | `Insights \| Ghulam Mujtaba — Software, Data Science & AI` | **55 chars** (✅ Optimal) | `Insights and articles by Ghulam Mujtaba on software engineering, data science, machine learning, AI, and modern web development.` | **129 chars** (✅ Optimal) | `https://ghulammujtaba.com/insights` | `website` |
| **`/contact`** | `Contact Ghulam Mujtaba \| Full Stack Developer & AI Specialist` | **60 chars** (✅ Optimal) | `Contact Ghulam Mujtaba for project inquiries, collaborations, or opportunities. Based in Lahore, Pakistan — available for freelance and full-time work.` | **152 chars** (✅ Optimal) | `https://ghulammujtaba.com/contact` | `website` |
| **`/uses`** | `My Developer Setup & Tech Stack \| Ghulam Mujtaba` | **48 chars** (✅ Optimal) | `What Ghulam Mujtaba uses for software engineering, full-stack web development, and AI coding. Hardware, editor configs, extensions, hosting, and dev tools.` | **157 chars** (✅ Optimal) | `https://ghulammujtaba.com/uses` | `website` |
| **`/privacy-policy`** | `Privacy Policy \| Ghulam Mujtaba Portfolio` | **41 chars** (✅ Optimal) | `Privacy Policy for Ghulam Mujtaba's Portfolio website. Learn how we collect, use, and protect your information.` | **112 chars** (⚠️ 8 chars short) | `https://ghulammujtaba.com/privacy-policy` | `website` |
| **`/resume`** | `Software Engineer Resume \| Ghulam Mujtaba` | **41 chars** (✅ Optimal) | `View the software engineer and full stack developer resume of Ghulam Mujtaba. Explore professional experience in software engineering, AI/ML, and web development skills.` | **166 chars** (⚠️ 6 chars over) | `https://ghulammujtaba.com/resume` | `profile` |

### 3.2 Schema.org JSON-LD Structured Data Implementation

The `components/SEO.js` file contains structured Schema generator functions:

1. **`personSchema()`**:
   - `@type`: `Person` (`@id`: `https://ghulammujtaba.com/#person`)
   - `name`: "Ghulam Mujtaba", `givenName`: "Ghulam", `familyName`: "Mujtaba"
   - `jobTitle`: "Founder & Technical Co-founder · Full Stack + AI"
   - `worksFor`: Megicode (`https://www.megicode.com`)
   - `alumniOf`: COMSATS University Islamabad, Lahore Campus
   - `hasOccupation`: 3 occupations (Founder & Technical Co-founder, Full Stack Developer, AI/ML Engineer)
   - `hasCredential`: 7 verified certifications (Meta Front-End, Google UX, Google Data Analytics, Google Project Management, Google Cybersecurity, Google Advanced Data Analytics, Aspire Harvard Faculty)
   - `sameAs`: 13 external URLs (LinkedIn, GitHub, Instagram, Dev.to, Medium, Megicode, CampusAxis, Topmate, Coursera, Behance, Indie Hackers, Crunchbase, Devpost)
2. **`profilePageSchema()`**:
   - `@type`: `ProfilePage` (`@id`: `https://ghulammujtaba.com/#profilepage`)
   - `mainEntity`: `{ "@id": "https://ghulammujtaba.com/#person" }`
3. **`webSiteSchema()`**:
   - `@type`: `WebSite` (`@id`: `https://ghulammujtaba.com/#website`)
   - `potentialAction`: SearchAction pointing to `https://ghulammujtaba.com/search?q={search_term_string}`
4. **`organizationSchema()`**:
   - `@type`: `Organization` (`@id`: `https://ghulammujtaba.com/#organization`)
5. **`professionalServiceSchema()`**:
   - `@type`: `ProfessionalService` (`@id`: `https://ghulammujtaba.com/#service`)
   - `hasOfferCatalog`: UI & UX Design, Full-Stack Web & Mobile Development, Data Science & AI Solutions
6. **`breadcrumbSchema()`**:
   - `@type`: `BreadcrumbList` for hierarchical navigation on every route.
7. **`faqSchema()`**:
   - `@type`: `FAQPage` with 8 comprehensive Q&As on `/` and 4 Q&As on `/about`.
8. **`speakableSchema()`**:
   - `@type`: `WebPage` with `SpeakableSpecification` targeting CSS selectors `["h1", "#about-section", "[data-speakable]"]`.
9. **`collectionPageSchema()`** & **`softwareProjectSchema()`**:
   - `@type`: `CollectionPage` on `/projects` and `/insights`, plus `@type: SoftwareSourceCode` for individual projects.
10. **`articleSchema()`**:
    - `@type`: `Article` on `/insights/[slug]` with headline, image, wordCount, readingTime, dates, and author linkages.

---

## 4. Entity Profile & Semantic Relationships

### 4.1 Core Entity Profile Matrix

- **Primary Persona**: Ghulam Mujtaba
- **Geographic Entity**: Lahore, Punjab, Pakistan (Asia/Karachi, UTC+5)
- **Academic Credential**: BSc in Software Engineering, COMSATS University Islamabad, Lahore Campus (Graduation: June 2026)
- **Foundational Ventures**:
  1. **Megicode** (`https://www.megicode.com`): Software company / consultancy delivering custom web apps, AI systems, and business platforms.
  2. **CampusAxis** (`https://campusaxis.pk`): University portal and academic resource network serving students across 260+ Pakistani universities.
  3. **MegiLance** (`https://megilance.site`): AI + blockchain freelancing platform featuring smart job matching, AI pricing, and blockchain escrow (Final Year Project).
- **Enterprise Industry Experience**:
  - **Appen** (Oct 2022 – Jul 2025 · 2 yrs 10 mos): AI Data Annotator & LLM Evaluator working on Meta/FANG LLM evaluation, prompt engineering, search relevance, and model quality benchmarking.
- **Top Competencies & Tech Stack**:
  - *Languages*: JavaScript, TypeScript, Python, Java, C++, C, R, HTML5, CSS3
  - *Frameworks & Libraries*: React, Next.js, Node.js, Express, Spring Boot, React Native, Flutter, Electron.js
  - *AI / ML*: TensorFlow, PyTorch, Scikit-learn, OpenCV, Pandas, NumPy, LLM Evaluation, Prompt Engineering, RAG Pipelines, LangChain
  - *Databases & Cloud*: MongoDB Atlas, PostgreSQL, Supabase, Firebase, AWS (S3/EC2/ECS), Vercel, Docker

---

## 5. Heading Structure & Image Alt Text Audit

### 5.1 Heading Hierarchy (H1 / H2 / H3) by Route

| Route | `<h1>` Heading | `<h2>` Section Headings | `<h3>` Item / Card Headings |
| :--- | :--- | :--- | :--- |
| **`/`** | `<motion.h1>` "Hello, I’m GHULAM MUJTABA — Founder of Megicode and CampusAxis..." (`components/welcome/welcome.js:60`) | • "About me" (`SectionHeader`)<br>• "Languages" (`SectionHeader`)<br>• "Capabilities" (`SectionHeader`)<br>• "Certified, then proven by shipping" (`SectionHeader`)<br>• "Certifications" (`.visually-hidden`)<br>• "Products, not just projects" (`SectionHeader`)<br>• "From student pain to shipped products" (`SectionHeader`)<br>• "Product & Engineering Insights" (`SectionHeader`)<br>• "Contact" (`.visually-hidden`) | • Milestone titles in `FounderJourney`<br>• Project titles in `ProjectsPreview` / `Project1`<br>• Article titles in `ArticlesPreview` / `ArticleCard` |
| **`/about`** | `<h1 id="about-hero-title">Ghulam Mujtaba</h1>` (`pages/about.js:222`) | • "My Story"<br>• "From student pain to shipped products" (`FounderJourney`)<br>• "What I’m Building"<br>• "What I Do"<br>• "Experience"<br>• "Education"<br>• "Building something? Hiring someone?" | • Venture names (Megicode, CampusAxis, MegiLance)<br>• Expertise titles (Full-Stack Engineering, AI & Data Science, Design & UX)<br>• Experience titles / Org names<br>• Education degree names |
| **`/projects`** | `<h1 className={styles.heroTitle}>Products I’ve Shipped</h1>` (`pages/projects.js:209`) | • "Platforms, client systems, and AI products — built end to end" (`pages/projects.js:212`) | • Individual project title (`Project1:126`) |
| **`/services`** | `<h1 className={styles.heroTitle}>Software Engineering & AI Development Services</h1>` (`pages/services.js:83`) | • "Full-Stack Web Development"<br>• "Custom AI & Chatbot Development"<br>• "Cross-Platform Mobile Apps"<br>• "Data Science & Analytics"<br>• "Ready to Scale Your Project?" | *(Services structured directly under `<h2>`)* |
| **`/insights`** | `<h1 className={listCss.heroTitle}>Product & Engineering Insights</h1>` (`pages/insights/index.js:283`) | *(Search & filter controls region)* | • Individual article card titles (`ArticleCard:79`) |
| **`/contact`** | `<h1 id="contact-hero-title">Let’s Build Something Together</h1>` (`pages/contact.js:62`) | *(Contact interactive selector & form)* | *(Intent selections and form labels)* |
| **`/uses`** | `<h1 className={styles.usesTitle}>My Workspace & Setup</h1>` (`pages/uses.js:55`) | • "Hardware & Desk Setup"<br>• "Editor & Development Stack"<br>• "Hosting, Databases & SaaS" | • "Laptop & Computing"<br>• "Peripherals & Audio"<br>• "VS Code & Terminal"<br>• "Primary Languages & Frameworks"<br>• "Infrastructure"<br>• "Databases & Third-Party" |
| **`/privacy-policy`** | `<h1 id="privacy-policy-title">Privacy Policy</h1>` (`pages/privacy-policy.js:58`) | • "1. Introduction" to "11. Contact" | *(Section bullet points)* |

### 5.2 Image & Graphic `alt` Attributes Assessment

- **Hero & Profile**:
  - `PortfolioPictureImage.js:151`: `alt="Professional portrait of Ghulam Mujtaba"` (✅ Descriptive)
  - `about.js:246`: `alt="Ghulam Mujtaba"` (✅ Descriptive)
  - `Resume.js:56`: `alt="Ghulam Mujtaba"` (✅ Descriptive)
- **Logos & Badges**:
  - `BadgeScroll.js:126`: `alt={badge.alt}` (e.g., `"Meta Front-End Developer Certificate Badge"`, `"Google Cybersecurity Professional Certificate Badge"`) (✅ Descriptive)
  - `Languages.js:125`: `alt={`${lang.name} icon`}` (✅ Descriptive)
  - `SkillFrame.js:152`: `alt={`${skill.name} icon`}` (✅ Descriptive)
  - `about.js:355`: `alt={`${v.name} logo`}` (✅ Descriptive)
  - `about.js:409/475`: `alt={`${entry.org} logo`}` (✅ Descriptive)
- **Cards & Media**:
  - `Project1.js:107`: `alt={`${project.title || "Project"} screenshot`}` (✅ Descriptive)
  - `ArticleCard.js:52`: `alt={article.title}` (✅ Descriptive)
- **Icons & Decorative SVGs**:
  - `Footer.js:55`: `alt=""` (✅ Decorative monogram)
  - `Footer.js:104,120,136,152`: `alt="Email"`, `alt="LinkedIn"`, `alt="GitHub"`, `alt="Instagram"` (✅ Clean)
  - `gmicon.js:73`: `alt="Theme Icon"` (✅ Clean)
  - `ContactUs.js:438`: `alt=""` (✅ Decorative status icon)

---

## 6. Crawler Assets & Sitemap Consistency Findings

### 6.1 `public/robots.txt`
- Correctly allows all major AI bots (`GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `Claude-Web`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Gemini-Crawl`, `CCBot`, `FacebookBot`, `Omgilibot`, `YouBot`).
- Does **not** disallow `/_next/`, ensuring search engines can load CSS and JS hydration bundles.
- Disallows `/admin/`, `/api/`, and `/search`.
- Points to canonical sitemap: `Sitemap: https://ghulammujtaba.com/sitemap.xml`.

### 6.2 `pages/sitemap.xml.js` & `next-sitemap-config.js` Observation
- In `pages/sitemap.xml.js:9-16`, `STATIC_PAGES` contains:
  - `/`, `/about`, `/resume`, `/projects`, `/insights`, `/privacy-policy`.
  - ⚠️ **Missing from STATIC_PAGES**: `/services`, `/uses`, and `/contact`.
- In `public/llms.txt` and `public/llms-full.txt`:
  - ⚠️ `public/llms.txt:20` links to `https://ghulammujtaba.com/articles` (which 301 redirects to `/insights`). Updating this link directly to `/insights` prevents unnecessary redirect hops for AI scrapers.
  - ⚠️ `public/llms.txt:53` links to `https://www.campusaxis.com` instead of the canonical `https://campusaxis.pk`.

---

## 7. Key Findings & Recommendations for Downstream Agents

1. **Title & Meta Description Optimization (On-Page Agent)**:
   - Adjust homepage `/` title from 65 characters to <60 characters (e.g., `Ghulam Mujtaba · Full Stack Developer & AI Specialist`).
   - Shorten homepage meta description from 183 to ~150 characters.
   - Slightly expand Privacy Policy meta description from 112 to 130-140 characters.
2. **Sitemap Synchronization (AI/Crawler Agent)**:
   - Add `/services`, `/uses`, and `/contact` to `STATIC_PAGES` array in `pages/sitemap.xml.js`.
3. **AI Discovery & LLMs Alignment (GEO/AIO Agent)**:
   - Synchronize `public/llms.txt` and `public/llms-full.txt` to point to `/insights` and `https://campusaxis.pk`.
4. **Structured Data Richness**:
   - Ensure `/uses` route includes enhanced structured data (`WebPage` / `ItemList`) and `/privacy-policy` has complete breadcrumbs.

---
*Report compiled by `teamwork_preview_explorer_survey_1`.*
