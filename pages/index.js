// // pages/index.js (or index.tsx)
// import React, { useEffect } from 'react';
// import { useRouter } from 'next/router';
// import HomePortfolio from './HomePortfolio';
// import Script from 'next/script'; // Import Script component from next/script
// import * as gtag from '../lib/gtag'; // Import gtag functions

// const IndexPage = () => {
//   const router = useRouter();

//   useEffect(() => {
//     const handleRouteChange = (url) => {
//       gtag.pageview(url); // Log pageview on route change
//     };

//     // Log initial pageview on component mount
//     gtag.pageview(router.pathname);

//     // Listen for route changes and log pageviews
//     router.events.on('routeChangeComplete', handleRouteChange);

//     // Clean up listeners when component unmounts
//     return () => {
//       router.events.off('routeChangeComplete', handleRouteChange);
//     };
//   }, [router.events]);

//   return (
//     <>
//       {/* Google Analytics Script */}
//       <Script
//         id="google-analytics"
//         src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
//         onLoad={() => {
//           window.dataLayer = window.dataLayer || [];
//           function gtag() {
//             window.dataLayer.push(arguments);
//           }
//           gtag('js', new Date());
//           gtag('config', gtag.GA_TRACKING_ID);
//         }}
//       />

//       {/* Render your main component */}
//       <HomePortfolio />
//     </>
//   );
// };

// export default IndexPage;


// pages/index.js
import React from 'react';
import HomePortfolio from './HomePortfolio';

const IndexPage = () => {
  return <HomePortfolio />;
};

export default IndexPage;
