import React from "react";
import styles from "./Spinner.module.css";

/**
 * Spinner: lightweight inline loader (no backdrop)
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' | number (pixels)
 * - color: CSS color (overrides default brand blue)
 * - label: optional accessible text (visually hidden)
 */
export default function Spinner({ size = "md", color, label = "Loading" }) {
  const px = typeof size === "number" ? `${size}px` : size === "sm" ? "16px" : size === "lg" ? "28px" : "22px";
  const style = {
    "--size": px,
    "--spinner-color": color || undefined,
  };

  return (
    <span className={styles.wrapper} role="status" aria-live="polite" aria-busy="true">
      <span className={styles.spinner} style={style}>
        <span className={styles.ring} />
      </span>
      {label ? (
        <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
          {label}
        </span>
      ) : null}
    </span>
  );
}
