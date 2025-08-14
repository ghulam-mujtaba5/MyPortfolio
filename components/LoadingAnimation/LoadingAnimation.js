import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import styles from "./LoadingAnimation.module.css";

const LoadingAnimation = ({
  visible = true,
  backdropBlur,
  backdropOpacity,
  showStars = true,
  size = "md", // 'sm' | 'md' | 'lg'
}) => {
  const { theme } = useTheme();
  const [stars, setStars] = useState([]);

  const bgColor = useMemo(() => {
    if (typeof backdropOpacity !== "number") return undefined;
    const base = theme === "dark" ? [29, 33, 39] : [255, 255, 255];
    return `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${Math.max(0, Math.min(backdropOpacity, 1))})`;
  }, [backdropOpacity, theme]);

  // generate a light starfield after mount to avoid SSR mismatch
  useEffect(() => {
    if (!showStars) return;
    const count = 8;
    const s = Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 2 + 1; // 1-3px
      const x = Math.random() * 100; // %
      const y = Math.random() * 100; // %
      const delay = Math.random() * 2; // 0-2s
      const dur = 2 + Math.random() * 2; // 2-4s
      return { id: i, size, x, y, delay, dur };
    });
    setStars(s);
  }, [showStars]);

  const scale = size === "sm" ? 0.8 : size === "lg" ? 1.2 : 1;

  return (
    <div
      className={`${styles.container} ${!visible ? styles.hidden : ""}`}
      data-theme={theme}
      role="status"
      aria-live="polite"
      aria-busy={visible}
      aria-hidden={!visible}
      style={{
        backdropFilter: typeof backdropBlur === "number" ? `blur(${backdropBlur}px)` : undefined,
        WebkitBackdropFilter: typeof backdropBlur === "number" ? `blur(${backdropBlur}px)` : undefined,
        backgroundColor: bgColor,
      }}
    >
      {/* ambient starfield */}
      {showStars && (
        <div className={styles.stars} aria-hidden>
          {stars.map((s) => (
            <span
              key={s.id}
              className={styles.star}
              style={{
                width: s.size,
                height: s.size,
                left: `${s.x}%`,
                top: `${s.y}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className={styles.spinnerBox} style={{ transform: `scale(${scale})` }}>
        <div className={`${styles.orbit} ${styles.orbit1}`}>
          <div className={styles.electron}></div>
        </div>
        <div className={`${styles.orbit} ${styles.orbit2}`}>
          <div className={styles.electron}></div>
        </div>
        <div className={`${styles.orbit} ${styles.orbit3}`}>
          <div className={styles.electron}></div>
        </div>
        <div className={`${styles.orbit} ${styles.orbit4}`}>
          <div className={styles.electron}></div>
        </div>
        <div className={`${styles.orbit} ${styles.orbit5}`}>
          <div className={styles.electron}></div>
        </div>
        <div className={styles.cometTrack}>
          <div className={styles.comet}></div>
        </div>
        <div className={styles.centralCore}></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
