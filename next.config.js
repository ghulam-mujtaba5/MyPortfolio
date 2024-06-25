// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true, // Enable React Strict Mode

//   webpack: (config, { isServer }) => {
//     // Important: Add support for source maps
//     if (!isServer) {
//       config.devtool = 'source-map';
//     }

//     return config;
//   },

//   async rewrites() {
//     return [
//       {
//         source: '/softbuilt/:path*',
//         has: [
//           {
//             type: 'host',
//             value: 'softbuilt.ghulammujtaba.com',
//           },
//         ],
//         destination: '/:path*',
//       },
//       {
//         source: '/:path*',
//         destination: '/:path*',
//       },
//     ];
//   },
// };

// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React Strict Mode

  // Define other configurations as needed
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: Add support for source maps
    if (!isServer) {
      config.devtool = 'source-map';
    }

    // Example: Add any additional webpack plugins or loaders
    // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

    return config;
  },

  // Example: Define other Next.js configurations
  // e.g., basePath, assetPrefix, images, redirects, headers, etc.
};

module.exports = nextConfig;
