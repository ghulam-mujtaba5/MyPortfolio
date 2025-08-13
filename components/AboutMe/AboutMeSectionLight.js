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
    [theme, themeStyles.container],
  );

  const sectionClass = useMemo(
    () => `${commonStyles.aboutMeSection} ${themeStyles.aboutMeSection}`,
    [theme, themeStyles.aboutMeSection],
  );

  const titleClass = useMemo(
    () => `${commonStyles.title} ${themeStyles.title}`,
    [theme, themeStyles.title],
  );

  const descriptionClass = useMemo(
    () => `${commonStyles.description} ${themeStyles.description}`,
    [theme, themeStyles.description],
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
          I am a Software Engineer with expertise in developing software
          solutions that integrate emerging technologies such as Data Science,
          Machine Learning, and AI Development. Dedicated to achieving
          excellence from ideation and design to development and seamless
          integration.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default AboutMeSection;
