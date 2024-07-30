
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Import the useTheme hook
import commonStyles from './LanguagesCommon.module.css'; // Import common styles
import lightStyles from './LanguagesLight.module.css'; // Import light mode styles
import darkStyles from './LanguagesDark.module.css'; // Import dark mode styles

const Frame = () => {
  const { theme } = useTheme(); // Destructure theme from the context
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1, // Adjust the threshold as needed
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={`${commonStyles.frameContainer} ${theme === 'dark' ? darkStyles.frameContainer : lightStyles.frameContainer}`}
      aria-labelledby="languages-title"
    >
      <h2 id="languages-title" className={commonStyles.title}>Languages</h2>
      <div className={`${commonStyles.iconContainer} ${isVisible ? commonStyles.animate : ''}`}>
        <img className={`${commonStyles.icon} ${isVisible ? commonStyles.animate : ''}`} alt="Java programming language" src="java.png" />
        <img className={`${commonStyles.icon} ${isVisible ? commonStyles.animate : ''}`} alt="Python programming language" src="python icon.svg" />
        <img className={`${commonStyles.icon} ${isVisible ? commonStyles.animate : ''}`} alt="R programming language" src="r icon.svg" />
        <img className={`${commonStyles.icon} ${isVisible ? commonStyles.animate : ''}`} alt="C programming language" src="c language icon.svg" />
        <img className={`${commonStyles.icon} ${isVisible ? commonStyles.animate : ''}`} alt="C++ programming language" src="cpluslanguage icon.png" />
        <img className={`${commonStyles.icon} ${isVisible ? commonStyles.animate : ''}`} alt="JavaScript programming language" src="javscript icon.svg" />
        <img className={`${commonStyles.icon} ${isVisible ? commonStyles.animate : ''}`} alt="HTML markup language" src="html icon.svg" />
        <img className={`${commonStyles.icon} ${isVisible ? commonStyles.animate : ''}`} alt="CSS styling language" src="css icon.svg" />
      </div>
    </section>
  );
};

export default Frame;
