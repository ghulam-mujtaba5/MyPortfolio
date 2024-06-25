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
        source: '/softbuilt/:path*',
        has: [
          {
            type: 'host',
            value: 'softbuilt.ghulammujtaba.com',
          },
        ],
        destination: '/:path*',
      },
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
