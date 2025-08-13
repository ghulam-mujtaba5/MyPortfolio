import React from "react";
import commonStyles from "./StatusPill.module.css";
import lightStyles from "./StatusPill.light.module.css";
import darkStyles from "./StatusPill.dark.module.css";
import { useTheme } from "../../../context/ThemeContext";

const StatusPill = ({ status }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const safeStatus = status || "draft"; // Default to 'draft' if status is undefined
  const statusClass = `${commonStyles[safeStatus.toLowerCase()] || ""} ${themeStyles[safeStatus.toLowerCase()] || ""}`;

  return (
    <div className={`${commonStyles.pill} ${themeStyles.pill} ${statusClass}`}>
      <span className={`${commonStyles.dot} ${themeStyles.dot}`}></span>
      <span className={commonStyles.text}>{safeStatus}</span>
    </div>
  );
};

export default StatusPill;
