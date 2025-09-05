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

  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ghulammujtaba.com' }],
        destination: 'https://ghulammujtaba.com/:path*',
        permanent: true,
      },
      // Redirect http to https
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://ghulammujtaba.com/:path*',
        permanent: true,
      },
      // Main domain to /portfolio
      {
        source: '/',
        has: [{ type: 'host', value: 'ghulammujtaba.com' }],
        destination: '/portfolio',
        permanent: true,
      },
      // SoftBuilt subdomain to /softbuilt
      {
        source: '/',
        has: [{ type: 'host', value: 'softbuilt.ghulammujtaba.com' }],
        destination: '/softbuilt',
        permanent: true,
      },
    ];
  },

  // Removed custom www to non-www redirect. Vercel will handle this automatically.

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: Add support for source maps
    if (!isServer) {
      config.devtool = 'source-map';
    }

    // Example: Add any additional webpack plugins or loaders
    // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://ghulammujtaba.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self';"
          },
          // HTTP Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Cross-Origin-Opener-Policy (COOP)
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          // X-Frame-Options (XFO)
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Canonical header for SEO
          {
            key: 'Link',
            value: '<https://ghulammujtaba.com>; rel="canonical"'
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
