// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true, // Enable React Strict Mode

//   // Define other configurations as needed
//   webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
//     // Important: Add support for source maps
//     if (!isServer) {
//       config.devtool = 'source-map';
//     }

//     // Example: Add any additional webpack plugins or loaders
//     // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

//     return config;
//   },

//   // Example: Define other Next.js configurations
//   // e.g., basePath, assetPrefix, images, redirects, headers, etc.
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React Strict Mode

  async rewrites() {
    return [
      {
        source: '/:path*',  // Catch all paths
        destination: '/portfolio/:path*', // Redirect to the portfolio folder for localhost
        has: [
          {
            type: 'host',
            value: 'www.ghulammujtaba.com', // Main website on localhost
          },
        ],
      },
      {
        source: '/:path*', // SoftBuilt subdomain routes
        destination: '/softbuilt/:path*', // Map to the softbuilt folder
        has: [
          {
            type: 'host',
            value: 'softbuilt.ghulammujtaba.com', // SoftBuilt subdomain
          },
        ],
      },
    ];
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: Add support for source maps
    if (!isServer) {
      config.devtool = 'source-map';
    }

    // Example: Add any additional webpack plugins or loaders
    // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

    return config;
  },
};

module.exports = nextConfig;
