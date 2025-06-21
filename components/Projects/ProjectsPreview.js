import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import styles from './ProjectsPreview.module.css';

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
  return (
    <section className={styles.section} style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '3.5rem 0 2.5rem 0' }}>
      <div className={styles.headerRow} style={{ width: '100%', marginBottom: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className={styles.title}>Projects</h2>
        <Link href="/portfolio/projects" legacyBehavior>
          <a
            className={styles.viewAll}
            tabIndex={0}
          >
            View All
          </a>
        </Link>
      </div>
      <div className={styles.grid} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2.5rem',
        width: '100%',
        margin: '0 auto',
        justifyItems: 'center',
        alignItems: 'stretch',
      }}>
        {projects.slice(0, 3).map((project, idx) => (
          <div
            key={project.title}
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'none',
              boxShadow: 'none',
              transition: 'box-shadow 0.3s',
              display: 'flex',
              alignItems: 'stretch',
              minHeight: 340,
              maxWidth: 420,
              width: '100%',
              margin: '0 auto',
            }}
          >
            <Project1 projectOverride={project} />
          </div>
        ))}
      </div>
      {/* Mobile-specific styles are now in ProjectsPreview.module.css */}
    </section>
  );
};

export default ProjectsPreview;
