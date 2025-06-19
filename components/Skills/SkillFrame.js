
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import commonStyles from './SkillFrameCommon.module.css';
import lightStyles from './SkillFrame.module.css';
import darkStyles from './SkillFrameDark.module.css';

const SkillFrame = () => {
  const { theme } = useTheme();
  const frameStyles = theme === 'dark' ? darkStyles : lightStyles;

  const [isVisible, setIsVisible] = useState(false);
  const frameRef = useRef(null);

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
        threshold: 0.1,
      }
    );

    if (frameRef.current) {
      observer.observe(frameRef.current);
    }

    return () => {
      if (frameRef.current) {
        observer.unobserve(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false); // Reset visibility after animation
      }, 1000); // Duration of the animation in milliseconds

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const skillsData = [
    {
      title: "Software Development",
      skills: [
        { name: "Java Fx", icon: "JavaFx.png", progressClass: commonStyles.progress70 },
        { name: "Spring", icon: "spring.svg", progressClass: commonStyles.progress80 },
        { name: "Figma", icon: "figma.svg", progressClass: commonStyles.progress60 },
        { name: "IntelliJ", icon: "intellij.svg", progressClass: commonStyles.progress90 }
      ]
    },
    {
      title: "Website Development",
      skills: [
        { name: "React", icon: "react.svg", progressClass: commonStyles.progress80 },
        { name: "Next.js", icon: "Nextjs.png", progressClass: commonStyles.progress70 },
        { name: "MERN Stack", icon: "Mern.png", progressClass: commonStyles.progress85 },
        { name: "Bootstrap", icon: "bootstrap.svg", progressClass: commonStyles.progress75 },
        { name: "Visual Studio", icon: "VisualStudio.svg", progressClass: commonStyles.progress65 }
      ]
    },
    {
      title: "Data Science & AI",
      skills: [
        { name: "OpenCV", icon: "opencv.svg", progressClass: commonStyles.progress80 },
        { name: "TensorFlow", icon: "tensorflow.svg", progressClass: commonStyles.progress85 },
        { name: "DeepMind", icon: "DeepMind.png", progressClass: commonStyles.progress70 },
        { name: "Power BI", icon: "microsoft-power-bi.svg", progressClass: commonStyles.progress75 }
      ]
    }
  ];

  return (
    <section
      ref={frameRef}
      className={`${commonStyles.skillFrame} ${frameStyles.skillFrame} ${isVisible ? commonStyles.animate : ''}`}
      aria-label="Skills Section"
    >
      <h2 className={`${commonStyles.skillsTitle} ${frameStyles.skillsTitle}`}>Skills</h2>
      <div className={commonStyles.skillsGrid}>
        {skillsData.map((category, catIdx) => (
          <article
            className={`${commonStyles.skillCard} ${frameStyles.skillCard} skillCardEnhanced ${isVisible ? commonStyles.animate : ''}`}
            key={catIdx}
            tabIndex={0}
            aria-label={category.title}
          >
            <header className={`${commonStyles.header} ${frameStyles.header}`}>
              <span className={`${commonStyles.title} ${frameStyles.title}`}>{category.title}</span>
            </header>
            <div className={commonStyles.skillList}>
              {category.skills.map((skill, skillIdx) => (
                <div key={skillIdx} className={`${commonStyles.skillRow} ${frameStyles.skillRow} skillRowEnhanced ${isVisible ? commonStyles.animate : ''}`} tabIndex={0} aria-label={skill.name}>
                  <div className="iconWrapper">
                    <img className={`${commonStyles.icon} ${frameStyles.icon} skillIconEnhanced`} alt={skill.name} src={skill.icon} />
                  </div>
                  <div className={`${commonStyles.skillNameContainer} ${frameStyles.skillNameContainer}`}>
                    <div className={`${commonStyles.skillName} ${frameStyles.skillName}`}>{skill.name}</div>
                    <div className={`progressBarContainer`}>
                      <div className={`${commonStyles.progress} ${skill.progressClass} progressBarEnhanced`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SkillFrame;
