import Head from "next/head";

/**
 * Advanced SEO Component — implements all modern approaches for maximum
 * Google / Bing / social-media / PWA discoverability.
 *
 * Features:
 *  - Open Graph (with image dimensions, locale, alt)
 *  - Twitter Card (with site & creator handles)
 *  - Canonical URL
 *  - Author & robots meta
 *  - JSON-LD structured data (accepts array)
 *  - DNS prefetch / preconnect hints
 *  - Favicons, Apple Touch Icons, PWA manifest
 *  - Microsoft Tiles
 *  - hreflang alternate link
 *  - Googlebot / Bingbot directives
 */
export default function SEO({
  title = "Ghulam Mujtaba | Portfolio",
  description = "Portfolio of Ghulam Mujtaba: Full Stack Developer, Data Scientist, and AI Specialist. Explore projects, skills, and contact information.",
  url = "https://ghulammujtaba.com",
  image = "https://ghulammujtaba.com/og-image.png",
  imageWidth = 1200,
  imageHeight = 630,
  imageAlt = "Ghulam Mujtaba — Full Stack Developer, Data Scientist & AI Specialist",
  type = "website",
  canonical = "https://ghulammujtaba.com",
  keywords = "Ghulam Mujtaba, Portfolio, Full Stack Developer, Data Scientist, AI, Projects, Resume",
  author = "Ghulam Mujtaba",
  locale = "en_US",
  twitterSite = "@gabormujtaba",
  twitterCreator = "@gabormujtaba",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  noindex = false,
  publishedTime,
  modifiedTime,
  articleSection,
  articleTags,
  jsonLd, // optional JSON-LD object or array of objects
  children,
}) {
  const effectiveRobots = noindex ? "noindex, nofollow" : robots;

  return (
    <Head>
      {/* ═══════════ Core Meta ═══════════ */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={effectiveRobots} />
      <meta name="googlebot" content={effectiveRobots} />
      <meta name="bingbot" content={effectiveRobots} />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="3 days" />

      {/* ═══════════ Open Graph ═══════════ */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:site_name" content="Ghulam Mujtaba Portfolio" />
      <meta property="og:locale" content={locale} />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {articleTags &&
        articleTags.map((tag) => (
          <meta property="article:tag" content={tag} key={`og-tag-${tag}`} />
        ))}

      {/* ═══════════ Twitter Card ═══════════ */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && (
        <meta name="twitter:creator" content={twitterCreator} />
      )}

      {/* ═══════════ Canonical ═══════════ */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* ═══════════ Alternate — hreflang ═══════════ */}
      <link rel="alternate" hrefLang="en" href={canonical || url} />
      <link rel="alternate" hrefLang="x-default" href={canonical || url} />

      {/* ═══════════ DNS Prefetch & Preconnect ═══════════ */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* ═══════════ Favicon — Multiple formats for maximum compatibility ═══════════ */}
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="icon" href="/gm-icon-32.png" sizes="32x32" type="image/png" />
      <link rel="icon" href="/gm-icon-16.png" sizes="16x16" type="image/png" />
      <link rel="shortcut icon" href="/favicon.png" />

      {/* ═══════════ Apple Touch Icons ═══════════ */}
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/gm-icon-180.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/gm-icon-128.png" />

      {/* ═══════════ PWA Manifest ═══════════ */}
      <link rel="manifest" href="/manifest.json" />

      {/* ═══════════ Microsoft Tiles ═══════════ */}
      <meta name="msapplication-TileImage" content="/gm-icon-256.png" />
      <meta name="msapplication-TileColor" content="#23272F" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* ═══════════ JSON-LD Structured Data ═══════════ */}
      {jsonLd &&
        (Array.isArray(jsonLd)
          ? jsonLd.map((obj, i) => (
              <script
                key={`jsonld-${i}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
              />
            ))
          : (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
              />
            ))}
      {children}
    </Head>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SCHEMA HELPERS
 * Reusable JSON-LD builders for every page type your portfolio needs.
 * Import these in individual pages and pass to <SEO jsonLd={[…]} />
 * ─────────────────────────────────────────────────────────────────────────── */

const SITE_URL = "https://ghulammujtaba.com";
const SITE_NAME = "Ghulam Mujtaba Portfolio";
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const PERSON_NAME = "Ghulam Mujtaba";

/**
 * Person schema — comprehensive professional identity.
 * Includes hasOccupation, hasCredential, alumniOf, award, knowsAbout.
 */
export function personSchema(overrides = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: PERSON_NAME,
    givenName: "Ghulam",
    familyName: "Mujtaba",
    url: SITE_URL,
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630,
    },
    description:
      "Software Engineer specializing in Full Stack Development, Data Science, Machine Learning, and AI-powered solutions.",
    jobTitle: "Full Stack Developer & AI Specialist",
    email: "mailto:ghulammujtaba1005@gmail.com",
    telephone: "+923177107849",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    nationality: {
      "@type": "Country",
      name: "Pakistan",
    },
    sameAs: [
      "https://www.linkedin.com/in/ghulamujtabaofficial",
      "https://github.com/ghulam-mujtaba5",
      "https://www.instagram.com/ghulamujtabaofficial/",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "COMSATS University Islamabad, Lahore Campus",
      url: "https://lahore.comsats.edu.pk/",
      sameAs: "https://lahore.comsats.edu.pk/",
    },
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Full Stack Developer",
        occupationLocation: {
          "@type": "Country",
          name: "Pakistan",
        },
        skills:
          "JavaScript, React, Next.js, Node.js, Python, Java, MongoDB, Git",
      },
      {
        "@type": "Occupation",
        name: "AI Data Annotator & Model Evaluator",
        occupationLocation: {
          "@type": "Country",
          name: "Remote",
        },
        skills: "AI Evaluation, LLM Accuracy, Data Annotation, Search Relevance",
      },
    ],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        name: "Meta Front-End Developer Certificate",
        credentialCategory: "Professional Certificate",
        recognizedBy: { "@type": "Organization", name: "Meta" },
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Google UX Design Certificate",
        credentialCategory: "Professional Certificate",
        recognizedBy: { "@type": "Organization", name: "Google" },
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Google Data Analytics Certificate",
        credentialCategory: "Professional Certificate",
        recognizedBy: { "@type": "Organization", name: "Google" },
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Google Project Management Certificate",
        credentialCategory: "Professional Certificate",
        recognizedBy: { "@type": "Organization", name: "Google" },
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Google Cybersecurity Certificate",
        credentialCategory: "Professional Certificate",
        recognizedBy: { "@type": "Organization", name: "Google" },
      },
    ],
    knowsAbout: [
      "JavaScript",
      "React",
      "Next.js",
      "Python",
      "Java",
      "C++",
      "Machine Learning",
      "Data Science",
      "Artificial Intelligence",
      "Full Stack Development",
      "UI/UX Design",
      "Cloud Computing",
      "MongoDB",
      "Node.js",
      "React Native",
      "Electron.js",
    ],
    knowsLanguage: [
      { "@type": "Language", name: "English" },
      { "@type": "Language", name: "Urdu" },
    ],
    workLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lahore",
        addressCountry: "PK",
      },
    },
    ...overrides,
  };
}

/**
 * ProfilePage schema — Google's newer schema for personal pages.
 * This is what makes Google show a rich personal profile card.
 */
export function profilePageSchema(overrides = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profilepage`,
    name: `${PERSON_NAME} — Portfolio`,
    url: SITE_URL,
    description:
      "Professional portfolio of Ghulam Mujtaba — Full Stack Developer, Data Scientist, and AI Specialist.",
    mainEntity: {
      "@id": `${SITE_URL}/#person`,
    },
    dateCreated: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    ...overrides,
  };
}

/**
 * WebSite schema with SearchAction — enables sitelinks search box in Google.
 */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "Portfolio of Ghulam Mujtaba — showcasing projects, articles, skills in Full Stack Development, Data Science, and AI.",
    publisher: { "@id": `${SITE_URL}/#person` },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Organization schema.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: PERSON_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: OG_IMAGE,
      width: 1200,
      height: 630,
    },
    founder: { "@id": `${SITE_URL}/#person` },
    sameAs: [
      "https://www.linkedin.com/in/ghulamujtabaofficial",
      "https://github.com/ghulam-mujtaba5",
      "https://www.instagram.com/ghulamujtabaofficial/",
    ],
  };
}

/**
 * SiteNavigationElement for Google sitelinks.
 */
export function navigationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    mainEntityOfPage: SITE_URL,
    numberOfItems: 5,
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "About",
        url: `${SITE_URL}/about`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Resume",
        url: `${SITE_URL}/resume`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "Projects",
        url: `${SITE_URL}/projects`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "Articles",
        url: `${SITE_URL}/articles`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 5,
        name: "Contact",
        url: `${SITE_URL}/#contact-section`,
      },
    ],
  };
}

