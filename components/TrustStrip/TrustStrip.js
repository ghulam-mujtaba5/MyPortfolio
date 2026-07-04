import React from "react";
import { motion } from "framer-motion";
import { fade, VIEWPORT } from "../../lib/motion";
import styles from "./TrustStrip.module.css";

// Real proof only — no fake clients, no invented awards, no inflated status
const PROOF_ITEMS = [
  { label: "Founder — Megicode" },
  { label: "Built CampusAxis · students across 260+ universities" },
  { label: "3+ yrs AI/ML — Meta projects via Appen" },
  { label: "Client work — shipped & paid" },
];

/**
 * Compact credibility band directly under the hero.
 * Text-only, hairline borders — trust through facts, not decoration.
 */
const TrustStrip = () => {
  return (
    <motion.div
      className={styles.strip}
      variants={fade}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      role="list"
      aria-label="Proof of work highlights"
    >
      <div className={styles.inner}>
        {PROOF_ITEMS.map((item) => (
          <span key={item.label} className={styles.item} role="listitem">
            {item.label}
          </span>
        ))}
        <span
          className={`${styles.item} ${styles.available}`}
          role="listitem"
        >
          <span className={styles.dot} aria-hidden="true" />
          Available for roles &amp; projects
        </span>
      </div>
    </motion.div>
  );
};

export default TrustStrip;
