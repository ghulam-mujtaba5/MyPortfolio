import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";
import { motion, useAnimation } from "framer-motion";
import commonStyles from "./welcomeCommon.module.css"; // Common CSS
import lightStyles from "./welcomeLight.module.css"; // Light mode CSS
import darkStyles from "./welcomeDark.module.css"; // Dark mode CSS
import WorkWithMeModal from "./WorkWithMeModal";
import PipelineLine from "../AnimatedUI/PipelineLine";
import Magnetic from "../AnimatedUI/Magnetic";

const Introduction = () => {
  const { theme } = useTheme(); // Destructure theme from context

  const [inView, setInView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef(null);
  const controls = useAnimation();

  const helloTextToDisplay = "Hello, I’m ";
  const nameTextToDisplay = "GHULAM MUJTABA";
  const descriptionTextToDisplay =
    "Founder of Megicode & CampusAxis. I design and ship full-stack AI products, SaaS platforms, and business systems — from idea to launch.";

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setInView(rect.top < window.innerHeight && rect.bottom >= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on initial load

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut", delay: 0.3 },
      });
    }
  }, [inView, controls]);

  return (
    <section
      className={`${commonStyles.container} ${theme === "dark" ? darkStyles.container : lightStyles.container}`}
      aria-label="Introduction"
    >
      <div
        ref={ref}
        className={`${commonStyles.textContainer} ${theme === "dark" ? darkStyles.textContainer : lightStyles.textContainer}`}
      >
        <motion.p
          className={commonStyles.eyebrow}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Founder · Megicode &amp; CampusAxis
        </motion.p>

        <motion.h1
          className={`${commonStyles.text} ${theme === "dark" ? darkStyles.text : lightStyles.text}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          {helloTextToDisplay}
          <br />
          <motion.span
            className={`${commonStyles.ghulamMujtaba} ${theme === "dark" ? darkStyles.ghulamMujtaba : lightStyles.ghulamMujtaba}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.3,
            }}
          >
            {nameTextToDisplay}
          </motion.span>
          <span className={commonStyles.srOnly}>
            {" "}
            — Founder of Megicode and CampusAxis, Full Stack Developer and AI
            Specialist building products from idea to launch
          </span>
        </motion.h1>
        <motion.p
          className={`${commonStyles.paragraph} ${theme === "dark" ? darkStyles.paragraph : lightStyles.paragraph}`}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.5,
          }}
        >
          {descriptionTextToDisplay}
        </motion.p>

        <motion.div
          className={commonStyles.heroCTARow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.7 }}
        >
          <Magnetic>
            <button
              type="button"
              className={`${commonStyles.heroCTA} ${commonStyles.heroCTAPrimary}`}
              onClick={() => setIsModalOpen(true)}
            >
              Start a Project
              <svg
                className={commonStyles.heroCTAArrow}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </Magnetic>
          <Link
            href="/projects"
            className={`${commonStyles.heroCTA} ${commonStyles.heroCTASecondary}`}
          >
            View Proof of Work
          </Link>
          <Link href="/resume" className={commonStyles.heroCTATertiary}>
            Resume
            <span aria-hidden="true" className={commonStyles.tertiaryArrow}>
              →
            </span>
          </Link>
        </motion.div>

        <PipelineLine />
      </div>

      <WorkWithMeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default Introduction;
