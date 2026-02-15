// Run before sitemap generation: node scripts/generate-sitemap-paths.js
// Fetches dynamic article/project slugs from the deployed API so sitemap
// includes all published content even during Vercel builds (where DB may not be available).
const fs = require("fs");

async function main() {
  const SITE = process.env.SITE_URL || "https://ghulammujtaba.com";

  try {
    const [artRes, projRes] = await Promise.all([
      fetch(`${SITE}/api/articles?limit=1000&fields=slug,updatedAt`),
      fetch(`${SITE}/api/projects?limit=1000&fields=slug,updatedAt`),
    ]);

    const articles = artRes.ok ? (await artRes.json()).articles || [] : [];
    const projects = projRes.ok
      ? (await projRes.json()).data || (await projRes.json()).projects || []
      : [];

    const paths = [
      ...articles.map((a) => ({
        loc: `/articles/${a.slug}`,
        lastmod: a.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
      })),
      ...projects.map((p) => ({
        loc: `/projects/${p.slug}`,
        lastmod: p.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
      })),
    ];

    fs.writeFileSync("sitemap-paths.json", JSON.stringify(paths, null, 2));
    console.log(`✓ Wrote ${paths.length} sitemap paths`);
  } catch (e) {
    console.warn("⚠ Sitemap path generation failed:", e.message);
    fs.writeFileSync("sitemap-paths.json", "[]");
  }
}

main();
