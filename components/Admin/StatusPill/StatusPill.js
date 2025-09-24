import React from "react";
import commonStyles from "./StatusPill.module.css";
import lightStyles from "./StatusPill.light.module.css";
import darkStyles from "./StatusPill.dark.module.css";
import { useTheme } from "../../../context/ThemeContext";

const StatusPill = ({ 
  status, 
  variant, 
  label,
  size = "md",
  className = ""
}) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  
  // Determine the status key for styling
  const statusKey = (variant || status || "draft").toLowerCase().replace(/\s+/g, "");
  
  // Get the appropriate CSS classes
  const statusClass = commonStyles[statusKey] || commonStyles.draft;
  const themeStatusClass = themeStyles[statusKey] || themeStyles.draft;
  
  // Size classes
  const sizeClasses = {
    sm: commonStyles.small,
    md: commonStyles.medium,
    lg: commonStyles.large
  };
  
  // Combine all classes
  const pillClasses = [
    commonStyles.pill,
    themeStyles.pill,
    statusClass,
    themeStatusClass,
    sizeClasses[size],
    className
  ].filter(Boolean).join(" ");
  
  // Display text
  const displayText = label || status || "Unknown";

  return (
    <div className={pillClasses} role="status" aria-label={`${displayText} status`}>
      <span className={`${commonStyles.dot} ${themeStyles.dot}`}></span>
      <span className={commonStyles.text}>{displayText}</span>
    </div>
  );
};

export default StatusPill;