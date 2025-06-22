


import { Fragment, useEffect } from "react";
import Head from "next/head";
import SEO from '../components/SEO';
import { ThemeProvider } from '../context/ThemeContext';
import CookieConsentBanner from '../components/CookieConsentBanner/CookieConsentBanner';
import Script from 'next/script';
import { useRouter } from 'next/router';
import * as gtag from '../lib/gtag';
import './global.css';

// Register service worker for PWA
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const handleRouteChange = (url) => {
        gtag.pageview(url);
      };

      // Log initial pageview on component mount
      gtag.pageview(router.pathname);

      // Listen for route changes and log pageviews
      router.events.on('routeChangeComplete', handleRouteChange);

      // Clean up listeners when component unmounts
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, [router.events, router.pathname]);

  // ...existing code...

  return (
    <Fragment>
      <SEO />
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1d2127" />
      </Head>

      {process.env.NODE_ENV === 'production' && (
        <>
          <Script
            id="google-analytics"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gtag.GA_TRACKING_ID}', {
            page_path: window.location.pathname,
            cookie_domain: 'ghulammujtaba.com',
            cookie_flags: 'SameSite=None; Secure'
          });
        `}
      </Script>
      {/* TODO: Add cookie consent banner for GDPR/CCPA compliance if required */}
        </>
      )}

      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
      <CookieConsentBanner />
    </Fragment>
  );
}

export default MyApp;
