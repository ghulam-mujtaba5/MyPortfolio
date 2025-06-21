import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';

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
    <section style={{ width: '100%', margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}>Featured Projects</h2>
        <Link href="/portfolio/projects" legacyBehavior>
          <a style={{ color: theme === 'dark' ? '#fff' : '#2563eb', fontWeight: 500, textDecoration: 'underline', fontSize: '1rem' }}>View All</a>
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', width: '100%' }}>
        {projects.slice(0, 3).map((project, idx) => (
          <div key={project.title} style={{ borderRadius: '18px', overflow: 'hidden', background: theme === 'dark' ? '#23272f' : '#f8fafc', boxShadow: '0 2px 16px 0 rgba(60,60,100,0.08)', transition: 'box-shadow 0.3s', display: 'flex', alignItems: 'stretch' }}>
            <Project1 projectOverride={project} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsPreview;
