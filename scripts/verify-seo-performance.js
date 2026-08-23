#!/usr/bin/env node
/**
 * =============================================================================
 * Automated E2E Verification Test Suite: Portfolio SEO, GEO, AIO & Performance
 * =============================================================================
 *
 * Author: teamwork_preview_test_writer_2 (QA & Test Specialist)
 * Authority: ORIGINAL_REQUEST.md, PROJECT.md, TEST_INFRA.md
 * Scope: All 8 Canonical Routes (`/`, `/about`, `/projects`, `/services`, `/insights`,
 *        `/contact`, `/uses`, `/privacy-policy`), Schema Graphs, Crawler Assets,
 *        Navbar Semantics, Snippet Bounds, and AI Indexing Simulation.
 *
 * Tier Breakdown:
 *  - Tier 1: Feature Coverage (Metadata presence, Canonical tags, OpenGraph tags, JSON-LD Schema structures, Sitemap routes, robots.txt directives, llms.txt & llms-full.txt content, Navbar Link semantics).
 *  - Tier 2: Boundary & Corner Cases (Title length <= 60 chars, Description length 120-160 chars, JSON-LD syntax validation, zero broken link targets or redirects in schemas, heading hierarchy, image pipeline).
 *  - Tier 3: Cross-Feature Consistency (Sitemap routes match canonical routes, navigation schema matches live routes, llms.txt links match live routes, OfferCatalog parity, SSR navigation inclusion).
 *  - Tier 4: Real-World Crawler Scenario (End-to-end simulation of an AI search engine crawler indexing the site).
 *
 * Usage:
 *   node scripts/verify-seo-performance.js
 *   node scripts/verify-seo-performance.js --tier=1
 *   node scripts/verify-seo-performance.js --json
 * =============================================================================
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Configuration and Paths
const ROOT_DIR = path.resolve(__dirname, "..");
const CANONICAL_BASE_URL = "https://ghulammujtaba.com";

const CANONICAL_ROUTES = [
  { path: "/", file: "pages/portfolio/index.js", name: "Homepage", subHero: "components/welcome/welcome.js" },
  { path: "/about", file: "pages/about.js", name: "About" },
  { path: "/projects", file: "pages/projects.js", name: "Projects" },
  { path: "/services", file: "pages/services.js", name: "Services" },
  { path: "/insights", file: "pages/insights/index.js", name: "Insights" },
  { path: "/contact", file: "pages/contact.js", name: "Contact" },
  { path: "/uses", file: "pages/uses.js", name: "Uses" },
  { path: "/privacy-policy", file: "pages/privacy-policy.js", name: "Privacy Policy" },
];

// CLI Arguments
const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const tierArg = args.find((a) => a.startsWith("--tier="));
const filterTier = tierArg ? parseInt(tierArg.split("=")[1], 10) : null;

// CLI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
  bgRed: "\x1b[41m\x1b[37m",
  bgGreen: "\x1b[42m\x1b[30m",
  bgBlue: "\x1b[44m\x1b[37m",
};

// Test Runner Harness
class TestHarness {
  constructor() {
    this.tiers = {
      1: { name: "Tier 1: Feature Coverage", total: 0, passed: 0, failed: 0, tests: [] },
      2: { name: "Tier 2: Boundary & Corner Cases", total: 0, passed: 0, failed: 0, tests: [] },
      3: { name: "Tier 3: Cross-Feature Consistency", total: 0, passed: 0, failed: 0, tests: [] },
      4: { name: "Tier 4: Real-World Crawler Scenario", total: 0, passed: 0, failed: 0, tests: [] },
    };
    this.currentTier = 1;
    this.currentSuite = "";
    this.defects = [];
    this.startTime = Date.now();
  }

  setTier(tierNumber) {
    this.currentTier = tierNumber;
  }

  suite(name) {
    this.currentSuite = name;
  }

  assert(condition, testName, details = {}) {
    if (filterTier && this.currentTier !== filterTier) {
      return condition;
    }

    const tier = this.tiers[this.currentTier];
    tier.total++;
    const passed = Boolean(condition);
    const testRecord = {
      suite: this.currentSuite,
      name: testName,
      tier: this.currentTier,
      passed,
      details,
    };

    if (passed) {
      tier.passed++;
    } else {
      tier.failed++;
      this.defects.push(testRecord);
    }
    tier.tests.push(testRecord);
    return passed;
  }
}

const harness = new TestHarness();

/* =============================================================================
 * Helper Parsers & Static Evaluators
 * ============================================================================= */

function readFileSafe(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf8");
}

/**
 * Extracts a prop value from a JSX component string block
 */
function extractProp(block, propName) {
  if (!block) return null;
  const patterns = [
    new RegExp(`${propName}=\\{(?:\`([\\s\\S]*?)\`|"([\\s\\S]*?)"|'([\\s\\S]*?)')\\}`, "i"),
    new RegExp(`${propName}="([^"]*)"`, "i"),
    new RegExp(`${propName}='([^']*)'`, "i"),
  ];
  for (const pat of patterns) {
    const m = block.match(pat);
    if (m) {
      return (m[1] || m[2] || m[3] || "").trim();
    }
  }
  return null;
}

/**
 * Extracts SEO metadata, headings, and component properties from a Next.js page
 */
