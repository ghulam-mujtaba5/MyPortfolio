/**
 * Motion design system — single source of truth for Framer Motion values.
 *
 * Rules:
 *  - Animate only `transform` and `opacity`.
 *  - Entrances <= 600ms, hovers <= 200ms, stagger <= 5 items.
 *  - Every scroll reveal fires once (VIEWPORT.once).
 *  - Looping/ambient animation must check useReducedMotion() and render
 *    its static end-state instead.
 */

// Decisive out-quint feel — used for all entrances
export const EASE = [0.22, 1, 0.36, 1];

export const DUR = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
};

export const VIEWPORT = { once: true, amount: 0.2 };

/** Rise from below with fade — default section/card entrance */
export const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.slow, ease: EASE },
  },
};

/** Simple fade — for strips, dividers, ambient layers */
export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.base } },
};

/** Parent variant that staggers `rise`/`fade` children */
export const stagger = (delay = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

/** SVG path draw — pipeline motif */
export const drawLine = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: EASE },
  },
};

/** Pop-in for small nodes/chips riding a drawn line */
export const nodePop = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
};

/** Spring used by magnetic CTAs (desktop only) */
export const MAGNETIC_SPRING = { stiffness: 300, damping: 20 };
