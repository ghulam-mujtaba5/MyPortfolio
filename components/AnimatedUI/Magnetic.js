import React, { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { MAGNETIC_SPRING } from "../../lib/motion";

// Max pull toward the cursor, px (plan §4: ±3px, primary CTAs only)
const MAX_PULL = 3;

/**
 * Magnetic wrapper for primary conversion CTAs.
 * Nudges the child ±3px toward the cursor on hover with a spring.
 * Desktop fine-pointer only; inert under reduced motion and on touch.
 */
const Magnetic = ({ children, className, style }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, MAGNETIC_SPRING);
  const springY = useSpring(y, MAGNETIC_SPRING);
  const prefersReducedMotion = useReducedMotion();

  const handlePointerMove = useCallback(
    (e) => {
      if (prefersReducedMotion || e.pointerType !== "mouse") return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      x.set(Math.max(-1, Math.min(1, relX)) * MAX_PULL);
      y.set(Math.max(-1, Math.min(1, relY)) * MAX_PULL);
    },
    [prefersReducedMotion, x, y]
  );

  const handlePointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ display: "inline-flex", x: springX, y: springY, ...style }}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