function extractSEOFromPage(routeConfig) {
  const relPath = routeConfig.file;
  const content = readFileSafe(relPath);
  if (!content) return null;

  const result = {
    rawContent: content,
    hasSEOComponent: /<SEO\b[^>]*>/i.test(content),
    title: null,
    description: null,
    canonical: null,
    url: null,
    image: null,
    jsonLdProps: [],
    h1Tags: [],
    h2Tags: [],
    hasNavbarSSRDisabled: false,
    imageTags: [],
  };

  // Extract <SEO ... /> props
  const seoMatch = content.match(/<SEO\b([\s\S]*?)(?:\/>|>[\s\S]*?<\/SEO>)/i);
  if (seoMatch) {
    const seoBlock = seoMatch[1];
    result.title = extractProp(seoBlock, "title");
    result.description = extractProp(seoBlock, "description");
    result.canonical = extractProp(seoBlock, "canonical");
    result.url = extractProp(seoBlock, "url");
    result.image = extractProp(seoBlock, "image");

    const jsonLdMatch = seoBlock.match(/jsonLd=\{([\s\S]*?)\}(?:\n|\s|\/|>)/i);
    if (jsonLdMatch) result.jsonLdProps.push(jsonLdMatch[1].trim());
  }

  // Fallback <title> and <meta name="description"> in Head
  if (!result.title) {
    const headTitle = content.match(/<title>([^<]+)<\/title>/i);
    if (headTitle) result.title = headTitle[1].trim();
  }
  if (!result.description) {
    const headDesc = content.match(/<meta\s+name="description"\s+content=(?:"([^"]+)"|'([^']+)')/i);
    if (headDesc) result.description = (headDesc[1] || headDesc[2]).trim();
  }

  // Check SSR disabled on navigation components
  result.hasNavbarSSRDisabled =
    /import\([^)]*nav-bar[^)]*\)[\s\S]{0,100}ssr:\s*false/i.test(content) ||
    /import\([^)]*NavBar[^)]*\)[\s\S]{0,100}ssr:\s*false/i.test(content);

  // Extract Heading tags from page file
  const h1Regex = /<(?:motion\.)?h1\b[^>]*>([\s\S]*?)<\/(?:motion\.)?h1>/gi;
  let m;
  while ((m = h1Regex.exec(content)) !== null) {
    result.h1Tags.push(m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  }

  // If page delegates hero to a subcomponent (e.g. Homepage -> WelcomeFrame)
  if (result.h1Tags.length === 0 && routeConfig.subHero) {
    const subHeroContent = readFileSafe(routeConfig.subHero);
    if (subHeroContent) {
      while ((m = h1Regex.exec(subHeroContent)) !== null) {
        result.h1Tags.push(m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
      }
    }
  }

  const h2Regex = /<(?:motion\.)?h2\b[^>]*>([\s\S]*?)<\/(?:motion\.)?h2>/gi;
  while ((m = h2Regex.exec(content)) !== null) {
    result.h2Tags.push(m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  }

  return result;
}

/**
 * Evaluates Schema generator functions directly from `components/SEO.js` in a VM context
 */
function evaluateSEOSchemaModule() {
  const code = readFileSafe("components/SEO.js");
  if (!code) return null;

  // Extract schema helpers section (after the JSX React component)
  const schemaSectionMatch = code.match(/\/\*[\s\S]*?SCHEMA HELPERS[\s\S]*?\*\/\s*([\s\S]+)$/i);
  let schemaCode = schemaSectionMatch ? schemaSectionMatch[1] : code;

  // If not found by section header, strip out the JSX SEO component definition
  if (!schemaSectionMatch) {
    schemaCode = schemaCode.replace(/^export\s+default\s+function\s+SEO[\s\S]*?^}\s*$/m, "");
  }

  const exportedSymbols = [];
  let transformed = schemaCode
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, "// [import removed]")
    .replace(/^export\s+function\s+([a-zA-Z0-9_$]+)\s*\(/gm, (match, fnName) => {
      exportedSymbols.push(fnName);
      return `function ${fnName}(`;
    })
    .replace(/^export\s+const\s+([a-zA-Z0-9_$]+)\s*=/gm, (match, constName) => {
      exportedSymbols.push(constName);
      return `const ${constName} =`;
    });

  const exportStatements = exportedSymbols
    .map((name) => `try { exports.${name} = ${name}; } catch(e) {}`)
    .join("\n");

  transformed = `${transformed}\n\n${exportStatements}`;

  const sandbox = {
    exports: {},
    module: { exports: {} },
    console: { log: () => {}, warn: () => {}, error: () => {} },
    Date: Date,
    JSON: JSON,
    Array: Array,
    Object: Object,
    String: String,
  };

  try {
    vm.createContext(sandbox);
    vm.runInContext(transformed, sandbox);
    return sandbox.exports;
  } catch (err) {
    return null;
  }
}

/**
 * Parses robots.txt into structured directives
 */
function parseRobotsTxt() {
  const content = readFileSafe("public/robots.txt");
  if (!content) return null;

  const lines = content.split("\n");
  const directives = {
    userAgents: {},
    sitemaps: [],
    raw: content,
  };

  let currentUserAgent = "*";
  directives.userAgents[currentUserAgent] = { allow: [], disallow: [] };

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();

    if (key === "user-agent") {
      currentUserAgent = value;
      if (!directives.userAgents[currentUserAgent]) {
        directives.userAgents[currentUserAgent] = { allow: [], disallow: [] };
      }
    } else if (key === "allow" && currentUserAgent) {
      directives.userAgents[currentUserAgent].allow.push(value);
    } else if (key === "disallow" && currentUserAgent) {
      directives.userAgents[currentUserAgent].disallow.push(value);
    } else if (key === "sitemap") {
      directives.sitemaps.push(value);
    }
  }

  return directives;
}

