import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import commonStyles from './AboutMeSectionCommon.module.css';
import lightStyles from './AboutMeSectionLight.module.css';
import darkStyles from './AboutMeSectionDark.module.css';

const AboutMeSection = () => {
  const { theme } = useTheme();

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const containerClass = useMemo(
    () => `${commonStyles.container} ${themeStyles.container}`,
    [themeStyles.container]
  );

  const sectionClass = useMemo(
    () => `${commonStyles.aboutMeSection} ${themeStyles.aboutMeSection}`,
    [themeStyles.aboutMeSection]
  );

  const titleClass = useMemo(
    () => `${commonStyles.title} ${themeStyles.title}`,
    [themeStyles.title]
  );

  const descriptionClass = useMemo(
    () => `${commonStyles.description} ${themeStyles.description}`,
    [themeStyles.description]
  );

  return (
    <div className={containerClass}>
      <div className={sectionClass}>
        <h2 className={titleClass}>ABOUT US</h2>
        <p className={descriptionClass}>
        Soft Built specializes in emerging technologies to drive efficiency, productivity and growth for businesses worldwide. From ideation to implementation. We collaborate closely with our clients to ensure every project manifests their unique vision and reflects our commitment to excellence.
        <br/><br/>
        At Soft Built, our mission is to exceed client expectations by delivering best-in-class software solutions. With a strong focus on integrating emerging technologies such as data science and AI. We empower businesses to harness innovation and achieve new heights.</p>
      </div>
    </div>
  );
};

export default AboutMeSection;
