/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
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
        destination: '/softbuilt/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ghulammujtaba.com',
          },
        ],
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
