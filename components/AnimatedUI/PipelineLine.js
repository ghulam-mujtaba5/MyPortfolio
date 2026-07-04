import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "../../lib/motion";
import styles from "./PipelineLine.module.css";

const STAGES = ["Idea", "Design", "Build", "Launch"];

// Geometry constants for the SVG (viewBox units)
const VIEW_W = 440;
const VIEW_H = 58;
const LINE_Y = 14;
const NODE_R = 5;
const PAD_X = 10;

/**
 * The site's signature motif: a pipeline line that draws itself from
 * Idea to Launch. The Launch node uses the conversion accent — the same
 * color as the "Start a Project" CTA, tying the story to the action.
 * Decorative: hidden from screen readers, static under reduced motion.
 */
const PipelineLine = ({ className = "" }) => {
  const reduceMotion = useReducedMotion();

  const step = (VIEW_W - PAD_X * 2) / (STAGES.length - 1);
  const nodes = STAGES.map((label, i) => ({
    label,
    x: PAD_X + step * i,
    isLaunch: i === STAGES.length - 1,
  }));

  return (
    <div className={`${styles.wrapper} ${className}`} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        role="presentation"
        focusable="false"
      >
        {/* Track (always visible, faint) */}
        <line
          x1={PAD_X}
          y1={LINE_Y}
          x2={VIEW_W - PAD_X}
          y2={LINE_Y}
          className={styles.track}
        />

        {/* Drawn progress line */}
        <motion.line
          x1={PAD_X}
          y1={LINE_Y}
          x2={VIEW_W - PAD_X}
          y2={LINE_Y}
          className={styles.progress}
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.9 }}
        />

        {nodes.map((node, i) => (
          <g key={node.label}>
            <motion.circle
              cx={node.x}
              cy={LINE_Y}
              r={NODE_R}
              className={node.isLaunch ? styles.nodeLaunch : styles.node}
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 22,
                delay: reduceMotion ? 0 : 0.9 + i * 0.28,
              }}
              style={{ transformOrigin: `${node.x}px ${LINE_Y}px` }}
            />
            {/* Soft pulse ring on the Launch node only */}
            {node.isLaunch && !reduceMotion && (
              <motion.circle
                cx={node.x}
                cy={LINE_Y}
                r={NODE_R}
                className={styles.launchPulse}
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 2.2], opacity: [0.45, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatDelay: 1.6,
                  ease: "easeOut",
                  delay: 2.4,
                }}
                style={{ transformOrigin: `${node.x}px ${LINE_Y}px` }}
              />
            )}
            <motion.text
              x={node.x}
              y={LINE_Y + 28}
              textAnchor={
                i === 0 ? "start" : i === nodes.length - 1 ? "end" : "middle"
              }
              className={
                node.isLaunch ? styles.labelLaunch : styles.label
              }
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: reduceMotion ? 0 : 1.0 + i * 0.28,
              }}
            >
              {node.label.toUpperCase()}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default PipelineLine;
