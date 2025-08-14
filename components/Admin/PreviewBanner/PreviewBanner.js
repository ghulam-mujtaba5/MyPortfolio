import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import styles from "./PreviewBanner.module.css";
import lightStyles from "./PreviewBanner.light.module.css";
import darkStyles from "./PreviewBanner.dark.module.css";

export default function PreviewBanner() {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  return (
    <div className={`${styles.banner} ${themeStyles.banner}`} role="status" aria-live="polite">
      You are viewing a preview. Content may change.
    </div>
  );
}
