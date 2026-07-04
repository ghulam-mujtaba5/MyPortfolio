import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { rise, stagger, VIEWPORT } from "../../lib/motion";
import SectionHeader from "../AnimatedUI/SectionHeader";
import styles from "./FounderJourney.module.css";

// Real milestones only — the same Idea → Launch arc as the hero pipeline
const MILESTONES = [
  {
    year: "2022",
    title: "Software engineering student",
    text: "Started BSc Software Engineering at COMSATS Lahore — and started building instead of waiting to graduate.",
  },
  {
    year: "2023",
    title: "AI/ML in production",
    text: "Worked on AI/ML data projects for Meta platforms via Appen — models judged by real-world quality, not grades.",
  },
  {
    year: "2024",
    title: "Built CampusAxis",
    text: "Turned my own student pain into a platform — past papers, GPA tools, faculty insights for 260+ universities.",
  },
  {
    year: "2025",
    title: "Founded Megicode",
    text: "Started shipping for clients — including a full clinic website and management system for a paying customer.",
  },
  {
    year: "2026",
    title: "Building MegiLance",
    text: "An AI + blockchain freelancing platform: AI pricing, proposal ranking, and escrow — end to end.",
    launch: true,
  },
];

/**
 * Founder story as a timeline riding the pipeline motif.
 * Horizontal rail on desktop, vertical on mobile.
 */
const FounderJourney = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.wrapper}>
      <SectionHeader
        eyebrow="Founder journey"
        title="From student pain to shipped products"
        lede="The same arc every product follows — idea, design, build, launch — is the arc of the last four years."
        id="journey-title"
      />
      <motion.ol
        className={styles.rail}
        variants={reduceMotion ? undefined : stagger(0.12)}
        initial={reduceMotion ? undefined : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={VIEWPORT}
      >
        {MILESTONES.map((m) => (
          <motion.li
            key={m.year}
            className={styles.stop}
            variants={reduceMotion ? undefined : rise}
          >
            <span
              className={`${styles.node} ${m.launch ? styles.nodeLaunch : ""}`}
              aria-hidden="true"
            />
            <span className={styles.year}>{m.year}</span>
            <h3 className={styles.stopTitle}>{m.title}</h3>
            <p className={styles.stopText}>{m.text}</p>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
};

export default FounderJourney;
