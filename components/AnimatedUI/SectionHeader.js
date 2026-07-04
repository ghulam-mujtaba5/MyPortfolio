import React from "react";
import styles from "./SectionHeader.module.css";

/**
 * Consistent section anatomy sitewide:
 * mono eyebrow → Poppins headline in display ink → one-sentence lede.
 */
const SectionHeader = ({ eyebrow, title, lede, id, align = "left" }) => (
  <div
    className={`${styles.header} ${align === "center" ? styles.center : ""}`}
  >
    {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
    <h2 className={styles.title} id={id}>
      {title}
    </h2>
    {lede && <p className={styles.lede}>{lede}</p>}
  </div>
);

export default SectionHeader;
