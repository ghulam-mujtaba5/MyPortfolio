import React, { useState, useEffect } from "react";
import commonStyles from "./CookieConsentBannerCommon.module.css";
import lightStyles from "./CookieConsentBannerLight.module.css";
import darkStyles from "./CookieConsentBannerDark.module.css";
import { useTheme } from "../../context/ThemeContext";

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  const { theme = "light" } = useTheme() || {};

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) setVisible(true);
      } catch (e) {
        setVisible(true); // fallback: show banner if localStorage fails
      }
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem("cookie_consent", "true");
    } catch (e) {}
    setVisible(false);
  };

  const declineCookies = () => {
    try {
      localStorage.setItem("cookie_consent", "declined");
    } catch (e) {}
    setVisible(false);
  };

  const frameStyles = theme === "dark" ? darkStyles : lightStyles;

  if (!visible) return null;

  return (
    <div className={`${commonStyles.banner} ${frameStyles.banner}`}>
      <span className={`${commonStyles.text} ${frameStyles.text}`}>
        This site uses cookies for a better experience.{" "}
        <a
          href="/privacy-policy"
          className={`${commonStyles.link} ${frameStyles.link}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        .
      </span>
      <div className={`${commonStyles.actions} ${frameStyles.actions}`}>
        <button
          className={`${commonStyles.button} ${frameStyles.button}`}
          onClick={acceptCookies}
        >
          Accept
        </button>
        <button
          className={`${commonStyles.buttonSecondary} ${frameStyles.buttonSecondary}`}
          onClick={declineCookies}
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
