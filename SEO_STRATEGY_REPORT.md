# 🔥 GHULAM MUJTABA PORTFOLIO SEO STRATEGY REPORT

> **Last Updated:** July 17, 2026 | **Target Domain:** ghulammujtaba.com  
> **Status:** Optimized for United States Search Engine Market (USD / English)  

---

> [!IMPORTANT]
> **DEVELOPER AGENTS / BOT GUIDELINES:**
> Do NOT overwrite, modify, or remove any SEO metadata, title tags, meta descriptions, or tags added to files or MongoDB records in this project. These optimizations are tailored based on official SEMrush Pro Keyword Strategy Builder data. Any changes or removals will directly hurt the site's organic search visibility, traffic acquisition, and keyword ranking signals.

---

## 📊 SEMRUSH PRO — TARGET KEYWORD PORTFOLIO

We have mapped the high-priority SEMrush keywords to the corresponding pages, projects, and articles to maximize organic search visibility.

### 📝 Page 1: Ghulam Mujtaba's Resume (`/resume`)
* **Core Topic:** Software Engineer & Full Stack Resume Optimization
* **Total Volume:** 7.6K
* **Average KD:** 22%

| Suggested Keyword | Intent | KD % | Volume |
| :--- | :---: | :---: | :---: |
| `software engineer resume` | Informational | 40% | 2.9K |
| `computer software engineer resume` | Informational | 35% | 880 |
| `full stack developer resume` | Informational | 24% | 590 |
| `software engineering resume` | Informational | 33% | 590 |
| `software developer resume sample` | Informational | 17% | 480 |
| `example of software engineer resume` | Informational | 34% | 480 |
| `full stack software engineer resume skills`| Informational | 10% | 260 |
| `developer resume` | Informational | 32% | 260 |
| `sr software engineer resume` | Informational | 13% | 210 |
| `full stack developer resume sample` | Informational | 3% | 170 |
| `example of software developer resume` | Informational | 24% | 170 |
| `full stack developer resume examples` | Informational | 8% | 140 |
| `software developer cv` | Informational | 29% | 110 |
| `senior software developer resume` | Informational | 14% | 50 |
| `software engineer resume summary` | Informational | 17% | 50 |
| `full stack software engineer resume` | Informational | 25% | 50 |
| `resume examples software developer` | Informational | 18% | 40 |
| `software engineer cv summary` | Informational | 26% | 40 |
| `software engineer example resume` | Informational | 31% | 40 |
| `software engineering resume example` | Informational | 31% | 40 |
| `ai specialist resume` | Informational | N/A | 0 |

---

### 💻 Projects Keyword Mapping (`/projects/:slug`)
Existing projects in the MongoDB database have been enriched with optimized meta titles, descriptions, and tags targeting specific high-intent keyword clusters.

| Project Title | URL Slug | Targeted Keywords & Search Volume |
| :--- | :--- | :--- |
| **MegiLance** | `megilance-ai-blockchain-freelancing-platform-fyp` | `freelance work online` (17.8K) |
| **Megicloth** | `megicloth-e-commerce-platform` | `wholesale fabrics` (2.8K), `quilting fabric online` (13.6K) |
| **Aesthetics Place** | `aesthetics-clinic-website-management-system` | `scheduling software healthcare` (27.8K), `scheduling software for hospitals` (7.9K), `practice management billing software` (490), `clinic management` (310) |
| **PulseFocus** | `pulsefocus-desktop-app` | `productivity tools` (1.8M), `free routine planner app` (150), `activity tracking app` (370) |
| **HealSmart** | `healsmart-mobile-app` | `rx price check` (950), `app that delivers medicine` (220), `my prescription app` (40), `pharmacy delivery apps` (40) |
| **CampusAxis** | `campusaxis-university-portal` | `pakistani university portal` (1.1K), `student platform pakistan` |

---

## 🛠️ IMPLEMENTED CHANGES & DATABASE MIGRATIONS

### 1. Static Metadata Optimizations (Next.js Pages)
The primary meta titles and descriptions in static views were updated to increase Click-Through Rate (CTR) and keyword matching:

