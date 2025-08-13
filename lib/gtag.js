// Unified tracking for subdomain and main domain
export const GA_TRACKING_ID = "G-8TZ75VJY1M"; // Replace with your actual GA Tracking ID

// Function to initialize Google Analytics
export const initGA = () => {
  if (process.env.NODE_ENV === "production") {
    // Only run in production environment
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());

    // Set up configuration for tracking both main domain and subdomains
    gtag("config", GA_TRACKING_ID, {
      cookie_domain: "ghulammujtaba.com", // Unified tracking across domain and subdomains
      cookie_flags: "SameSite=None; Secure", // Ensure cross-domain cookie sharing works
    });
  }
};

// Log the pageview with the given URL
export const pageview = (url) => {
  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    window.gtag
  ) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url, // Log the pageview with the correct URL
      cookie_domain: "ghulammujtaba.com", // Ensure the cookie is scoped across domain and subdomains
    });
  }
};

// Log specific events happening
export const event = ({ action, category, label, value }) => {
  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    window.gtag
  ) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      cookie_domain: "ghulammujtaba.com", // Make sure event tracking includes unified domain settings
    });
  }
};
