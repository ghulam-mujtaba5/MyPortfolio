import React, { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { TILT_SPRING } from "../../lib/motion";
import styles from "./Tilt.module.css";

/**
 * 3D tilt wrapper for case-study cards — the card responds to the cursor
 * like a physical object being examined, with a specular glare that tracks
 * the pointer (rendered by <TiltGlare/> placed INSIDE the card so the
 * card's own overflow/radius clips it).
 *
 * Transform-only, spring-damped, mouse pointers only; fully inert under
 * reduced motion and on touch devices.
 */
const Tilt = ({ children, max = 4, className, style }) => {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springRx = useSpring(rx, TILT_SPRING);
  const springRy = useSpring(ry, TILT_SPRING);
  const prefersReducedMotion = useReducedMotion();

  const handlePointerMove = useCallback(
    (e) => {
      if (prefersReducedMotion || e.pointerType !== "mouse") return;
      const el = ref.current;
      const rect = el?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const relX = (e.clientX - rect.left) / rect.width; // 0..1
      const relY = (e.clientY - rect.top) / rect.height;
      ry.set((relX - 0.5) * 2 * max);
      rx.set(-(relY - 0.5) * 2 * max);
      // Glare position/visibility — inherited by <TiltGlare/> inside the card
      el.style.setProperty("--gx", `${(relX * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(relY * 100).toFixed(1)}%`);
      el.style.setProperty("--glare-o", "1");
    },
    [prefersReducedMotion, max, rx, ry],
  );

  const handlePointerLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
    ref.current?.style.setProperty("--glare-o", "0");
  }, [rx, ry]);

  return (
    <motion.div
      ref={ref}
      className={`${styles.tilt} ${className || ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX: springRx,
        rotateY: springRy,
        transformPerspective: 900,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

/** Specular highlight layer — place as the last child of the tilted card. */
export const TiltGlare = () => (
  <span className={styles.glare} aria-hidden="true" />
);

export default Tilt;
