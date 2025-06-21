import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';

import commonStyles from './ProjectsPreviewCommon.module.css';
import lightStyles from './ProjectsPreviewLight.module.css';
import darkStyles from './ProjectsPreviewDark.module.css';

// Dynamically import Project1 to avoid SSR issues
const Project1 = dynamic(() => import('./Project1'), { ssr: false });

// All projects (add more as needed)
const projects = [
  {
    title: 'Billing Application',
    description: 'I developed a Desktop bookshop billing software using Java, JavaFX, Maven, and Spring, showcasing my skills in full-stack development and software architecture.',
    techStack: 'Java, Java Fx, Maven, Spring',
    imgSrc: 'project img 1.png',
    livePreviewLink: 'https://github.com/ghulam-mujtaba5/java-semester-billing-software',
    viewCodeLink: 'https://github.com/ghulam-mujtaba5/java-semester-billing-software',
    tags: ['Software Development'],
  },
  {
    title: 'My Portfolio Project',
    description: 'Developed a personal portfolio website using Next.js, React.js, Context API, Styled Components, and Node.js. Optimized for performance and responsive design.',
    techStack: 'Next Js, Context API, Figma',
    imgSrc: 'project-2.png',
    livePreviewLink: 'https://ghulammujtaba.com/',
    viewCodeLink: 'https://github.com/ghulam-mujtaba5',
    tags: ['Web Development', 'UI/UX'],
  },
  {
    title: 'Portfolio v1',
    description: 'Crafted a dynamic web portfolio showcasing creative UI/UX designs and diligently coded functionalities to deliver an immersive user experience.',
    techStack: 'React, JavaScript, Html, Figma',
    imgSrc: 'project img 3.png',
    livePreviewLink: 'https://www.ghulammujtaba.tech/',
    viewCodeLink: 'https://github.com/ghulam-mujtaba5/portfolioversion1.2',
    tags: ['Web Development', 'UI/UX'],
  },
  {
    title: 'AI Chatbot Assistant',
    description: 'Built an AI-powered chatbot assistant using Python, TensorFlow, and NLP techniques to automate customer support and enhance user engagement.',
    techStack: 'Python, TensorFlow, NLP',
    imgSrc: 'DeepMind.png',
    livePreviewLink: 'https://github.com/ghulam-mujtaba5/ai-chatbot-assistant',
    viewCodeLink: 'https://github.com/ghulam-mujtaba5/ai-chatbot-assistant',
    tags: ['AI', 'Data Science'],
  },
];

const ProjectsPreview = () => {
  const { theme } = useTheme();

  // Pick theme-specific styles

  // Pick theme-specific styles and theme class
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const themeClass = theme === 'dark' ? darkStyles.darkTheme : lightStyles.lightTheme;

  return (
    <section className={`${commonStyles.section} ${themeClass}`}>
      <div className={commonStyles.headerRow}>
        <h2 className={`${commonStyles.title} ${themeStyles.title}`}>Projects</h2>
      </div>
      <div className={commonStyles.grid}>
        {projects.slice(0, 3).map((project) => (
          <div
            key={project.title}
            className={commonStyles.projectCard}
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'none',
              boxShadow: 'none',
              transition: 'box-shadow 0.3s',
              minHeight: 340,
              maxWidth: 420,
              width: '100%',
            }}
          >
            <Project1 projectOverride={project} />
          </div>
        ))}
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
        <button
          className={`${commonStyles.viewAll} ${themeStyles.viewAll}`}
          tabIndex={0}
          type="button"
          onClick={() => window.open('/portfolio/projects', '_blank', 'noopener,noreferrer')}
        >
          View All
        </button>
      </div>
    </section>
  );
};

export default ProjectsPreview;
