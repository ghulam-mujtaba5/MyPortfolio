# Milestone 1: On-Page Metadata & Entity Calibration Analysis

**Agent**: `teamwork_preview_explorer_m1_1`  
**Milestone**: M1 (On-Page Metadata & Entity Calibration)  
**Authority**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`, `TEST_READY.md`  
**Date**: 2026-08-23  

---

## 1. Executive Summary

A comprehensive forensic audit of all 8 canonical routes (`/`, `/about`, `/projects`, `/services`, `/insights`, `/contact`, `/uses`, `/privacy-policy`) and shared SEO components (`components/SEO.js`, `components/welcome/welcome.js`) was performed.

### Core Findings
1. **Title Length Violations (2 routes)**:
   - `/` (`pages/portfolio/index.js`): Currently **65 chars** (limit: $< 60$). Title: `"Ghulam Mujtaba | Founder, Megicode & CampusAxis · Full Stack + AI"`.
   - `/contact` (`pages/contact.js`): Currently **61 chars** (limit: $< 60$). Title: `"Contact Ghulam Mujtaba | Full Stack Developer & AI Specialist"`.
2. **Meta Description Length Violations (2 routes)**:
   - `/` (`pages/portfolio/index.js`): Currently **187 chars** (limit: $120 - 160$). Description: `"Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Specialist. Founder of Megicode and CampusAxis, specializing in Next.js, React, Node.js, and machine learning solutions."`.
   - `/privacy-policy` (`pages/privacy-policy.js`): Currently **111 chars** (limit: $120 - 160$). Description: `"Privacy Policy for Ghulam Mujtaba's Portfolio website. Learn how we collect, use, and protect your information."`.
3. **Fully Compliant Routes (4 routes)**:
   - `/about` (Title: 59 chars, Description: 138 chars)
   - `/projects` (Title: 43 chars, Description: 139 chars)
   - `/services` (Title: 57 chars, Description: 154 chars)
   - `/insights` (Title: 55 chars, Description: 128 chars)
   - `/uses` (Title: 48 chars, Description: 155 chars)
4. **Heading Hierarchy (H1) Parity**:
   - Every one of the 8 routes has **exactly 1 `<h1>` heading** tag (100% compliant).
5. **Canonical URLs, OpenGraph & Twitter Cards**:
   - All 8 routes define valid absolute canonical URLs pointing to `https://ghulammujtaba.com<route>`.
   - `components/SEO.js` automatically renders `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, and `twitter:image`.

---

## 2. Route-by-Route Metadata & Heading Audit Table

| # | Route Path | Component File | Current Title (Len) | Target Title (Len) | Current Description (Len) | Target Description (Len) | Canonical URL | H1 Heading (Count) | Status |
|---|------------|----------------|---------------------|--------------------|----------------------------|--------------------------|---------------|-------------------|--------|
| 1 | `/` | `pages/portfolio/index.js` | `Ghulam Mujtaba \| Founder, Megicode & CampusAxis · Full Stack + AI` (65) | `Ghulam Mujtaba · Full Stack Developer & AI Specialist` (53) | `Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Specialist. Founder of Megicode and CampusAxis, specializing in Next.js, React, Node.js, and machine learning solutions.` (187) | `Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Engineer specializing in Next.js, React, Node.js, and production machine learning solutions.` (158) | `https://ghulammujtaba.com` | `Hello, I’m GHULAM MUJTABA...` (1) | ⚠️ Fix M1 |
| 2 | `/about` | `pages/about.js` | `About Ghulam Mujtaba \| Full Stack Developer & AI Specialist` (59) | Retain (59) | `Learn about Ghulam Mujtaba, a professional full stack developer, software engineer, and AI specialist. Founder of Megicode and CampusAxis.` (138) | Retain (138) | `https://ghulammujtaba.com/about` | `Ghulam Mujtaba` (1) | ✅ PASS |
| 3 | `/projects` | `pages/projects.js` | `Projects \| Ghulam Mujtaba — Full Stack & AI` (43) | Retain (43) | `Showcase of advanced, modern, and professional projects by Ghulam Mujtaba. Explore software, web, mobile, AI, data science, and UI/UX work.` (139) | Retain (139) | `https://ghulammujtaba.com/projects` | `Products I’ve Shipped` (1) | ✅ PASS |
| 4 | `/services` | `pages/services.js` | `Full-Stack Web Development & AI Services \| Ghulam Mujtaba` (57) | Retain (57) | `Hire Ghulam Mujtaba, a professional Next.js full-stack developer and AI/ML specialist based in Pakistan. Offering customized software, chatbots, and APIs.` (154) | Retain (154) | `https://ghulammujtaba.com/services` | `Software Engineering & AI Development Services` (1) | ✅ PASS |
| 5 | `/insights` | `pages/insights/index.js` | `Insights \| Ghulam Mujtaba — Software, Data Science & AI` (55) | Retain (55) | `Insights and articles by Ghulam Mujtaba on software engineering, data science, machine learning, AI, and modern web development.` (128) | Retain (128) | `https://ghulammujtaba.com/insights` | `Product & Engineering Insights` (1) | ✅ PASS |
| 6 | `/contact` | `pages/contact.js` | `Contact Ghulam Mujtaba \| Full Stack Developer & AI Specialist` (61) | `Contact Ghulam Mujtaba \| Full Stack & AI Specialist` (51) | `Contact Ghulam Mujtaba for project inquiries, collaborations, or opportunities. Based in Lahore, Pakistan — available for freelance and full-time work.` (151) | Retain (151) | `https://ghulammujtaba.com/contact` | `Let’s Build Something Together` (1) | ⚠️ Fix M1 |
| 7 | `/uses` | `pages/uses.js` | `My Developer Setup & Tech Stack \| Ghulam Mujtaba` (48) | Retain (48) | `What Ghulam Mujtaba uses for software engineering, full-stack web development, and AI coding. Hardware, editor configs, extensions, hosting, and dev tools.` (155) | Retain (155) | `https://ghulammujtaba.com/uses` | `My Workspace & Setup` (1) | ✅ PASS |
| 8 | `/privacy-policy` | `pages/privacy-policy.js` | `Privacy Policy \| Ghulam Mujtaba Portfolio` (41) | Retain (41) | `Privacy Policy for Ghulam Mujtaba's Portfolio website. Learn how we collect, use, and protect your information.` (111) | `Read the Privacy Policy for Ghulam Mujtaba's portfolio website. Understand how personal information, cookies, and analytics data are collected and protected.` (157) | `https://ghulammujtaba.com/privacy-policy` | `Privacy Policy` (1) | ⚠️ Fix M1 |