/**
 * BreadcrumbList schema builder.
 */
export function breadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.name,
        item: item.url,
      })),
    ],
  };
}

/**
 * CollectionPage schema — for listing pages (projects, articles).
 */
export function collectionPageSchema({ name, url, description, items = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    description,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        url: item.url,
        ...(item.description ? { description: item.description } : {}),
        ...(item.image ? { image: item.image } : {}),
      })),
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
  };
}

/**
 * SoftwareSourceCode schema — for individual project pages.
 */
export function softwareProjectSchema({
  name,
  description,
  url,
  codeRepository,
  programmingLanguages = [],
  image,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name,
    description,
    url,
    codeRepository: codeRepository || undefined,
    programmingLanguage: programmingLanguages,
    author: { "@id": `${SITE_URL}/#person` },
    ...(image ? { image } : {}),
  };
}

/**
 * FAQPage schema — drives rich FAQ snippets in Google search results.
 */
export function faqSchema(faqs = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Speakable WebPage schema — tells Google which parts can be read by TTS.
 */
export function speakableSchema({ url, cssSelectors = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors.length
        ? cssSelectors
        : ["h1", "[data-speakable]", "meta[name='description']"],
    },
  };
}

/**
 * Article schema for detailed article pages.
 */
export function articleSchema({
  headline,
  description,
  image,
  url,
  datePublished,
  dateModified,
  keywords,
  readingTime,
  wordCount,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image ? [image] : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Person",
      name: PERSON_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: PERSON_NAME,
      logo: {
        "@type": "ImageObject",
        url: OG_IMAGE,
      },
    },
    datePublished,
    dateModified,
    keywords,
    ...(readingTime ? { timeRequired: `PT${readingTime}M` } : {}),
    ...(wordCount ? { wordCount } : {}),
  };
}

