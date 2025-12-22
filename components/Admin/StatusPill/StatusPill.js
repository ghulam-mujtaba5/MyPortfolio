import React from "react";
import styles from "./StatusPill.premium.module.css";

const StatusPill = ({ 
  status, 
  variant, 
  label,
  size = "md",
  className = ""
}) => {
  // Determine the status key for styling
  const statusKey = (variant || status || "draft").toLowerCase().replace(/\s+/g, "");
  
  // Get the appropriate CSS class
  const statusClass = styles[statusKey] || styles.draft;
  
  // Size classes
  const sizeClasses = {
    sm: styles.small,
    md: "",
    lg: styles.large
  };
  
  // Combine all classes
  const pillClasses = [
    styles.pill,
    statusClass,
    sizeClasses[size],
    className
  ].filter(Boolean).join(" ");
  
  // Display text
  const displayText = label || status || "Unknown";

  return (
    <div className={pillClasses} role="status" aria-label={`${displayText} status`}>
      <span className={styles.text}>{displayText}</span>
    </div>
  );
};

export default StatusPill;