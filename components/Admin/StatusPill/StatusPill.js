import React from "react";
import commonStyles from "./StatusPill.module.css";
import lightStyles from "./StatusPill.light.module.css";
import darkStyles from "./StatusPill.dark.module.css";
import { useTheme } from "../../../context/ThemeContext";

const StatusPill = ({ status, variant, label }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const safeStatus = status || "draft"; // display label fallback
  const key = (variant || safeStatus).toLowerCase().replace(/\s+/g, "");
  const statusClass = `${commonStyles[key] || ""} ${themeStyles[key] || ""}`;

  return (
    <div className={`${commonStyles.pill} ${themeStyles.pill} ${statusClass}`}>
      <span className={`${commonStyles.dot} ${themeStyles.dot}`}></span>
      <span className={commonStyles.text}>{label || safeStatus}</span>
    </div>
  );
};

export default StatusPill;
