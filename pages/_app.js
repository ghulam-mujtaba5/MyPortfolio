import { Fragment, useEffect, useState, useRef, useCallback } from "react";
import { hasAcceptedCookies } from "../utils/cookieConsent";
import Head from "next/head";
import { ThemeProvider } from "../context/ThemeContext";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import CookieConsentBanner from "../components/CookieConsentBanner/CookieConsentBanner";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import Script from "next/script";
import { useRouter } from "next/router";
import * as gtag from "../lib/gtag";
import LoadingAnimation from "../components/LoadingAnimation/LoadingAnimation";
import TopProgress from "../components/TopProgress/TopProgress";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";
import "./global.css";
import "../styles/tokens.css";
import "../styles/animations.css";
import "../styles/admin-premium.css";

// Register service worker for PWA (only in browser)
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // Service worker registration failed - ignore silently
    });
  });
}

// Constants for timing
const LOADER_DELAY_MS = 300; // Show loader only after this delay
const LOADER_SAFETY_TIMEOUT_MS = 8000; // Auto-hide loader after this time
const TOP_BAR_COMPLETE_DELAY_MS = 300; // Delay before hiding top progress bar

function MyApp({ Component, pageProps, session }) {
  const router = useRouter();
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  // Navigation loading state
  const [isNavigating, setIsNavigating] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [topProgress, setTopProgress] = useState({
    active: false,
    done: false,
  });

  // Manual overlay for testing/preview
  const [manualOverlay, setManualOverlay] = useState(false);

  // Loader visual settings
  const [loaderSettings, setLoaderSettings] = useState({
    backdropBlur: undefined,
    backdropOpacity: undefined,
  });

  // Refs for managing timers
  const timersRef = useRef({
    loaderDelay: null,
    loaderSafety: null,
    topBarComplete: null,
  });

  // Clear all timers helper
  const clearAllTimers = useCallback(() => {
    const timers = timersRef.current;
    if (timers.loaderDelay) clearTimeout(timers.loaderDelay);
    if (timers.loaderSafety) clearTimeout(timers.loaderSafety);
    if (timers.topBarComplete) clearTimeout(timers.topBarComplete);
    timers.loaderDelay = null;
    timers.loaderSafety = null;
    timers.topBarComplete = null;
  }, []);

  // Handle navigation start
  const handleNavigationStart = useCallback(() => {
    clearAllTimers();
    setIsNavigating(true);
    setTopProgress({ active: true, done: false });

    // Only show full-page loader after a delay (prevents flash for fast navigations)
    timersRef.current.loaderDelay = setTimeout(() => {
      setShowLoader(true);
    }, LOADER_DELAY_MS);

    // Safety timeout to prevent stuck loader
    timersRef.current.loaderSafety = setTimeout(() => {
      setShowLoader(false);
      setIsNavigating(false);
      setTopProgress({ active: false, done: false });
    }, LOADER_SAFETY_TIMEOUT_MS);
  }, [clearAllTimers]);

  // Handle navigation complete
  const handleNavigationComplete = useCallback(() => {
    clearAllTimers();
    setIsNavigating(false);
    setShowLoader(false);

    // Animate top progress bar completion
    setTopProgress({ active: true, done: true });

    timersRef.current.topBarComplete = setTimeout(() => {
      setTopProgress({ active: false, done: false });
    }, TOP_BAR_COMPLETE_DELAY_MS);
  }, [clearAllTimers]);

  // Cookie consent initialization
  useEffect(() => {
    setCookiesAccepted(hasAcceptedCookies());

    const onStorage = () => setCookiesAccepted(hasAcceptedCookies());
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Router event listeners
  useEffect(() => {
    // Wrap with View Transitions API if available and user prefers motion
    const withViewTransition = (callback) => {
      if (
        typeof document !== "undefined" &&
        document.startViewTransition &&
        window.matchMedia("(prefers-reduced-motion: no-preference)").matches
      ) {
        document.startViewTransition(callback);
      } else {
        callback();
      }
    };

    const onStart = () => withViewTransition(handleNavigationStart);
    const onComplete = () => withViewTransition(handleNavigationComplete);
    const onError = () => withViewTransition(handleNavigationComplete);

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onComplete);
    router.events.on("routeChangeError", onError);
    router.events.on("hashChangeStart", onStart);
    router.events.on("hashChangeComplete", onComplete);

    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onComplete);
      router.events.off("routeChangeError", onError);
      router.events.off("hashChangeStart", onStart);
      router.events.off("hashChangeComplete", onComplete);
      clearAllTimers();
    };
  }, [
    router.events,
    handleNavigationStart,
    handleNavigationComplete,
    clearAllTimers,
  ]);

  // Custom event listener for manual overlay control (for testing)
  useEffect(() => {
    const onManualOverlay = (e) => {
      setManualOverlay(!!e?.detail?.visible);
    };

    window.addEventListener("app:loader", onManualOverlay);
    return () => window.removeEventListener("app:loader", onManualOverlay);
  }, []);

  // Custom event listener for top progress bar control
  useEffect(() => {
    const onTopProgress = (e) => {
      const detail = e?.detail || {};

      if (detail.reset) {
        clearAllTimers();
        setTopProgress({ active: false, done: false });
        return;
      }

      if (detail.active) {
        setTopProgress({ active: true, done: false });
      }

      if (detail.done) {
        setTopProgress((prev) => ({ ...prev, done: true }));
        timersRef.current.topBarComplete = setTimeout(() => {
          setTopProgress({ active: false, done: false });
        }, TOP_BAR_COMPLETE_DELAY_MS);
      }
    };

    window.addEventListener("app:top", onTopProgress);
    return () => window.removeEventListener("app:top", onTopProgress);
  }, [clearAllTimers]);

  // Load loader visual settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const blur = localStorage.getItem("loader:blur");
        const opacity = localStorage.getItem("loader:opacity");
        setLoaderSettings({
          backdropBlur: blur !== null ? Number(blur) : undefined,
          backdropOpacity: opacity !== null ? Number(opacity) : undefined,
        });
      } catch {
        // Ignore localStorage errors
      }
    };

    loadSettings();

    const onStorage = (e) => {
      if (e?.key?.startsWith("loader:")) {
        loadSettings();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Google Analytics (production only)
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };

    // Initial pageview
    gtag.pageview(router.pathname);

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events, router.pathname]);

  return (
    <Fragment>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=5.0, user-scalable=yes"
        />
      </Head>

      {/* Google Analytics - Production only with Consent Mode */}
      {process.env.NODE_ENV === "production" && (
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
              gtag('consent', 'default', {
                analytics_storage: '${cookiesAccepted ? "granted" : "denied"}',
                ad_storage: 'denied',
              });
              gtag('js', new Date());
              gtag('config', '${gtag.GA_TRACKING_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
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
                background: "#10B981",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#EF4444",
                color: "white",
              },
            },
          }}
        />
        <ThemeProvider>
          {/* Top progress bar for navigation */}
          <TopProgress active={topProgress.active} done={topProgress.done} />

          {/* Full-page loading overlay */}
          <LoadingAnimation
            visible={showLoader || manualOverlay}
            backdropBlur={loaderSettings.backdropBlur}
            backdropOpacity={loaderSettings.backdropOpacity}
          />

          {/* Page content wrapped in ErrorBoundary */}
          <ErrorBoundary key={router.asPath}>
            <Component {...pageProps} key={router.asPath} />
          </ErrorBoundary>

          {/* Global UI elements */}
          <ThemeToggle />
          <CookieConsentBanner />
        </ThemeProvider>
      </SessionProvider>
    </Fragment>
  );
}

export default MyApp;
