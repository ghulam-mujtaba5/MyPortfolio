// Run before sitemap generation: node scripts/generate-sitemap-paths.js
// Fetches dynamic article/project slugs from DB or deployed API so sitemap
// includes all published content even during builds.
const fs = require("fs");

async function main() {
  const SITE = process.env.SITE_URL || "https://ghulammujtaba.com";
  let articles = [];
  let projects = [];

  // Strategy 1: If MONGODB_URI is available, query directly
  if (process.env.MONGODB_URI) {
    try {
      const mongoose = require("mongoose");
      await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
      const db = mongoose.connection.db;
      
      const [dbArticles, dbProjects] = await Promise.all([
        db.collection("articles").find({ published: true }, { projection: { slug: 1, updatedAt: 1 } }).toArray(),
        db.collection("projects").find({ published: true }, { projection: { slug: 1, updatedAt: 1 } }).toArray(),
      ]);
      
      articles = dbArticles || [];
      projects = dbProjects || [];
      await mongoose.disconnect();
    } catch (dbErr) {
      console.warn("DB query for sitemap paths failed, falling back to API fetch:", dbErr.message);
    }
  }

  // Strategy 2: Fallback to HTTP API fetch
  if (articles.length === 0 && projects.length === 0) {
    try {
      const [artRes, projRes] = await Promise.all([
        fetch(`${SITE}/api/articles?limit=1000&fields=slug,updatedAt`),
        fetch(`${SITE}/api/projects?limit=1000&fields=slug,updatedAt`),
      ]);

      articles = artRes.ok ? (await artRes.json()).articles || [] : [];
      projects = projRes.ok
        ? (await projRes.json()).data || (await projRes.json()).projects || []
        : [];
    } catch (fetchErr) {
      console.warn("API fetch for sitemap paths failed:", fetchErr.message);
    }
  }

  const paths = [
    ...articles.map((a) => ({
      loc: `/insights/${a.slug}`,
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
}

main();