---

## 3. Detailed Proposed Code Changes for Downstream Worker

### Modification 1: `pages/portfolio/index.js` (Root `/`)
- **Target File**: `pages/portfolio/index.js`
- **Lines**: 124–125
- **Rationale**: Shorten `<title>` from 65 to 53 chars to prevent search snippet truncation while preserving primary entity identity (`Ghulam Mujtaba`) and core occupational keywords (`Full Stack Developer & AI Specialist`). Shorten `<meta name="description">` from 187 to 158 chars to stay within Google's 120–160 character viewport snippet threshold.

#### Code Snippet:
```diff
--- a/pages/portfolio/index.js
+++ b/pages/portfolio/index.js
@@ -124,2 +124,2 @@ const Home = ({ previewProjects = [], previewArticles = [] }) => {
-        title="Ghulam Mujtaba | Founder, Megicode & CampusAxis · Full Stack + AI"
-        description="Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Specialist. Founder of Megicode and CampusAxis, specializing in Next.js, React, Node.js, and machine learning solutions."
+        title="Ghulam Mujtaba · Full Stack Developer & AI Specialist"
+        description="Explore the portfolio of Ghulam Mujtaba, Full Stack Developer & AI Engineer specializing in Next.js, React, Node.js, and production machine learning solutions."
```

---

### Modification 2: `pages/contact.js` (`/contact`)
- **Target File**: `pages/contact.js`
- **Line**: 31
- **Rationale**: Shorten `<title>` from 61 to 51 chars (below the 60-char ceiling) while retaining brand and role signals.

#### Code Snippet:
```diff
--- a/pages/contact.js
+++ b/pages/contact.js
@@ -31,1 +31,1 @@ export default function ContactPage() {
-        title="Contact Ghulam Mujtaba | Full Stack Developer & AI Specialist"
+        title="Contact Ghulam Mujtaba | Full Stack & AI Specialist"
```

---

### Modification 3: `pages/privacy-policy.js` (`/privacy-policy`)
- **Target File**: `pages/privacy-policy.js`
- **Line**: 26
- **Rationale**: Expand `<meta name="description">` from 111 chars to 157 chars to satisfy Google's minimum 120-char threshold, improving entity context, compliance transparency, and search CTR.

#### Code Snippet:
```diff
--- a/pages/privacy-policy.js
+++ b/pages/privacy-policy.js
@@ -26,1 +26,1 @@ const PrivacyPolicy = () => {
-        description="Privacy Policy for Ghulam Mujtaba's Portfolio website. Learn how we collect, use, and protect your information."
+        description="Read the Privacy Policy for Ghulam Mujtaba's portfolio website. Understand how personal information, cookies, and analytics data are collected and protected."
```

---

## 4. Verification and Downstream Testing Plan

1. **Static Analysis & Boundary Checks**:
   - Run `node scripts/verify-seo-performance.js --tier=2`
   - Expect:
     - `Title length <= 60 chars for /`: **PASS** (53 chars)
     - `Title length <= 60 chars for /contact`: **PASS** (51 chars)
     - `Description length in 120-160 chars for /`: **PASS** (158 chars)
     - `Description length in 120-160 chars for /privacy-policy`: **PASS** (157 chars)
     - Total Tier 2 Defects will decrease by 4 (from 8 down to 4).
2. **Build Verification**:
   - Run `npm run build` to confirm zero compilation errors.
