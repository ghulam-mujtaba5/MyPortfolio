import React from "react";
import { useTheme } from "../../context/ThemeContext";
import styles from "./LoadingAnimation.module.css";

const LoadingAnimation = ({ visible = true }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`${styles.container} ${!visible ? styles.hidden : ""}`}
      data-theme={theme}
      role="status"
      aria-live="polite"
      aria-busy={visible}
      aria-hidden={!visible}
    >
      <div className={styles.spinnerBox}>
        <div className={`${styles.orbit} ${styles.orbit1}`}>
          <div className={styles.electron}></div>
        </div>
        <div className={`${styles.orbit} ${styles.orbit2}`}>
          <div className={styles.electron}></div>
        </div>
        <div className={`${styles.orbit} ${styles.orbit3}`}>
          <div className={styles.electron}></div>
        </div>
        <div className={styles.centralCore}></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
