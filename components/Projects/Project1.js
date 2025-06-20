
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext'; 
import styles from './projectLight.module.css';
import darkStyles from './ProjectDark.module.css';
import commonStyles from './ProjectCommon.module.css';

const ProjectCard = React.memo(({ project, frameStyles, theme }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const card = cardRef.current;
      if (card) {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check visibility on component mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on links
    if (e.target.closest('a')) return;
    
    // Open the live preview link when clicking the card
    window.open(project.livePreviewLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className={`${commonStyles.projectCard1} ${frameStyles.projectCard1} ${isVisible ? styles.animate : ''}`}
      role="article"
      aria-labelledby={`project-title-${project.title}`}
      ref={cardRef}
      onClick={handleCardClick}
      onKeyPress={(e) => e.key === 'Enter' && handleCardClick(e)}
      tabIndex="0"
    >
      <div className={`${commonStyles.projectCard1Child} ${frameStyles.projectCard1Child}`} />
      <a
        className={`${commonStyles.livePreview} ${frameStyles.livePreview}`}
        href={project.livePreviewLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Live Preview of ${project.title}`}
      >
        Live Preview
      </a>
      <a
        className={`${commonStyles.viewCode} ${frameStyles.viewCode}`}
        href={project.viewCodeLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View Code of ${project.title}`}
      >
        View Code
      </a>
      <Image
        className={`${commonStyles.projectImg1} ${frameStyles.projectImg1}`}
        alt={`${project.title} screenshot`}
        src={`/${project.imgSrc}`}
        width={400}
        height={250}
        loading="lazy"
      />
      <h3
        className={`${commonStyles.projectTileGoes} ${frameStyles.projectTileGoes}`}
        id={`project-title-${project.title}`}
      >
        {project.title}
      </h3>
      <div className={`${commonStyles.thisIsSample} ${frameStyles.thisIsSample}`}>
        {project.description}
      </div>
      <div className={`${commonStyles.techStackContainer} ${frameStyles.techStackContainer}`}>
        <span className={`${commonStyles.techStackContainer1} ${frameStyles.techStackContainer1}`}>
          <span>Tech stack :</span>
          <span className={`${commonStyles.javaJavaFxMavenSpring} ${frameStyles.javaJavaFxMavenSpring}`}>
            <span className={commonStyles.span}>{` `}</span>
            <span>{project.techStack}</span>
          </span>
        </span>
      </div>
      <Image
        className={`${commonStyles.githubIcon} ${frameStyles.githubIcon}`}
        alt="GitHub icon"
        src={theme === 'dark' ? '/GithubDark.svg' : '/github_icon.svg'}
        width={24}
        height={24}
        loading="lazy"
      />
      <Image
        className={`${commonStyles.previewIcon1} ${frameStyles.previewIcon1}`}
        alt="Preview icon"
        src={theme === 'dark' ? '/PreviewDark.svg' : '/preview_icon1.svg'}
        width={24}
        height={24}
        loading="lazy"
      />
    </article>
  );
});


// Accepts either props.projectOverride or falls back to props.project (for compatibility)
const Project1 = ({ projectOverride, project }) => {
  const { theme } = useTheme();
  const frameStyles = theme === 'dark' ? darkStyles : styles;
  const cardProject = projectOverride || project;
  if (!cardProject) return null;
  return (
    <ProjectCard project={cardProject} frameStyles={frameStyles} theme={theme} />
  );
};

export default Project1;