/**
 * Extracts STATIC_PAGES from pages/sitemap.xml.js
 */
function parseSitemapStaticPages() {
  const content = readFileSafe("pages/sitemap.xml.js");
  if (!content) return [];

  const match = content.match(/STATIC_PAGES\s*=\s*(\[[^\]]+\])/s);
  if (!match) return [];

  const paths = [];
  const pathMatches = match[1].matchAll(/path:\s*["']([^"']+)["']/g);
  for (const pm of pathMatches) {
    paths.push(pm[1]);
  }
  return paths;
}

/**
 * Parses next.config.js for redirects, rewrites, remotePatterns, and headers
 */
function parseNextConfig() {
  const content = readFileSafe("next.config.js");
  if (!content) return null;

  return {
    raw: content,
    hasImageRemotePatterns: /remotePatterns:\s*\[/i.test(content),
    hasCloudinaryPattern: /cloudinary\.com/i.test(content),
    hasGhulamMujtabaPattern: /ghulammujtaba\.com/i.test(content),
    hasModernFormats: /formats:\s*\[.*image\/avif.*image\/webp.*\]/is.test(content),
    hasArticlesRedirect: /source:\s*["']\/articles["'],\s*destination:\s*["']\/insights["']/i.test(content),
    hasBlogRedirect: /source:\s*["']\/blog["'],\s*destination:\s*["']\/insights["']/i.test(content),
    hasPortfolioRedirect: /source:\s*["']\/portfolio["'],\s*destination:\s*["']\/["']/i.test(content),
  };
}

/* =============================================================================
 * TEST SUITE EXECUTION
 * ============================================================================= */

if (!jsonMode) {
  console.log(`${colors.bright}${colors.cyan}==============================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   E2E PORTFOLIO SEO, GEO, AIO, USABILITY & PERFORMANCE TEST SUITE            ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}==============================================================================${colors.reset}\n`);
}

const schemas = evaluateSEOSchemaModule();
const robots = parseRobotsTxt();
const sitemapPaths = parseSitemapStaticPages();
const llmsTxt = readFileSafe("public/llms.txt");
const llmsFullTxt = readFileSafe("public/llms-full.txt");
const navbarDesktop = readFileSafe("components/NavBar_Desktop/nav-bar.js");
const navbarMobile = readFileSafe("components/NavBar_Mobile/NavBar-mobile.js");
const nextConfig = parseNextConfig();
const seoComponentCode = readFileSafe("components/SEO.js");
const optimizedImageCode = readFileSafe("components/OptimizedImage/OptimizedImage.js");
const project1Code = readFileSafe("components/Projects/Project1.js");

/* =============================================================================
 * TIER 1: FEATURE COVERAGE (Baseline & Contract Tests)
 * ============================================================================= */
harness.setTier(1);

// 1.1 Metadata Presence across all 8 canonical routes
harness.suite("1.1 On-Page Metadata Presence (R1, R2)");
for (const route of CANONICAL_ROUTES) {
  const pageData = extractSEOFromPage(route);
  const exists = fs.existsSync(path.join(ROOT_DIR, route.file));

  harness.assert(
    exists,
    `Route file exists: ${route.path} -> ${route.file}`,
    { file: route.file }
  );

  harness.assert(
    pageData && Boolean(pageData.title),
    `Route has non-empty <title>: ${route.path}`,
    { route: route.path, title: pageData ? pageData.title : null }
  );

  harness.assert(
    pageData && Boolean(pageData.description),
    `Route has non-empty meta description: ${route.path}`,
    { route: route.path, description: pageData ? pageData.description : null }
  );

  harness.assert(
    pageData && Boolean(pageData.canonical),
    `Route specifies canonical URL: ${route.path}`,
    { route: route.path, canonical: pageData ? pageData.canonical : null }
  );
}

// 1.2 OpenGraph & Twitter Card Core Tags in SEO.js
harness.suite("1.2 OpenGraph & Social Metadata Tags (R2)");
harness.assert(
  seoComponentCode && /property="og:title"/i.test(seoComponentCode),
  "SEO component generates OpenGraph title (<meta property='og:title'>)"
);
harness.assert(
  seoComponentCode && /property="og:description"/i.test(seoComponentCode),
  "SEO component generates OpenGraph description (<meta property='og:description'>)"
);
harness.assert(
  seoComponentCode && /property="og:image"/i.test(seoComponentCode),
  "SEO component generates OpenGraph image (<meta property='og:image'>)"
);
harness.assert(
  seoComponentCode && /property="og:url"/i.test(seoComponentCode),
  "SEO component generates OpenGraph canonical url (<meta property='og:url'>)"
);
harness.assert(
  seoComponentCode && /property="og:site_name"/i.test(seoComponentCode),
  "SEO component generates OpenGraph site_name (<meta property='og:site_name'>)"
);
harness.assert(
  seoComponentCode && /name="twitter:card"/i.test(seoComponentCode),
  "SEO component generates Twitter card (<meta name='twitter:card'>)"
);
harness.assert(
  seoComponentCode && /name="twitter:title"/i.test(seoComponentCode),
  "SEO component generates Twitter title (<meta name='twitter:title'>)"
);
harness.assert(
  seoComponentCode && /name="twitter:description"/i.test(seoComponentCode),
  "SEO component generates Twitter description (<meta name='twitter:description'>)"
);
harness.assert(
  seoComponentCode && /name="twitter:image"/i.test(seoComponentCode),
  "SEO component generates Twitter image (<meta name='twitter:image'>)"
);

// 1.3 JSON-LD Schema Generators in components/SEO.js
harness.suite("1.3 JSON-LD Schema Structures in SEO.js (R3)");
harness.assert(
  schemas && typeof schemas.personSchema === "function",
  "personSchema() builder exists and is exported in SEO.js"
);
if (schemas && schemas.personSchema) {
  const p = schemas.personSchema();
  harness.assert(
    p && p["@type"] === "Person" && p.name === "Ghulam Mujtaba" && Array.isArray(p.sameAs),
    "personSchema() outputs valid Person entity with name and sameAs linkages"
  );
}

harness.assert(
  schemas && typeof schemas.profilePageSchema === "function",
  "profilePageSchema() builder exists and is exported in SEO.js"
);
if (schemas && schemas.profilePageSchema) {
  const pp = schemas.profilePageSchema();
  harness.assert(
    pp && pp["@type"] === "ProfilePage" && pp.mainEntity && pp.mainEntity["@id"],
    "profilePageSchema() outputs valid ProfilePage entity linked to #person"
  );
}

harness.assert(
  schemas && typeof schemas.webSiteSchema === "function",
  "webSiteSchema() builder exists and is exported in SEO.js"
);
if (schemas && schemas.webSiteSchema) {
  const ws = schemas.webSiteSchema();
  harness.assert(
    ws && ws["@type"] === "WebSite" && ws.potentialAction && ws.potentialAction["@type"] === "SearchAction",
    "webSiteSchema() outputs valid WebSite entity with SearchAction sitelinks query"
  );
}

harness.assert(
  schemas && typeof schemas.organizationSchema === "function",
  "organizationSchema() builder exists and is exported in SEO.js"
);

harness.assert(
  schemas && typeof schemas.professionalServiceSchema === "function",
  "professionalServiceSchema() builder exists and is exported in SEO.js"
);

harness.assert(
  schemas && typeof schemas.navigationSchema === "function",
  "navigationSchema() builder exists and is exported in SEO.js"
);

harness.assert(
  schemas && typeof schemas.breadcrumbSchema === "function",
  "breadcrumbSchema() builder exists and is exported in SEO.js"
);

harness.assert(
  schemas && typeof schemas.collectionPageSchema === "function",
  "collectionPageSchema() builder exists and is exported in SEO.js"
);

harness.assert(
  schemas && typeof schemas.softwareProjectSchema === "function",
  "softwareProjectSchema() builder exists and is exported in SEO.js"
);

harness.assert(
  schemas && typeof schemas.faqSchema === "function",
  "faqSchema() builder exists and is exported in SEO.js"
);

// 1.4 Sitemap & robots.txt Coverage
harness.suite("1.4 Sitemaps & Crawler Directives (R4)");
harness.assert(
  Boolean(robots),
  "public/robots.txt is present and parseable"
);
if (robots) {
  harness.assert(
    robots.sitemaps.some((s) => s.includes("sitemap.xml")),
    "robots.txt points to canonical sitemap (https://ghulammujtaba.com/sitemap.xml)"
  );
  harness.assert(
    Boolean(robots.userAgents["*"] && robots.userAgents["*"].allow.includes("/")),
    "robots.txt permits crawling of root / for standard user-agents"
  );
  harness.assert(
    Boolean(robots.userAgents["GPTBot"] || robots.userAgents["Claude-Web"] || robots.userAgents["PerplexityBot"]),
    "robots.txt defines explicit permissions for AI bot crawlers (GPTBot / Claude-Web / PerplexityBot)"
  );
}

// 1.5 AI Search Assets Coverage (llms.txt & llms-full.txt)
harness.suite("1.5 AI Search Discovery Assets (R4)");
harness.assert(
  Boolean(llmsTxt && llmsTxt.trim().length > 100),
  "public/llms.txt is present and contains comprehensive entity text"
);
harness.assert(
  Boolean(llmsFullTxt && llmsFullTxt.trim().length > 500),
  "public/llms-full.txt is present and contains in-depth documentation for AI models"
);
harness.assert(
  seoComponentCode && /rel="llms"/i.test(seoComponentCode) && /rel="llms-full"/i.test(seoComponentCode),
  "components/SEO.js includes <link rel='llms'> and <link rel='llms-full'> discovery headers"
);

// 1.6 Navbar Link Semantics
harness.suite("1.6 Navbar Usability & Link Semantics (R5)");
harness.assert(
  Boolean(navbarDesktop),
  "components/NavBar_Desktop/nav-bar.js is present"
);
if (navbarDesktop) {
  const hasSemanticLinks =
    /<Link\b[^>]*href=["']\/(about|projects|insights|resume|contact)["']/i.test(navbarDesktop) ||
    /<a\b[^>]*href=["']\/(about|projects|insights|resume|contact)["']/i.test(navbarDesktop);
  harness.assert(
    hasSemanticLinks,
    "Desktop Navbar uses semantic <Link href='...'> or <a> anchor tags for route navigation (not pure button handlers)",
    { note: "Semantic links ensure search crawlers and screen readers can discover and navigate routes without JavaScript." }
  );
}

/* =============================================================================
 * TIER 2: BOUNDARY & CORNER CASES (Character Bounds & Strict Validation)
 * ============================================================================= */
harness.setTier(2);

// 2.1 Title Length Limits (<= 60 chars)
harness.suite("2.1 Title Tag Length Bounds (<= 60 characters)");
for (const route of CANONICAL_ROUTES) {
  const pageData = extractSEOFromPage(route);
  const title = pageData ? pageData.title : "";
  const len = title ? title.length : 0;
  const isWithinBounds = len > 0 && len <= 60;

  harness.assert(
    isWithinBounds,
    `Title length <= 60 chars for ${route.path} (Current: ${len} chars)`,
    { route: route.path, length: len, title, maxAllowed: 60 }
  );
}

// 2.2 Description Length Limits (120 to 160 chars)
harness.suite("2.2 Meta Description Length Bounds (120 - 160 characters)");
for (const route of CANONICAL_ROUTES) {
  const pageData = extractSEOFromPage(route);
  const desc = pageData ? pageData.description : "";
  const len = desc ? desc.length : 0;
  const isWithinBounds = len >= 120 && len <= 160;

  harness.assert(
    isWithinBounds,
    `Description length in 120-160 chars for ${route.path} (Current: ${len} chars)`,
    { route: route.path, length: len, description: desc, range: "120-160" }
  );
}

// 2.3 JSON-LD Syntax Validation & Serialization Integrity
harness.suite("2.3 JSON-LD Syntax & Serialization Validation (R3)");
if (schemas) {
  const schemaBuilders = [
    { name: "personSchema", fn: () => schemas.personSchema && schemas.personSchema() },
    { name: "profilePageSchema", fn: () => schemas.profilePageSchema && schemas.profilePageSchema() },
    { name: "webSiteSchema", fn: () => schemas.webSiteSchema && schemas.webSiteSchema() },
    { name: "organizationSchema", fn: () => schemas.organizationSchema && schemas.organizationSchema() },
    { name: "professionalServiceSchema", fn: () => schemas.professionalServiceSchema && schemas.professionalServiceSchema() },
    { name: "navigationSchema", fn: () => schemas.navigationSchema && schemas.navigationSchema() },
    {
      name: "breadcrumbSchema",
      fn: () => schemas.breadcrumbSchema && schemas.breadcrumbSchema([{ name: "About", url: "https://ghulammujtaba.com/about" }]),
    },
    {
      name: "collectionPageSchema",
      fn: () => schemas.collectionPageSchema && schemas.collectionPageSchema({
        name: "Projects",
        url: "https://ghulammujtaba.com/projects",
        description: "Test",
        items: [{ name: "Project A", url: "https://ghulammujtaba.com/projects/a" }],
      }),
    },
    {
      name: "softwareProjectSchema",
      fn: () => schemas.softwareProjectSchema && schemas.softwareProjectSchema({
        name: "CampusAxis",
        description: "Portal",
        url: "https://ghulammujtaba.com/projects/campusaxis",
      }),
    },
    {
      name: "faqSchema",
      fn: () => schemas.faqSchema && schemas.faqSchema([{ question: "Q1?", answer: "A1." }]),
    },
  ];

  for (const sb of schemaBuilders) {
    try {
      const obj = sb.fn();
      if (!obj) {
        harness.assert(false, `Schema builder ${sb.name} did not return a valid object`);
        continue;
      }
      const serialized = JSON.stringify(obj);
      const parsed = JSON.parse(serialized);

      harness.assert(
        parsed && (parsed["@context"] === "https://schema.org" || parsed["@context"] === "http://schema.org"),
        `Schema ${sb.name} serializes cleanly with @context: 'https://schema.org'`,
        { schema: sb.name, atContext: parsed ? parsed["@context"] : null }
      );

      harness.assert(
        parsed && typeof parsed["@type"] === "string" && parsed["@type"].length > 0,
        `Schema ${sb.name} has valid @type string: '${parsed ? parsed["@type"] : ""}'`,
        { schema: sb.name, atType: parsed ? parsed["@type"] : null }
      );
    } catch (err) {
      harness.assert(false, `Schema ${sb.name} failed JSON serialization: ${err.message}`);
    }
  }
}

// 2.4 Zero Broken Link Targets or Stale Redirects in Schemas
harness.suite("2.4 Zero Broken Links or Redirects in Schemas (R3)");
if (schemas && schemas.navigationSchema) {
  const nav = schemas.navigationSchema();
  const items = (nav && Array.isArray(nav.itemListElement)) ? nav.itemListElement : [];

  const hasArticlesLink = items.some((it) => it.url && it.url.includes("/articles"));
  const hasContactHashLink = items.some((it) => it.url && it.url.includes("/#contact-section"));

  harness.assert(
    !hasArticlesLink,
    "navigationSchema contains no stale redirect paths (no /articles, uses canonical /insights)",
    { items }
  );

  harness.assert(
    !hasContactHashLink,
    "navigationSchema points to canonical /contact page rather than hash anchor /#contact-section",
    { items }
  );
}

// 2.5 Heading Hierarchy Validation (Single H1 per route)
harness.suite("2.5 Heading Hierarchy & Semantic Structure (R1, R2)");
for (const route of CANONICAL_ROUTES) {
  const pageData = extractSEOFromPage(route);
  const h1Count = pageData ? pageData.h1Tags.length : 0;

  harness.assert(
    h1Count === 1,
    `Route ${route.path} has exactly one <h1> heading (Found: ${h1Count})`,
    { route: route.path, h1Tags: pageData ? pageData.h1Tags : [] }
  );
}

// 2.6 Next.js Configuration & Redirect Safety
harness.suite("2.6 Next.js Configuration & Redirect Routing (R2)");
if (nextConfig) {
  harness.assert(
    nextConfig.hasArticlesRedirect,
    "next.config.js contains 301 permanent redirect from /articles to /insights"
  );
  harness.assert(
    nextConfig.hasBlogRedirect,
    "next.config.js contains 301 permanent redirect from /blog to /insights"
  );
  harness.assert(
    nextConfig.hasPortfolioRedirect,
    "next.config.js consolidates /portfolio to / with 301 permanent redirect"
  );
}

// 2.7 Image Optimization Safety & Configuration
harness.suite("2.7 Image Optimization & Next.js Image Pipeline (R5)");
if (optimizedImageCode) {
  const forcesAllExternalUnoptimized = /unoptimized={currentIsExternal}/i.test(optimizedImageCode);
  harness.assert(
    !forcesAllExternalUnoptimized,
    "OptimizedImage does not blindly force unoptimized=true on all external images without checking permitted domains",
    { note: "Permits Cloudinary and configured remotePatterns to be optimized by Next.js/Sharp" }
  );
}
if (project1Code) {
  const forcesProjectUnoptimized = /unoptimized:\s*isExternal\s*\|\|\s*isLocalMedia/i.test(project1Code);
  harness.assert(
    !forcesProjectUnoptimized,
    "Project1 does not force unoptimized: true on permitted local/remote project thumbnails",
    { note: "Ensures AVIF/WebP conversion for project showcase cards" }
  );
}

/* =============================================================================
 * TIER 3: CROSS-FEATURE CONSISTENCY
 * ============================================================================= */
harness.setTier(3);

// 3.1 Sitemap Routes Parity with Canonical 8 Routes
harness.suite("3.1 Sitemap Parity with Canonical Routes (R4)");
for (const route of CANONICAL_ROUTES) {
  const isIncludedInSitemap = sitemapPaths.includes(route.path);
  harness.assert(
    isIncludedInSitemap,
    `Canonical route '${route.path}' is registered in STATIC_PAGES in pages/sitemap.xml.js`,
    { route: route.path, registeredPaths: sitemapPaths }
  );
}

// 3.2 Navigation Schema Parity with Active Routes
harness.suite("3.2 Navigation Schema Parity with Active Routes (R3)");
if (schemas && schemas.navigationSchema) {
  const nav = schemas.navigationSchema();
  const navUrls = (nav && Array.isArray(nav.itemListElement))
    ? nav.itemListElement.map((it) => it.url)
    : [];

  const expectedNavTargets = [
    "https://ghulammujtaba.com/about",
    "https://ghulammujtaba.com/projects",
    "https://ghulammujtaba.com/insights",
    "https://ghulammujtaba.com/contact",
  ];

  for (const expected of expectedNavTargets) {
    const isPresent = navUrls.includes(expected);
    harness.assert(
      isPresent,
      `navigationSchema includes active canonical endpoint: ${expected}`,
      { expected, currentNavUrls: navUrls }
    );
  }
}

// 3.3 AI Search Files (llms.txt & llms-full.txt) Link Parity
harness.suite("3.3 AI Search Assets Link Consistency (R4)");
if (llmsTxt) {
  harness.assert(
    !llmsTxt.includes("https://ghulammujtaba.com/articles"),
    "public/llms.txt uses /insights instead of legacy /articles route",
    { note: "Avoids AI models indexing redirecting URLs" }
  );
  harness.assert(
    !llmsTxt.includes("campusaxis.com") || llmsTxt.includes("campusaxis.pk"),
    "public/llms.txt references campusaxis.pk canonical domain",
    { note: "Accurate entity resolution for CampusAxis" }
  );
  harness.assert(
    llmsTxt.includes("https://ghulammujtaba.com/services"),
    "public/llms.txt lists /services in site structure",
    { note: "Services page discoverability" }
  );
  harness.assert(
    llmsTxt.includes("https://ghulammujtaba.com/uses"),
    "public/llms.txt lists /uses in site structure",
    { note: "Uses page discoverability" }
  );
}

if (llmsFullTxt) {
  harness.assert(
    !llmsFullTxt.includes("https://ghulammujtaba.com/articles"),
    "public/llms-full.txt uses /insights instead of legacy /articles route"
  );
  harness.assert(
    llmsFullTxt.includes("campusaxis.pk") || !llmsFullTxt.includes("campusaxis.com"),
    "public/llms-full.txt references campusaxis.pk canonical domain"
  );
}

// 3.4 ProfessionalService OfferCatalog Parity with /services
harness.suite("3.4 ProfessionalService Schema OfferCatalog Parity (R3)");
if (schemas && schemas.professionalServiceSchema) {
  const serviceSchema = schemas.professionalServiceSchema();
  const catalog = serviceSchema ? serviceSchema.hasOfferCatalog : null;
  const offers = (catalog && Array.isArray(catalog.itemListElement))
    ? catalog.itemListElement.map((o) => o.itemOffered ? o.itemOffered.name : o.name)
    : [];

  const expectedServices = [
    "Full-Stack Web Development",
    "Custom AI & Chatbot Development",
    "Cross-Platform Mobile Apps",
    "Data Science & Analytics",
  ];

  harness.assert(
    offers.length >= 4,
    `professionalServiceSchema defines at least 4 service offerings matching /services (Current: ${offers.length})`,
    { currentOffers: offers, expectedServices }
  );
}

// 3.5 SSR Navigation Parity
harness.suite("3.5 SSR Navigation Rendering (R5)");
for (const route of CANONICAL_ROUTES) {
  const pageData = extractSEOFromPage(route);
  const hasDisabledSSR = pageData ? pageData.hasNavbarSSRDisabled : false;

  harness.assert(
    !hasDisabledSSR,
    `Route ${route.path} does not disable SSR for navigation bar ({ ssr: false })`,
    { route: route.path, file: route.file, hasDisabledSSR }
  );
}

/* =============================================================================
 * TIER 4: REAL-WORLD CRAWLER SCENARIO (AI SEARCH ENGINE SIMULATION)
 * ============================================================================= */
harness.setTier(4);

harness.suite("4.1 AI Search Crawler Simulation — Indexing Pipeline");

// Phase 1: robots.txt Inspection
let crawlerAllowed = false;
if (robots) {
  const botPermissions = ["GPTBot", "Claude-Web", "PerplexityBot", "*"];
  let allBotsAllowed = true;
  for (const bot of botPermissions) {
    const rules = robots.userAgents[bot] || robots.userAgents["*"];
    if (!rules || !rules.allow.includes("/")) {
      allBotsAllowed = false;
    }
  }
  crawlerAllowed = allBotsAllowed;
}
harness.assert(
  crawlerAllowed,
  "Phase 1: AI Crawler verifies complete index clearance in robots.txt for all modern AI bot agents"
);

// Phase 2: Sitemap Harvesting
let harvestedUrls = [];
if (sitemapPaths && sitemapPaths.length > 0) {
  harvestedUrls = sitemapPaths.map((p) => `${CANONICAL_BASE_URL}${p === "/" ? "" : p}`);
}
const allCanonicalsHarvested = CANONICAL_ROUTES.every((r) =>
  sitemapPaths.includes(r.path)
);
harness.assert(
  allCanonicalsHarvested,
  "Phase 2: AI Crawler harvests sitemap.xml and successfully discovers all 8 canonical routes",
  { discoveredUrls: harvestedUrls }
);

// Phase 3: AI Context Acquisition (llms.txt & llms-full.txt)
let aiContextAcquired = false;
if (llmsTxt && llmsFullTxt) {
  const mentionsFounder = llmsTxt.includes("Ghulam Mujtaba") && llmsFullTxt.includes("Ghulam Mujtaba");
  const mentionsMegicode = llmsTxt.includes("Megicode") && llmsFullTxt.includes("Megicode");
  const mentionsCampusAxis = llmsTxt.includes("CampusAxis") && llmsFullTxt.includes("CampusAxis");
  aiContextAcquired = mentionsFounder && mentionsMegicode && mentionsCampusAxis;
}
harness.assert(
  aiContextAcquired,
  "Phase 3: AI Crawler ingests llms.txt & llms-full.txt, establishing primary entity graph & authority context"
);

// Phase 4: Route Deep Crawl & Metadata Verification
let routeCrawlSuccess = true;
const crawlResults = [];
for (const route of CANONICAL_ROUTES) {
  const pageData = extractSEOFromPage(route);
  const routePass = Boolean(
    pageData &&
    pageData.title &&
    pageData.description &&
    pageData.canonical &&
    pageData.h1Tags.length === 1
  );
  crawlResults.push({ route: route.path, pass: routePass, pageData });
  if (!routePass) routeCrawlSuccess = false;
}
harness.assert(
  routeCrawlSuccess,
  "Phase 4: AI Crawler simulates DOM crawl across all 8 routes — extracts compliant Title, Description, Canonical, and H1",
  { crawlResults }
);

// Phase 5: Knowledge Graph Entity Linking
let knowledgeGraphLinked = false;
if (schemas) {
  const person = schemas.personSchema ? schemas.personSchema() : null;
  const website = schemas.webSiteSchema ? schemas.webSiteSchema() : null;
  const profile = schemas.profilePageSchema ? schemas.profilePageSchema() : null;
  const service = schemas.professionalServiceSchema ? schemas.professionalServiceSchema() : null;

  const personId = person ? person["@id"] : "";
  const websiteId = website ? website["@id"] : "";

  const profileLinked = profile && profile.mainEntity && profile.mainEntity["@id"] === personId;
  const websiteLinked = website && website.publisher && website.publisher["@id"] === personId;
  const serviceLinked = service && service.provider && service.provider["@id"] === personId;

  knowledgeGraphLinked = Boolean(personId && profileLinked && websiteLinked && serviceLinked);
}
harness.assert(
  knowledgeGraphLinked,
  "Phase 5: AI Crawler resolves interconnected Schema.org Knowledge Graph (@id entity linkages across Person, WebSite, ProfilePage, Service)",
  { note: "Ensures Google Knowledge Panel and Perplexity/ChatGPT entity grounding" }
);

// Phase 6: Core Web Vitals & Hydration Usability Readiness
let usabilityReady = true;
const ssrIssues = [];
for (const route of CANONICAL_ROUTES) {
  const pageData = extractSEOFromPage(route);
  if (pageData && pageData.hasNavbarSSRDisabled) {
    usabilityReady = false;
    ssrIssues.push(route.path);
  }
}
harness.assert(
  usabilityReady,
  "Phase 6: AI Crawler & Search Bot verify zero SSR hydration blocking for navigation across all 8 canonical routes",
  { ssrIssues }
);

/* =============================================================================
 * TEST REPORT & DASHBOARD OUTPUT
 * ============================================================================= */

const duration = ((Date.now() - harness.startTime) / 1000).toFixed(2);
let grandTotal = 0;
let grandPassed = 0;
let grandFailed = 0;

for (const [tierNum, tier] of Object.entries(harness.tiers)) {
  grandTotal += tier.total;
  grandPassed += tier.passed;
  grandFailed += tier.failed;
}

const summary = {
  timestamp: new Date().toISOString(),
  durationSeconds: parseFloat(duration),
  summary: {
    total: grandTotal,
    passed: grandPassed,
    failed: grandFailed,
    passRate: grandTotal > 0 ? `${Math.round((grandPassed / grandTotal) * 100)}%` : "0%",
  },
  tiers: Object.fromEntries(
    Object.entries(harness.tiers).map(([k, v]) => [
      k,
      { name: v.name, total: v.total, passed: v.passed, failed: v.failed },
    ])
  ),
  defectsCount: harness.defects.length,
  defects: harness.defects,
};

if (jsonMode) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`${colors.bright}------------------------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bright}   TEST EXECUTION RESULTS BY TIER                                             ${colors.reset}`);
  console.log(`${colors.bright}------------------------------------------------------------------------------${colors.reset}`);

  for (const [tierNum, tier] of Object.entries(harness.tiers)) {
    if (filterTier && parseInt(tierNum, 10) !== filterTier) continue;
    const pct = tier.total > 0 ? Math.round((tier.passed / tier.total) * 100) : 0;
    const statusColor = tier.failed === 0 ? colors.green : colors.yellow;
    const statusBadge = tier.failed === 0 ? `${colors.bgGreen} PASS ${colors.reset}` : `${colors.bgRed} FAIL (${tier.failed}) ${colors.reset}`;

    console.log(
      ` ${statusBadge} ${colors.bright}${tier.name}${colors.reset}\n` +
      `        Passed: ${colors.green}${tier.passed}${colors.reset} / ${tier.total} (${statusColor}${pct}%${colors.reset})\n`
    );
  }

  console.log(`${colors.bright}------------------------------------------------------------------------------${colors.reset}`);
  console.log(
    `   ${colors.bright}TOTAL ASSERTIONS:${colors.reset} ${grandTotal} | ` +
    `${colors.green}PASSED: ${grandPassed}${colors.reset} | ` +
    `${grandFailed > 0 ? colors.red : colors.green}FAILED: ${grandFailed}${colors.reset} | ` +
    `DURATION: ${duration}s`
  );
  console.log(`${colors.bright}------------------------------------------------------------------------------${colors.reset}\n`);

  if (harness.defects.length > 0) {
    console.log(`${colors.bright}${colors.red}==============================================================================${colors.reset}`);
    console.log(`${colors.bright}${colors.red}   DISCOVERED DEFECTS & BASELINE GAP ANALYSIS (${harness.defects.length} items)                ${colors.reset}`);
    console.log(`${colors.bright}${colors.red}==============================================================================${colors.reset}\n`);

    harness.defects.forEach((d, idx) => {
      console.log(`${colors.red}[Defect #${idx + 1}] [Tier ${d.tier}] [${d.suite}]${colors.reset}`);
      console.log(`  ${colors.bright}${d.name}${colors.reset}`);
      if (d.details && Object.keys(d.details).length > 0) {
        console.log(`  ${colors.gray}Details: ${JSON.stringify(d.details, null, 2).replace(/\n/g, "\n  ")}${colors.reset}`);
      }
      console.log("");
    });
  }
}

module.exports = {
  harness,
  summary,
};
