import React from "react";
import styles from "./PreviewBanner.premium.module.css";

export default function PreviewBanner() {
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      You are viewing a preview. Content may change.
    </div>
  );
}
