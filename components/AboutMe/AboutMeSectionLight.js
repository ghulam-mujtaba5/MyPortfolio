import React, { useMemo, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion, useAnimation, useInView } from "framer-motion";
import commonStyles from "./AboutMeSectionCommon.module.css";
import lightStyles from "./AboutMeSectionLight.module.css";
import darkStyles from "./AboutMeSectionDark.module.css";

const AboutMeSection = () => {
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

  const titleClass = useMemo(
    () => `${commonStyles.title} ${themeStyles.title}`,
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
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
      });
    } else {
      controls.start({ opacity: 0, y: 50 });
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
        <motion.h2
          className={titleClass}
          initial={{ opacity: 0, y: -30 }}
          animate={controls}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          About me
        </motion.h2>
        <motion.p
          className={descriptionClass}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          I translate complex ML and data ideas into production-grade products. I
          partner with product teams to deliver measurable outcomes — faster
          insights, smarter automation, and better user experiences.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default AboutMeSection;
