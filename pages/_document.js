import Document, { Html, Head, Main, NextScript } from "next/document";

// Inline script to prevent flash of wrong theme
// This runs synchronously before React hydration
const themeScript = `
(function() {
  try {
    var savedMode = localStorage.getItem('themeMode');
    var mode = savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto' ? savedMode : 'auto';
    var theme = mode;
    if (mode === 'auto') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* DNS prefetch & preconnects for faster resource loading */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />

          {/* Security headers hint */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          {/* You can add font stylesheet here if you use Google Fonts */}

          {/* Theme colors for different contexts */}
          <meta
            name="theme-color"
            content="#23272F"
            media="(prefers-color-scheme: dark)"
          />
          <meta
            name="theme-color"
            content="#EAF6FF"
            media="(prefers-color-scheme: light)"
          />

          {/* Apple specific meta tags */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content="GM Portfolio" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />

          {/* Mobile optimization */}
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
          />
        </Head>
        <body>
          {/* Theme script runs before React to prevent flash */}
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
