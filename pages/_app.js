// // pages/_app.js
// import { Fragment, useEffect } from "react";
// import Head from "next/head";
// import { ThemeProvider } from '../context/ThemeContext';
// import Script from 'next/script';
// import { useRouter } from 'next/router';
// import * as gtag from '../lib/gtag';
// import './global.css';

// function MyApp({ Component, pageProps }) {
//   const router = useRouter();

//   useEffect(() => {
//     const handleRouteChange = (url) => {
//       gtag.pageview(url);
//     };

//     // Log initial pageview on component mount
//     gtag.pageview(router.pathname);

//     // Listen for route changes and log pageviews
//     router.events.on('routeChangeComplete', handleRouteChange);

//     // Clean up listeners when component unmounts
//     return () => {
//       router.events.off('routeChangeComplete', handleRouteChange);
//     };
//   }, [router.events, router.pathname]);

//   return (
//     <Fragment>
//       <Head>
//         <title>Portfolio</title>
//         <meta
//           name="viewport"
//           content="minimum-scale=1, initial-scale=1, width=device-width"
//         />
//       </Head>
//       <Script
//         id="google-analytics"
//         src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
//         strategy="afterInteractive"
//       />
//       <Script id="gtag-init" strategy="afterInteractive">
//         {`
//           window.dataLayer = window.dataLayer || [];
//           function gtag(){dataLayer.push(arguments);}
//           gtag('js', new Date());
//           gtag('config', '${gtag.GA_TRACKING_ID}', {
//             page_path: window.location.pathname,
//           });
//         `}
//       </Script>
//       <ThemeProvider>
//         <Component {...pageProps} />
//       </ThemeProvider>
//     </Fragment>
//   );
// }

// export default MyApp;
// pages/_app.js

//New code for avoid anlytics in devlopment mode
import { Fragment, useEffect } from "react";
import Head from "next/head";
import { ThemeProvider } from '../context/ThemeContext';
import Script from 'next/script';
import { useRouter } from 'next/router';
import * as gtag from '../lib/gtag';
import './global.css';

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

  return (
    <Fragment>
      <Head>
        <title>Portfolio</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
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
              });
            `}
          </Script>
        </>
      )}

      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </Fragment>
  );
}

export default MyApp;
