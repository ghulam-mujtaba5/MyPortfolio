import { projects } from "../data/projects";

export async function getServerSideProps({ res }) {
  try {
    const base = "https://ghulammujtaba.com";

    const urls = [];
    
    // Add static project URLs
    for (const p of projects) {
      urls.push({
        loc: `${base}/projects/${p.slug}`,
        lastmod: new Date(p.createdAt).toISOString(),
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

