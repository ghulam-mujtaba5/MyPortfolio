/**
 * Lazy Calendly popup loader.
 *
 * Calendly's widget script (~100 KB) is intentionally NOT loaded on initial
 * page render — it is injected on demand the first time a visitor chooses to
 * book a call, keeping the homepage payload light. After the assets load we
 * open the Calendly popup overlay so the visitor never leaves the site.
 */

const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";

let loadPromise = null;

function ensureCalendlyAssets() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Calendly is only available in the browser"));
  }
  if (window.Calendly) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // Stylesheet (idempotent)
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = WIDGET_CSS;
      document.head.appendChild(link);
    }

    // Script
    let script = document.querySelector(`script[src="${WIDGET_JS}"]`);
    if (script && window.Calendly) {
      resolve();
      return;
    }
    if (!script) {
      script = document.createElement("script");
      script.src = WIDGET_JS;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () =>
      reject(new Error("Failed to load Calendly widget")),
    );
  });

  return loadPromise;
}

/**
 * Open the Calendly scheduling popup for the given event URL.
 * Falls back to opening the link in a new tab if the widget can't load.
 * @param {string} url - Calendly event URL
 * @returns {Promise<boolean>} true if the in-page popup opened
 */
export async function openCalendlyPopup(url) {
  try {
    await ensureCalendlyAssets();
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url });
      return true;
    }
  } catch {
    // fall through to new-tab fallback
  }
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return false;
}
