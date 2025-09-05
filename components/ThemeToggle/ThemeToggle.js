import React, { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import common from "./ThemeToggle.module.css";
import light from "./ThemeToggle.light.module.css";
import dark from "./ThemeToggle.dark.module.css";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const styles = theme === "dark" ? dark : light;
  const btnRef = useRef(null);

  const onMouseMove = (e) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width; // ~ -0.5..0.5
    const dy = (e.clientY - cy) / rect.height; // ~ -0.5..0.5
    el.style.setProperty("--tx", (dx * 6).toFixed(3));
    el.style.setProperty("--ty", (dy * 6).toFixed(3));
  };

  const onMouseLeave = () => {
    const el = btnRef.current;
    if (!el) return;
    el.style.setProperty("--tx", "0");
    el.style.setProperty("--ty", "0");
  };

  const onClick = () => {
    const el = btnRef.current;
    if (el) {
      el.classList.remove(common.pulse);
      // force reflow to restart animation
      // eslint-disable-next-line no-unused-expressions
      void el.offsetWidth;
      el.classList.add(common.pulse);
    }
    toggleTheme();
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`${common.toggle} ${styles.toggle}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      ref={btnRef}
      data-mode={theme}
    >
      <span className={`${common.halo} ${styles.halo}`} aria-hidden />
      <span className={`${common.iconBg} ${styles.iconBg}`} aria-hidden />
      <span className={common.iconWrap} aria-hidden>
        {/* Sun (light) */}
        <svg
          className={common.sunIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <radialGradient id="tg-sun-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd166" stopOpacity="1" />
              <stop offset="100%" stopColor="#fca311" stopOpacity="1" />
            </radialGradient>
          </defs>
          <circle
            cx="12"
            cy="12"
            r="4.25"
            fill="url(#tg-sun-grad)"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.64 5.64 4.22 4.22M19.78 19.78l-1.42-1.42M18.36 5.64l1.42-1.42M5.64 18.36 4.22 19.78"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        {/* Moon (dark) */}
        <svg
          className={common.moonIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <radialGradient id="tg-moon-grad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="1" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="1" />
            </radialGradient>
          </defs>
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7.5 7.5 0 0 0 21 12.79Z"
            fill="url(#tg-moon-grad)"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="6" cy="7" r="0.8" fill="currentColor" />
          <circle cx="8.5" cy="10" r="0.5" fill="currentColor" />
          <circle cx="7" cy="13" r="0.6" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggle;
