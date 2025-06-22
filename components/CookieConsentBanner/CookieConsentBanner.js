import React, { useState, useEffect } from 'react';
import styles from './CookieConsentBanner.module.css';
import { useTheme } from '../../context/ThemeContext';

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  let theme = 'light';
  let themeCtx;
  try {
    themeCtx = useTheme();
    if (themeCtx && themeCtx.theme) theme = themeCtx.theme;
  } catch (e) {
    // fallback to light if ThemeProvider is missing
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) setVisible(true);
      } catch (e) {
        setVisible(true); // fallback: show banner if localStorage fails
      }
    }
  }, []);


  const acceptCookies = () => {
    try {
      localStorage.setItem('cookie_consent', 'true');
    } catch (e) {}
    setVisible(false);
  };

  const declineCookies = () => {
    try {
      localStorage.setItem('cookie_consent', 'declined');
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={`${styles.banner} ${theme === 'dark' ? styles.dark : styles.light}`}> 
      <span className={styles.text}>
        This site uses cookies for a better experience.{' '}
        <a href="/privacy-policy" className={styles.link} target="_blank" rel="noopener noreferrer">Learn more</a>.
      </span>
      <div className={styles.actions}>
        <button className={styles.button} onClick={acceptCookies}>
          Accept
        </button>
        <button className={styles.buttonSecondary} onClick={declineCookies}>
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
