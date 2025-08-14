import { Fragment, useEffect, useState, useRef } from "react";
import { hasAcceptedCookies } from "../utils/cookieConsent";
import Head from "next/head";
import SEO from "../components/SEO";
import { ThemeProvider } from "../context/ThemeContext";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import CookieConsentBanner from "../components/CookieConsentBanner/CookieConsentBanner";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import Script from "next/script";
import { useRouter } from "next/router";
import * as gtag from "../lib/gtag";
import LoadingAnimation from "../components/LoadingAnimation/LoadingAnimation";
import "./global.css";
import "../styles/tokens.css";

// Register service worker for PWA
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}

function MyApp({ Component, pageProps, session }) {
  const router = useRouter();
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [loading, setLoading] = useState(false); // raw router loading
  const [showLoader, setShowLoader] = useState(false); // debounced visual loader
  const loaderDelayRef = useRef(null);
  const loaderSafetyRef = useRef(null);

  useEffect(() => {
    setCookiesAccepted(hasAcceptedCookies());
    // Listen for changes to cookie consent
    const onStorage = () => setCookiesAccepted(hasAcceptedCookies());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Router loading listeners (always attach/cleanup)
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => {
      // ensure all timers are cleared and UI hides
      setLoading(false);
      clearTimeout(loaderDelayRef.current);
      clearTimeout(loaderSafetyRef.current);
      setShowLoader(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);
    // Also support hash-only changes
    router.events.on("hashChangeStart", handleStart);
    router.events.on("hashChangeComplete", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
      router.events.off("hashChangeStart", handleStart);
      router.events.off("hashChangeComplete", handleComplete);
    };
  }, [router.events]);

  // Debounce visual loader to avoid flashes and long hangs
  useEffect(() => {
    if (loading) {
      // show only if still loading after 200ms
      loaderDelayRef.current = setTimeout(() => setShowLoader(true), 200);
      // safety: auto-hide after 6s to prevent stuck overlay
      loaderSafetyRef.current = setTimeout(() => setShowLoader(false), 6000);
    } else {
      // route finished: clear timers and hide immediately
      clearTimeout(loaderDelayRef.current);
      clearTimeout(loaderSafetyRef.current);
      setShowLoader(false);
    }
    return () => {
      clearTimeout(loaderDelayRef.current);
      clearTimeout(loaderSafetyRef.current);
    };
  }, [loading]);

  // Google Analytics effect (production only)
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    // initial pageview
    gtag.pageview(router.pathname);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events, router.pathname]);

  return (
    <Fragment>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1d2127" />
      </Head>

      {process.env.NODE_ENV === "production" && cookiesAccepted && (
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
        </>
      )}

      <SessionProvider session={session}>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "#10B981", // A modern green
                color: "white",
              },
            },
            error: {
              style: {
                background: "#EF4444", // A modern red
                color: "white",
              },
            },
          }}
        />
        <ThemeProvider>
          {showLoader && <LoadingAnimation />}
          <Component {...pageProps} key={router.asPath} />
          <ThemeToggle />
          <CookieConsentBanner />
        </ThemeProvider>
      </SessionProvider>
    </Fragment>
  );
}

export default MyApp;
