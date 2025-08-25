
module.exports = {
  siteUrl: "https://ghulammujtaba.com", // Main site URL (HTTPS)
  generateRobotsTxt: true, // Generate robots.txt file
  // Exclude non-public routes from sitemap
  exclude: [
    "/admin",
    "/admin/*",
    "/api/*",
    "/softbuilt/admin/*",
  ],
  // Optional robots rules if next-sitemap generates robots.txt
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin/", "/api/"] },
    ],
  },
  // Programmatically include dynamic routes for Articles and Projects
  // so Google sees all canonical URLs in sitemap.xml
  additionalPaths: async (config) => {
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

    // Custom frequency and priority settings for specific paths
    if (path === "/resume") {
      changefreq = "weekly";
    }

    // Check for specific subdomain paths
    if (path.startsWith("/softbuilt")) {
      fullUrl = `https://softbuilt.ghulammujtaba.com${path}`; // Use HTTPS for subdomain
      changefreq = "daily"; // Custom frequency for subdomain
      priority = 0.8; // Higher priority for subdomain pages
    }

    return {
      loc: fullUrl, // The full URL including domain
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};

