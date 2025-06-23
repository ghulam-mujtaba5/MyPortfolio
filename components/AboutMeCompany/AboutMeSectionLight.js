
import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import commonStyles from './AboutMeSectionCommon.module.css';
import lightStyles from './AboutMeSectionLight.module.css';
import darkStyles from './AboutMeSectionDark.module.css';

const AboutMeSection = () => {
  const { theme } = useTheme();

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const containerClass = useMemo(
    () => `${commonStyles.container} ${themeStyles.container}`,
    [theme, themeStyles.container]
  );

  const sectionClass = useMemo(
    () => `${commonStyles.aboutMeSection} ${themeStyles.aboutMeSection}`,
    [theme, themeStyles.aboutMeSection]
  );

  const titleClass = useMemo(
    () => `${commonStyles.title} ${themeStyles.title}`,
    [theme, themeStyles.title]
  );

  const descriptionClass = useMemo(
    () => `${commonStyles.description} ${themeStyles.description}`,
    [theme, themeStyles.description]
  );

  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className={sectionClass}>
        <motion.h2
          className={titleClass}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          About us
        </motion.h2>
        <motion.p
          className={descriptionClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
        >
          Soft Built specializes in emerging technologies to drive efficiency, productivity, and growth for businesses worldwide. From ideation to implementation, we collaborate with clients to bring their vision to life with excellence.
          <br /><br />
          Our mission is to exceed expectations by delivering best-in-class software solutions, with a strong focus on integrating emerging technologies such as data science and AI.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AboutMeSection;
