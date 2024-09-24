// // lib/gtag.js
// export const GA_TRACKING_ID = 'G-8TZ75VJY1M';

// // Function to initialize Google Analytics
// export const initGA = () => {
//   // Initialize gtag.js
//   window.dataLayer = window.dataLayer || [];
//   function gtag() {
//     window.dataLayer.push(arguments);
//   }
//   gtag('js', new Date());

//   // Set up configuration
//   gtag('config', GA_TRACKING_ID);
// };

// // Log the pageview with the given URL
// export const pageview = (url) => {
//   if (typeof window !== 'undefined' && window.gtag) {
//     window.gtag('config', GA_TRACKING_ID, {
//       page_path: url,
//     });
//   }
// };

// // Log specific events happening
// export const event = ({ action, category, label, value }) => {
//   if (typeof window !== 'undefined' && window.gtag) {
//     window.gtag('event', action, {
//       event_category: category,
//       event_label: label,
//       value: value,
//     });
//   }
// };
// lib/gtag.js

//New code for avoid anlytics in devlopment mode
export const GA_TRACKING_ID = 'G-8TZ75VJY1M';

// Function to initialize Google Analytics
export const initGA = () => {
  if (process.env.NODE_ENV === 'production') {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());

    // Set up configuration
    gtag('config', GA_TRACKING_ID);
  }
};

// Log the pageview with the given URL
export const pageview = (url) => {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Log specific events happening
export const event = ({ action, category, label, value }) => {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
