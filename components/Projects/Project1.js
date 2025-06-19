
import React, { useEffect, useRef, useState } from 'react';
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
      <img
        className={`${commonStyles.projectImg1} ${frameStyles.projectImg1}`}
        alt={`${project.title} screenshot`}
        src={project.imgSrc}
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
      <img
        className={`${commonStyles.githubIcon} ${frameStyles.githubIcon}`}
        alt="GitHub icon"
        src={theme === 'dark' ? 'GithubDark.svg' : 'github_icon.svg'}
        loading="lazy"
      />
      <img
        className={`${commonStyles.previewIcon1} ${frameStyles.previewIcon1}`}
        alt="Preview icon"
        src={theme === 'dark' ? 'PreviewDark.svg' : 'preview_icon1.svg'}
        loading="lazy"
      />
    </article>
  );
});

const Frame = () => {
  const { theme } = useTheme();
  const frameStyles = theme === 'dark' ? darkStyles : styles;

  const projects = [
    {
      title: "Billing Application",
      description: "I developed a Desktop bookshop billing software using Java, JavaFX, Maven, and Spring, showcasing my skills in full-stack development and software architecture.",
      techStack: "Java, Java Fx, Maven, Spring",
      imgSrc: "project img 1.png",
      livePreviewLink: "https://github.com/ghulam-mujtaba5/java-semester-billing-software",
      viewCodeLink: "https://github.com/ghulam-mujtaba5/java-semester-billing-software"
    },
    {
      title: "My Portfolio Project",
      description: "Developed a personal portfolio website using Next.js, React.js, Context API, Styled Components, and Node.js. Optimized for performance and responsive design.",
      techStack: "Next Js, Context API, Figma",
      imgSrc: "project-2.png",
      livePreviewLink: "https://ghulammujtaba.com/",
      viewCodeLink: "https://github.com/ghulam-mujtaba5"
    },
    {
      title: "My Portfolio Project",
      description: "Crafted a dynamic web portfolio showcasing creative UI/UX designs and diligently coded functionalities to deliver an immersive user experience.",
      techStack: "React, JavaScript, Html, Figma",
      imgSrc: "project img 3.png",
      livePreviewLink: "https://www.ghulammujtaba.tech/",
      viewCodeLink: "https://github.com/ghulam-mujtaba5/portfolioversion1.2"
    }
  ];

  return (
    <div style={{ margin: '0 6%' }}>
      <h2 className={frameStyles.frameTitle}>Projects</h2>
      <div className={frameStyles.projectCard1Parent} role="list">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} frameStyles={frameStyles} theme={theme} />
        ))}
      </div>
    </div>
  );
};

export default Frame;
