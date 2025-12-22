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
import TopProgress from "../components/TopProgress/TopProgress";
import "./global.css";
import "../styles/tokens.css";
import "../styles/animations.css";
import "../styles/admin-premium.css";

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
  const [manualOverlay, setManualOverlay] = useState(false); // manual toggle via custom event
  const [topActive, setTopActive] = useState(false);
  const [topDone, setTopDone] = useState(false);
  const [loaderSettings, setLoaderSettings] = useState({
    backdropBlur: undefined,
    backdropOpacity: undefined,
  });
  const loaderDelayRef = useRef(null);
  const loaderSafetyRef = useRef(null);
  const topDoneTimerRef = useRef(null);
  const topSafetyRef = useRef(null);
  const topOpsRef = useRef(0); // number of in-page active operations

  useEffect(() => {
    setCookiesAccepted(hasAcceptedCookies());
    // Listen for changes to cookie consent
    const onStorage = () => setCookiesAccepted(hasAcceptedCookies());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Router loading listeners (always attach/cleanup)
  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      setTopDone(false);
      setTopActive(true);
      // Safety: auto-complete top bar after 6s to avoid being stuck
      clearTimeout(topSafetyRef.current);
      topSafetyRef.current = setTimeout(() => {
        // emulate completion if no complete event fires
        setTopDone(true);
        clearTimeout(topDoneTimerRef.current);
        topDoneTimerRef.current = setTimeout(() => {
          setTopActive(false);
          setTimeout(() => setTopDone(false), 180);
        }, 250);
      }, 6000);
    };
    const handleComplete = () => {
      // ensure all timers are cleared and UI hides
      setLoading(false);
      clearTimeout(loaderDelayRef.current);
      clearTimeout(loaderSafetyRef.current);
      clearTimeout(topSafetyRef.current);
      setShowLoader(false);
      // progress bar finish animation
      setTopDone(true);
      clearTimeout(topDoneTimerRef.current);
      topDoneTimerRef.current = setTimeout(() => {
        setTopActive(false);
        // reset done after a short delay so next start animates from 0
        setTimeout(() => setTopDone(false), 180);
      }, 250);
    };

    // View Transitions API integration for smooth page navigation
    const handleViewTransition = (callback) => {
      if (document.startViewTransition && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        document.startViewTransition(() => {
          callback();
        });
      } else {
        callback();
      }
    };

    const wrappedHandleStart = () => {
      handleViewTransition(() => {
        handleStart();
      });
    };

    const wrappedHandleComplete = () => {
      handleViewTransition(() => {
        handleComplete();
      });
    };

    router.events.on("routeChangeStart", wrappedHandleStart);
    router.events.on("routeChangeComplete", wrappedHandleComplete);
    router.events.on("routeChangeError", wrappedHandleComplete);
    // Also support hash-only changes
    router.events.on("hashChangeStart", wrappedHandleStart);
    router.events.on("hashChangeComplete", wrappedHandleComplete);

    return () => {
      router.events.off("routeChangeStart", wrappedHandleStart);
      router.events.off("routeChangeComplete", wrappedHandleComplete);
      router.events.off("routeChangeError", wrappedHandleComplete);
      router.events.off("hashChangeStart", wrappedHandleStart);
      router.events.off("hashChangeComplete", wrappedHandleComplete);
      clearTimeout(topSafetyRef.current);
      clearTimeout(topDoneTimerRef.current);
    };
  }, [router.events]);

  // Initial reset to avoid residual state on first paint (SSR -> CSR)
  useEffect(() => {
    setTopActive(false);
    setTopDone(false);
  }, []);

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

  // Allow pages/components to control the top bar with CustomEvents
  useEffect(() => {
    const onTop = (e) => {
      const d = (e && e.detail) || {};
      if (d.reset) {
        topOpsRef.current = 0;
        clearTimeout(topSafetyRef.current);
        clearTimeout(topDoneTimerRef.current);
        setTopActive(false);
        setTopDone(false);
        return;
      }
      if (d.active) {
        topOpsRef.current += 1;
        setTopDone(false);
        setTopActive(true);
        clearTimeout(topSafetyRef.current);
        // safety to avoid stuck bar if caller forgets to signal done
        topSafetyRef.current = setTimeout(() => {
          topOpsRef.current = 0;
          setTopDone(true);
          clearTimeout(topDoneTimerRef.current);
          topDoneTimerRef.current = setTimeout(() => {
            setTopActive(false);
            setTimeout(() => setTopDone(false), 180);
          }, 250);
        }, 6000);
      }
      if (d.done) {
        topOpsRef.current = Math.max(0, topOpsRef.current - 1);
        if (topOpsRef.current === 0) {
          clearTimeout(topSafetyRef.current);
          setTopDone(true);
          clearTimeout(topDoneTimerRef.current);
          topDoneTimerRef.current = setTimeout(() => {
            setTopActive(false);
            setTimeout(() => setTopDone(false), 180);
          }, 250);
        }
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("app:top", onTop);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("app:top", onTop);
      }
    };
  }, []);

  // Listen to custom app:loader events to allow manual overlay preview (from test page)
  useEffect(() => {
    const onManual = (e) => {
      const v = !!(e && e.detail && e.detail.visible);
      setManualOverlay(v);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("app:loader", onManual);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("app:loader", onManual);
      }
    };
  }, []);

  // Load loader settings from localStorage (visual only)
  useEffect(() => {
    const readSettings = () => {
      if (typeof window === "undefined") return;
      try {
        const blurRaw = localStorage.getItem("loader:blur");
        const opRaw = localStorage.getItem("loader:opacity");
        setLoaderSettings({
          backdropBlur: blurRaw !== null ? Number(blurRaw) : undefined,
          backdropOpacity: opRaw !== null ? Number(opRaw) : undefined,
        });
      } catch (e) {
        // no-op
      }
    };
    readSettings();
    const onStorage = (e) => {
      if (e && typeof e.key === "string" && e.key.startsWith("loader:")) {
        readSettings();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
          <TopProgress active={topActive} done={topDone} />
          <LoadingAnimation
            visible={showLoader || manualOverlay}
            backdropBlur={loaderSettings.backdropBlur}
            backdropOpacity={loaderSettings.backdropOpacity}
          />
          <Component {...pageProps} key={router.asPath} />
          <ThemeToggle />
          <CookieConsentBanner />
        </ThemeProvider>
      </SessionProvider>
    </Fragment>
  );
}

export default MyApp;
