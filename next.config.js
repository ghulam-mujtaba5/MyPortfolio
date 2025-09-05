/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React Strict Mode
  
  // Basic configuration for portfolio site
  images: {
    unoptimized: true,
  },

  webpack: (config, { buildId, dev, isServer }) => {
    // Add support for source maps in development
    if (!isServer && dev) {
      config.devtool = "source-map";
    }
    return config;
  },
};

module.exports = nextConfig;
