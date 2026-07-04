import React, { useMemo, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion, useAnimation, useInView } from "framer-motion";
import commonStyles from "./AboutMeSectionCommon.module.css";
import lightStyles from "./AboutMeSectionLight.module.css";
import darkStyles from "./AboutMeSectionDark.module.css";
import SectionHeader from "../AnimatedUI/SectionHeader";

const AboutMeSection = ({ showTitle = true }) => {
  const { theme } = useTheme();

  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  const containerClass = useMemo(
    () => `${commonStyles.container} ${themeStyles.container}`,
    [themeStyles],
  );

  const sectionClass = useMemo(
    () => `${commonStyles.aboutMeSection} ${themeStyles.aboutMeSection}`,
    [themeStyles],
  );

  const descriptionClass = useMemo(
    () => `${commonStyles.description} ${themeStyles.description}`,
    [themeStyles],
  );

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.1 });

  useEffect(() => {
    // Fire once — re-triggering reveals read as glitchy on scroll-up
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
      });
    }
  }, [isInView, controls]);

  return (
    <motion.section
      className={containerClass}
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      ref={ref}
    >
      <div className={sectionClass}>
        {showTitle && (
          <SectionHeader
            eyebrow="Founder story"
            title="About me"
            id="about-title"
            align="center"
          />
        )}
        <motion.p
          className={descriptionClass}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          I founded <strong>Megicode</strong>, a software company that ships
          products for startups and businesses, and built{" "}
          <strong>CampusAxis</strong>, a study platform now used across 260+
          Pakistani universities. I've worked on various AI/ML projects for
          different companies over the years, while finishing my BSc in
          Software Engineering at COMSATS Lahore. I'm open to senior
          engineering roles where I can contribute as a technical leader and
          provide architect-level solutions. If you need someone who can take
          an idea from notebook to production — model, backend, UI, and ship
          — I'm probably the person you want on the call.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default AboutMeSection;
