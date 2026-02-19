import dbConnect from "../lib/mongoose";
import Article from "../models/Article";
import Project from "../models/Project";

// Only skip DB if there is no configured connection string.
// Do NOT skip just because we're on Vercel; we want a full sitemap in production.
const skipDb = !process.env.MONGODB_URI;

// Static pages that should always appear in the sitemap with fresh lastmod
const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.9 },
  { path: "/resume", changefreq: "monthly", priority: 0.8 },
  { path: "/projects", changefreq: "weekly", priority: 0.9 },
  { path: "/articles", changefreq: "weekly", priority: 0.9 },
  { path: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
];

export async function getServerSideProps({ res }) {
  try {
    const base = "https://ghulammujtaba.com";
    const now = new Date().toISOString();

    // Always include static pages with a fresh lastmod
    const urls = STATIC_PAGES.map((p) => ({
      loc: `${base}${p.path}`,
      lastmod: now,
      changefreq: p.changefreq,
      priority: p.priority,
    }));

    // If no DB connection is configured, return sitemap with only static pages
    if (skipDb) {
      const xml = buildSitemapXml(urls);
      sendXml(res, xml);
      return { props: {} };
    }

    await dbConnect();

    const [articles, projects] = await Promise.all([
      Article.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
      Project.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
    ]);

    for (const a of articles || []) {
      urls.push({
        loc: `${base}/articles/${a.slug}`,
        lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
        changefreq: "weekly",
        priority: 0.8,
      });
    }
    for (const p of projects || []) {
      urls.push({
        loc: `${base}/projects/${p.slug}`,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
        changefreq: "weekly",
        priority: 0.8,
      });
    }

    const xml = buildSitemapXml(urls);
    sendXml(res, xml);
  } catch (e) {
    // On error, return sitemap with at least static pages
    const base = "https://ghulammujtaba.com";
    const now = new Date().toISOString();
    const urls = STATIC_PAGES.map((p) => ({
      loc: `${base}${p.path}`,
      lastmod: now,
      changefreq: p.changefreq,
      priority: p.priority,
    }));
    const xml = buildSitemapXml(urls);
    sendXml(res, xml);
  }

  return { props: {} };
}

function buildSitemapXml(urls) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        (u) =>
          `<url>` +
          `<loc>${u.loc}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "") +
          `<changefreq>${u.changefreq}</changefreq>` +
          `<priority>${u.priority}</priority>` +
          `</url>`
      )
      .join("") +
    `</urlset>`
  );
}

function sendXml(res, xml) {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=1800, stale-while-revalidate=600"
  );
  res.statusCode = 200;
  res.write(xml);
  res.end();
}

export default function SiteMap() {
  // getServerSideProps will handle the response
  return null;
}

