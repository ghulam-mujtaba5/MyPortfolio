import React from "react";
import styles from "./AmbientOrbs.module.css";

/**
 * Ambient 3D glass spheres — pure CSS (layered radial gradients + inner
 * shading), one motif reused across sections so the decoration reads as a
 * system, not a one-off:
 *
 *  - "hero":     a single small, blurred, far-away sphere (top right) that
 *                rides the HeroDepth --hx/--hy cursor vars. Kept minimal —
 *                the hero already has rings, chips and the pipeline.
 *  - "journey":  two spheres in the empty top-right band of the Founder
 *                Journey timeline (also appears on the About page).
 *  - "projects": one sphere beside the left-aligned section header of the
 *                Proof of Work grid.
 *
 * Each variant's host container must be position:relative. Desktop only,
 * aria-hidden, pointer-events none; static under reduced motion.
 */
const VARIANTS = {
  hero: ["heroFar"],
  journey: ["journeyMain", "journeySmall"],
  projects: ["projectsMain"],
};

const AmbientOrbs = ({ variant = "hero" }) => {
  const orbs = VARIANTS[variant] || [];
  if (orbs.length === 0) return null;
  return (
    <div className={styles.orbLayer} aria-hidden="true">
      {orbs.map((name) => (
        <span key={name} className={`${styles.orb} ${styles[name]}`} />
      ))}
    </div>
  );
};

export default AmbientOrbs;
