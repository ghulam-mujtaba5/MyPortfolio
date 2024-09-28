// module.exports = {
//   siteUrl: 'http://ghulammujtaba.com', // Your site URL
//   generateRobotsTxt: true, // Generate robots.txt file
//   transform: async (config, path) => {
//     // Default change frequency and priority
//     let changefreq = 'daily'; // Default for most pages
//     let priority = 0.7; // Default priority

//     // Custom frequency and priority settings for resume
//     if (path === '/resume') {
//       changefreq = 'weekly';
//     }

//     return {
//       loc: path, // The URL path
//       changefreq,
//       priority,
//       lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
//     };
//   },
// };
module.exports = {
  siteUrl: 'http://ghulammujtaba.com', // Main site URL
  generateRobotsTxt: true, // Generate robots.txt file
  transform: async (config, path) => {
    // Default change frequency and priority
    let changefreq = 'daily'; // Default for most pages
    let priority = 0.7; // Default priority

    // Handle paths for main domain and subdomain
    let fullUrl = config.siteUrl + path; // Default to main site

    // Custom frequency and priority settings for specific paths
    if (path === '/resume') {
      changefreq = 'weekly';
    }

    // Check for specific subdomain paths
    if (path.startsWith('/softbuilt')) {
      fullUrl = `http://softbuilt.ghulammujtaba.com${path}`; // Update for subdomain
      changefreq = 'daily'; // Custom frequency for subdomain
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
