import dbConnect from "../lib/mongoose";
import Article from "../models/Article";
import Project from "../models/Project";

export async function getServerSideProps({ res }) {
  try {
    await dbConnect();

    const [articles, projects] = await Promise.all([
      Article.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
      Project.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
    ]);

    const base = "https://ghulammujtaba.com";

    const urls = [];
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

    // Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls
        .map((u) =>
          `<url>` +
          `<loc>${u.loc}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "") +
          `<changefreq>${u.changefreq}</changefreq>` +
          `<priority>${u.priority}</priority>` +
          `</url>`,
        )
        .join("") +
      `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=600"); // 30m cache at edge
    res.write(xml);
    res.end();
  } catch (e) {
    // On error, return empty but valid sitemap to avoid 500s
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.statusCode = 200;
    res.write(xml);
    res.end();
  }

  return { props: {} };
}

export default function SiteMap() {
  // getServerSideProps will handle the response
  return null;
}
