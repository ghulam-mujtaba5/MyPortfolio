import React from "react";
import styles from "./StatusPill.module.css";

const StatusPill = ({ status }) => {
  const safeStatus = status || "draft"; // Default to 'draft' if status is undefined
  const statusClass = styles[safeStatus.toLowerCase()] || styles.default;

  return (
    <div className={`${styles.pill} ${statusClass}`}>
      <span className={styles.dot}></span>
      <span className={styles.text}>{safeStatus}</span>
    </div>
  );
};

export default StatusPill;
