module.exports = {
  siteUrl: "https://ghulammujtaba.com", // Main site URL (HTTPS)
  generateRobotsTxt: false, // Use manual public/robots.txt; do not overwrite
  // IMPORTANT: prevent generating public/sitemap.xml because we serve it via pages/sitemap.xml.js
  // This makes next-sitemap emit sitemap files using a different base filename.
  generateIndexSitemap: false,
  sitemapBaseFileName: "sitemap-0",
  // Exclude non-public routes from sitemap
  exclude: [
    "/admin",
    "/admin/*",
    "/api/*",
    "/sitemap.xml",
    "/sitemap-dynamic.xml",
    "/search",
    "/404",
    "/portfolio",
    "/portfolio/*",
  ],
  // Optional robots rules if next-sitemap generates robots.txt
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin/", "/api/", "/search", "/_next/"] },
    ],
  },
  // Programmatically include dynamic routes for Articles and Projects
  // so Google sees all canonical URLs in sitemap.xml
  additionalPaths: async (config) => {
    // Strategy 1: Try reading pre-generated paths from build script
    try {
      const fs = require("fs");
      const pathsFile = require("path").join(__dirname, "sitemap-paths.json");
      if (fs.existsSync(pathsFile)) {
        const paths = JSON.parse(fs.readFileSync(pathsFile, "utf-8"));
        if (paths.length > 0) {
          console.log(`Sitemap: loaded ${paths.length} paths from sitemap-paths.json`);
          return paths.map((p) => ({
            loc: `${config.siteUrl}${p.loc}`,
            changefreq: p.changefreq,
            priority: p.priority,
            lastmod: p.lastmod ? new Date(p.lastmod).toISOString() : undefined,
          }));
        }
      }
    } catch (_) {
      // Fall through to DB strategy
    }

    // Strategy 2: Direct DB call (works locally, may not work on CI)
    try {
      // Use dynamic import to work with ESM modules from a CJS config
      const { default: dbConnect } = await import("./lib/mongoose.js");
      const { default: Article } = await import("./models/Article.js");
      const { default: Project } = await import("./models/Project.js");

      await dbConnect();

      const [articles, projects] = await Promise.all([
        Article.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
        Project.find({ published: true }, { slug: 1, updatedAt: 1 }).lean(),
      ]);

      const items = [];

      for (const a of articles || []) {
        items.push({
          loc: `${config.siteUrl}/articles/${a.slug}`,
          changefreq: "weekly",
          priority: 0.8,
          lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
        });
      }

      for (const p of projects || []) {
        items.push({
          loc: `${config.siteUrl}/projects/${p.slug}`,
          changefreq: "weekly",
          priority: 0.8,
          lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
        });
      }

      return items;
    } catch (e) {
      // If DB is not available at build time, fail gracefully
      console.warn("next-sitemap additionalPaths skipped:", e?.message || e);
      return [];
    }
  },
  transform: async (config, path) => {
    // Default change frequency and priority
    let changefreq = "daily"; // Default for most pages
    let priority = 0.7; // Default priority

    // Handle paths for main domain and subdomain
    let fullUrl = config.siteUrl + path; // Default to main site

    // Rewrite portfolio paths to root equivalents to avoid duplicate URLs
    if (path === "/portfolio") {
      fullUrl = `${config.siteUrl}/`;
    } else if (path.startsWith("/portfolio/")) {
      fullUrl = config.siteUrl + path.replace(/^\/portfolio/, "");
    }

    // Custom frequency and priority settings for specific paths
    if (path === "/resume") {
      changefreq = "weekly";
    }

    return {
      loc: fullUrl, // The full URL including domain
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};


