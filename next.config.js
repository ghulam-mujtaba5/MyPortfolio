/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React Strict Mode

  webpack: (config, { isServer }) => {
    // Important: Add support for source maps
    if (!isServer) {
      config.devtool = 'source-map';
    }

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/:path*', // Default source for main domain
        destination: '/:path*', // Default rewrite for main domain
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'softbuilt.ghulammujtaba.com',
          },
        ],
        destination: '/softbuilt/:path*', // Rewrite to /softbuilt for subdomain
      },
    ];
  },
};

module.exports = nextConfig;
