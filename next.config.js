// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //   reactStrictMode: true, // Enable React Strict Mode

// //   // Define other configurations as needed
// //   webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
// //     // Important: Add support for source maps
// //     if (!isServer) {
// //       config.devtool = 'source-map';
// //     }

// //     // Example: Add any additional webpack plugins or loaders
// //     // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

// //     return config;
// //   },

// //   // Example: Define other Next.js configurations
// //   // e.g., basePath, assetPrefix, images, redirects, headers, etc.
// // };

// // module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React Strict Mode
  productionBrowserSourceMaps: true, // Enable production source maps for better debugging

  async rewrites() {
    return [
      {
        source: "/:path((?!api/|admin/|articles/|_next/|static/).*)", // Exclude API, admin, articles, and Next internals
        destination: "/portfolio/:path*", // Redirect to the portfolio folder for localhost
        has: [
          {
            type: "host",
            value: "www.ghulammujtaba.com", // Main website on localhost
          },
        ],
      },
      {
        source: "/:path((?!api/|admin/|articles/|_next/|static/).*)", // SoftBuilt subdomain routes (exclude admin, articles, internals)
        destination: "/softbuilt/:path*", // Map to the softbuilt folder
        has: [
          {
            type: "host",
            value: "softbuilt.ghulammujtaba.com", // SoftBuilt subdomain
          },
        ],
      },
      // Fallback for preview deployments or any other domain for preview of vercel
      {
        // IMPORTANT: exclude admin (and Next.js internals) from being rewritten to portfolio
        // so that /admin/... pages (like edit pages) resolve correctly
        source: "/:path((?!api/|admin/|articles/|_next/|static/).*)",
        destination: "/portfolio/:path*",
      },
    ];
  },

  // Removed custom www to non-www redirect. Vercel will handle this automatically.

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: Add support for source maps
    if (!isServer) {
      config.devtool = "source-map";
    }

    // Example: Add any additional webpack plugins or loaders
    // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

    return config;
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy (CSP)
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://ghulammujtaba.com https://www.freepik.com https://img.freepik.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self';",
          },
          // HTTP Strict Transport Security (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Cross-Origin-Opener-Policy (COOP)
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // X-Frame-Options (XFO)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Canonical header for SEO
          {
            key: "Link",
            value: '<https://ghulammujtaba.com>; rel="canonical"',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

// //for run on loclhost//
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,

//   async redirects() {
//     return [
//       {
//         source: '/',
//         destination: '/portfolio',
//         permanent: false,
//       },
//     ];
//   },
// };

// module.exports = nextConfig;
