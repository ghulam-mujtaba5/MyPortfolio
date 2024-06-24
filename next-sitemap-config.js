module.exports = {
  siteUrl: 'http://ghulammujtaba.com', // Your site URL
  generateRobotsTxt: true, // Generate robots.txt file
  transform: async (config, path) => {
    // Default change frequency and priority
    let changefreq = 'weekly'; // Default for most pages
    let priority = 0.7; // Default priority

    // Custom frequency and priority settings for resume
    if (path === '/resume') {
      changefreq = 'monthly';
    }

    return {
      loc: path, // The URL path
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
