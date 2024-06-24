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
    <>

      <section className={containerClass}>
        <div className={sectionClass}>
          <h2 className={titleClass}>ABOUT ME</h2>
          <p className={descriptionClass}>
          I am a Software Engineer with expertise in Developing Software solutions that integrate Emerging Technologies such as Data Science, Machine Learning and AI Development. Dedicated to achieving excellence from ideation and design to development and seamless integration. I ensure each project exemplifies precision and innovation. My commitment to excellence guarantees that every project is executed with the highest standards of quality, achieving optimal results.
          </p>
        </div>
      </section>
    </>
  );
};

export default AboutMeSection;
