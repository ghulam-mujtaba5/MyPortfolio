/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React Strict Mode
  // Next.js 16: Turbopack is enabled by default. Since this project also customizes webpack,
  // provide an explicit Turbopack config to avoid build errors about mixed configurations.
  turbopack: {},

  // Next.js Image Optimization — allow external image sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ghulammujtaba.com",
      },
      {
        protocol: "https",
        hostname: "www.ghulammujtaba.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "www.freepik.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
    // Serve modern formats, fallback to original
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 30 days
    minimumCacheTTL: 2592000,
    // Allow SVG with content disposition
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async rewrites() {
    return [
      {
        source: "/:path((?!api/|admin/|articles/|projects/|_next/|static/).*)", // Exclude API, admin, articles, projects, and Next internals
        destination: "/portfolio/:path*", // Redirect to the portfolio folder for localhost
        has: [
          {
            type: "host",
            value: "www.ghulammujtaba.com", // Main website on localhost
          },
        ],
      },
      // Fallback for preview deployments or any other domain for preview of vercel
      {
        // IMPORTANT: exclude admin (and Next.js internals) from being rewritten to portfolio
        // so that /admin/... pages (like edit pages) resolve correctly
        source: "/:path((?!api/|admin/|articles/|projects/|_next/|static/).*)",
        destination: "/portfolio/:path*",
      },
    ];
  },

  // Removed custom www to non-www redirect. Vercel will handle this automatically.

  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/articles/:slug",
        permanent: true,
      },
    ];
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Example: Add any additional webpack plugins or loaders
    // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

    return config;
  },
  async headers() {
    return [
      // Cache public pages (exclude admin and API)
      {
        source: "/((?!admin|api).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // Prevent search engines from indexing API routes
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
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
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' https://www.google-analytics.com https://res.cloudinary.com https://*.cloudinary.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self';",
          },
          // Report-Only CSP to capture violations without breaking pages
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' https://www.google-analytics.com https://res.cloudinary.com https://*.cloudinary.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; report-uri /api/csp-report; report-to csp-endpoint;",
          },
          // Reporting API endpoint mapping
          {
            key: "Reporting-Endpoints",
            value: "csp-endpoint=\"/api/csp-report\"",
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;