* **Resume Page (`pages/portfolio/resume.js`):**
  * **Meta Title:** `Software Engineer Resume | Full Stack Developer & AI Specialist | Ghulam Mujtaba`
  * **Meta Description:** `View the software engineer and full stack developer resume of Ghulam Mujtaba. Explore professional experience in software engineering, AI/ML, and web development skills.`
  * **Content Update (`components/Resume/Resume.js`):** Enriched the `Professional Summary` to naturally include high-volume phrases: `Computer Software Engineer`, `Full Stack Developer`, `full stack software engineer resume skills`, and `software developer cv`.
* **About Page (`pages/about.js`):**
  * **Meta Title:** `About Ghulam Mujtaba | Full Stack Developer & AI Specialist`
  * **Meta Description:** `Learn about Ghulam Mujtaba, a professional full stack developer, software engineer, and AI specialist. Founder of Megicode and CampusAxis.`
* **Homepage (`pages/portfolio/index.js`):**
  * **Meta Title:** `Ghulam Mujtaba | Founder, Megicode & CampusAxis · Full Stack + AI`
  * **Meta Description:** `Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Specialist. Founder of Megicode and CampusAxis, specializing in Next.js, React, Node.js, and machine learning solutions.`
* **Services Page (`pages/services.js`):**
  * **Meta Title:** `Full-Stack Web Development & AI Services | Ghulam Mujtaba`
  * **Meta Description:** `Hire Ghulam Mujtaba, a professional Next.js full-stack developer and AI/ML specialist based in Pakistan. Offering customized software, chatbots, and APIs.`
  * **Focus Keywords:** `hire full stack developer`, `freelance developer pakistan`, `next.js developer for hire`.
* **Uses Page (`pages/uses.js`):**
  * **Meta Title:** `My Developer Setup & Tech Stack | Ghulam Mujtaba`
  * **Meta Description:** `What Ghulam Mujtaba uses for software engineering, full-stack web development, and AI coding. Hardware, editor configs, extensions, hosting, and dev tools.`
  * **Focus Keywords:** `developer setup`, `workspace uses`, `tech stack`.

### 2. Automated Database Updates (MongoDB)
Ran migration scripts (`scripts/update-projects-seo.js` and `scripts/update-articles-seo.js`) to permanently set the `metaTitle`, `metaDescription`, and `tags` fields in the database for 6 project documents and 3 article documents. This ensures SEO tags are rendered dynamically in `<SEO>` on `pages/projects/[slug].js` and `pages/insights/[slug].js`.

### 3. Incremental Static Regeneration (ISR) Conversions
Converted the dynamic route detail pages to ISR to improve page speed and SEO indexing performance:
* **Project Details (`pages/projects/[slug].js`):** Replaced server-side rendering (SSR) with `getStaticPaths` and `getStaticProps` (revalidate: 3600s).
* **Insight Details (`pages/insights/[slug].js`):** Replaced server-side rendering (SSR) with `getStaticPaths` and `getStaticProps` (revalidate: 1800s).
  * Direct view tracking continues client-side via `/api/track-view` fetching.

---

## 📅 FUTURE CONTENT IDEAS (Pages to Create)

Based on the SEMrush Pro list, you can capture significant extra search volume by creating target blog posts or landing pages:

1. **"App that Delivers Medicine" (Volume: 220, KD: 58%)**
   * **Target Slug:** `/insights/top-prescription-pharmacy-delivery-apps`
   * **Focus Keywords:** `app that delivers medicine`, `my prescription app`, `pharmacy delivery apps`.
2. **"AI in Healthcare" (Volume: 77.1K, KD: Low-Medium)**
   * **Target Slug:** `/insights/generative-ai-in-healthcare-clinical-workflows`
   * **Focus Keywords:** `ai in healthcare`, `clinical automation`.
3. **"Full Stack Project Ideas" (Volume: 430, KD: Low)**
   * **Target Slug:** `/insights/full-stack-project-ideas-for-developers-2026`
   * **Focus Keywords:** `full stack project ideas`, `next.js project examples`.
