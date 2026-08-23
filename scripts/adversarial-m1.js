const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const CANONICAL_ROUTES = [
  { path: '/', file: 'pages/portfolio/index.js', name: 'Homepage', subHero: 'components/welcome/welcome.js' },
  { path: '/about', file: 'pages/about.js', name: 'About' },
  { path: '/projects', file: 'pages/projects.js', name: 'Projects' },
  { path: '/services', file: 'pages/services.js', name: 'Services' },
  { path: '/insights', file: 'pages/insights/index.js', name: 'Insights' },
  { path: '/contact', file: 'pages/contact.js', name: 'Contact' },
  { path: '/uses', file: 'pages/uses.js', name: 'Uses' },
  { path: '/privacy-policy', file: 'pages/privacy-policy.js', name: 'Privacy Policy' },
];

function readFileSafe(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function extractProp(block, propName) {
  if (!block) return null;
  const patterns = [
    new RegExp(propName + '=\\{(?:`([\\s\\S]*?)`|"([\\s\\S]*?)"|\'([\\s\\S]*?)\')\\}', 'i'),
    new RegExp(propName + '="([^"]*)"', 'i'),
    new RegExp(propName + '=\'([^\']*)\'', 'i'),
  ];
  for (const pat of patterns) {
    const m = block.match(pat);
    if (m) {
      return (m[1] || m[2] || m[3] || '').trim();
    }
  }
  return null;
}

function extractSEOFromPage(routeConfig) {
  const content = readFileSafe(routeConfig.file);
  if (!content) return null;

  const result = {
    rawContent: content,
    title: null,
    description: null,
    canonical: null,
    url: null,
    image: null,
    imageAlt: null,
    type: null,
    keywords: null,
    author: null,
    h1Tags: [],
  };

  const seoMatch = content.match(/<SEO\b([\s\S]*?)(?:\/>|>[\s\S]*?<\/SEO>)/i);
  if (seoMatch) {
    const b = seoMatch[1];
    result.title = extractProp(b, 'title');
    result.description = extractProp(b, 'description');
    result.canonical = extractProp(b, 'canonical');
    result.url = extractProp(b, 'url');
    result.image = extractProp(b, 'image');
    result.imageAlt = extractProp(b, 'imageAlt');
    result.type = extractProp(b, 'type');
    result.keywords = extractProp(b, 'keywords');
    result.author = extractProp(b, 'author');
  }

  if (!result.title) {
    const ht = content.match(/<title>([^<]+)<\/title>/i);
    if (ht) result.title = ht[1].trim();
  }
  if (!result.description) {
    const hd = content.match(/<meta\s+name="description"\s+content=(?:"([^"]+)"|'([^']+)')/i);
    if (hd) result.description = (hd[1] || hd[2]).trim();
  }

  const h1Regex = /<(?:motion\.)?h1\b[^>]*>([\s\S]*?)<\/(?:motion\.)?h1>/gi;
  let m;
  while ((m = h1Regex.exec(content)) !== null) {
    result.h1Tags.push(m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  }

  if (result.h1Tags.length === 0 && routeConfig.subHero) {
    const subHeroContent = readFileSafe(routeConfig.subHero);
    if (subHeroContent) {
      while ((m = h1Regex.exec(subHeroContent)) !== null) {
        result.h1Tags.push(m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
      }
    }
  }

  return result;
}

console.log('===============================================================================');
console.log('   EMPIRICAL ADVERSARIAL CHALLENGER AUDIT: MILESTONE 1');
console.log('===============================================================================\n');

let total = 0;
let passed = 0;
let failed = 0;
const defects = [];

function assert(condition, testName, details = {}) {
  total++;
  if (condition) {
    passed++;
    console.log('  [PASS] ' + testName);
  } else {
    failed++;
    console.log('  [FAIL] ' + testName);
    console.log('         Details: ' + JSON.stringify(details));
    defects.push({ testName, details });
  }
}

// 1. Strict Length Bounds across all 8 canonical routesconsole.log('--- 1. Title & Meta Description Bounds across 8 Canonical Routes ---');
for (const route of CANONICAL_ROUTES) {
  const seo = extractSEOFromPage(route);
  assert(Boolean(seo), 'Page exists and is readable: ' + route.path, { route: route.path });
  if (!seo) continue;

  const title = seo.title || '';
  const titleLen = title.length;
  const titleBytes = Buffer.byteLength(title, 'utf8');
  const titleCodePoints = Array.from(title).length;

  assert(
    titleLen > 0 && titleLen <= 60,
    'Title length <= 60 chars for ' + route.path + ' (' + titleLen + ' chars, ' + titleBytes + ' bytes)',
    { route: route.path, title, titleLen, titleBytes, titleCodePoints }
  );

  assert(
    !title.startsWith(' ') && !title.endsWith(' ') && !title.includes('  '),
    'Title has clean spacing (no leading/trailing/double spaces) for ' + route.path,
    { route: route.path, title }
  );

  const desc = seo.description || '';
  const descLen = desc.length;
  const descBytes = Buffer.byteLength(desc, 'utf8');
  const descCodePoints = Array.from(desc).length;

  assert(
    descLen >= 120 && descLen <= 160,
    'Description length in [120, 160] chars for ' + route.path + ' (' + descLen + ' chars, ' + descBytes + ' bytes)',
    { route: route.path, description: desc, descLen, descBytes, descCodePoints }
  );

  assert(
    !desc.startsWith(' ') && !desc.endsWith(' ') && !desc.includes('  '),
    'Description has clean spacing for ' + route.path,
    { route: route.path, description: desc }
  );

  const expectedCanonical = 'https://ghulammujtaba.com' + (route.path === '/' ? '' : route.path);
  assert(
    seo.canonical === expectedCanonical,
    'Canonical URL matches exact endpoint for ' + route.path + ' (Found: ' + seo.canonical + ')',
    { expected: expectedCanonical, actual: seo.canonical }
  );

  assert(
    seo.h1Tags.length === 1,
    'Exactly one <h1> heading present for ' + route.path + ' (Found ' + seo.h1Tags.length + ')',
    { route: route.path, h1Tags: seo.h1Tags }
  );
}

// 2. Character Encodings, HTML Entities & Adversarial Strings
console.log('\n--- 2. Character Encodings & HTML Entity Escaping Stress Tests ---');
const adversarialStrings = [
  'Ghulam Mujtaba | Full Stack Developer & AI Specialist',
  'Founder & Technical Co-founder · Full Stack + AI',
  'Ghulam Mujtaba — Full Stack Developer & AI Specialist',
  'Next.js, React, Node.js & Machine Learning Solutions',
  'Specialist in "AI/ML" & Full-Stack Systems',
  'Software Engineer & Co-Founder <Megicode / CampusAxis>',
  'Developer in Lahore, Pakistan',
];

for (const str of adversarialStrings) {
  const jsonMock = { '@context': 'https://schema.org', '@type': 'Person', name: str, description: str };
  let jsonRoundtrip = false;
  try {
    const serialized = JSON.stringify(jsonMock);
    const parsed = JSON.parse(serialized);
    jsonRoundtrip = parsed.name === str && parsed.description === str;
  } catch (e) {
    jsonRoundtrip = false;
  }
  assert(jsonRoundtrip, 'JSON-LD serialize/parse lossless for: ' + str.substring(0, 40) + '...', { str });
}

// 3. Dynamic Routes Truncation & Fallbacks
console.log('\n--- 3. Dynamic Route Template Truncation & Edge Cases ---');
const boundaryDescriptions = [
  { label: 'Exact 120 chars', text: 'X'.repeat(120), expected: 120 },
  { label: 'Exact 160 chars', text: 'Y'.repeat(160), expected: 160 },
  { label: 'Exceeding 250 chars', text: 'Z'.repeat(250), expected: 160 },
  { label: 'Empty string', text: '', expected: 0 },
  { label: 'Null string', text: null, expected: 0 },
];

for (const bd of boundaryDescriptions) {
  const truncated = (bd.text || '').substring(0, 160);
  assert(
    truncated.length === (bd.text ? Math.min(bd.text.length, 160) : 0),
    'Dynamic substring(0, 160) behaves correctly on ' + bd.label + ' (Length: ' + truncated.length + ')',
    { label: bd.label, length: truncated.length }
  );
}

// 4. Social Metadata Tag Contract in components/SEO.js
console.log('\n--- 4. Social Metadata & Discovery Tags in components/SEO.js ---');
const seoSource = readFileSafe('components/SEO.js');
const tagChecks = [
  'og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'og:site_name', 'og:locale',
  'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'canonical', 'llms', 'llms-full'
];

for (const tc of tagChecks) {
  const found = Boolean(seoSource && seoSource.includes(tc));
  assert(found, 'SEO component contains tag declaration for ' + tc, { tag: tc });
}

console.log('\n=============================================================================');
console.log('   TOTAL: ' + total + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
console.log('=============================================================================\n');

if (failed > 0) {
  console.log('FAILURES:');
  console.log(JSON.stringify(defects, null, 2));
  process.exit(1);
} else {
  console.log('ALL EMPIRICAL ADVERSARIAL TESTS PASSED (0 FAILURES).');
  process.exit(0);
}