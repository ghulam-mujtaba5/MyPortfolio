import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnects for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          {/* You can add font stylesheet here if you use Google Fonts */}
          
          {/* Theme colors for different contexts */}
          <meta name="theme-color" content="#23272F" media="(prefers-color-scheme: dark)" />
          <meta name="theme-color" content="#EAF6FF" media="(prefers-color-scheme: light)" />
          
          {/* Apple specific meta tags */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="GM Portfolio" />
          
          {/* Mobile optimization */}
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;