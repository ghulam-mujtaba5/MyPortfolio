
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useTheme } from '../../context/ThemeContext';
import NavBar from '../../components/NavBar_Desktop/nav-bar';
import Footer from '../../components/Footer/Footer';

// Dynamically import Project1 to avoid SSR issues with next/image
const Project1 = dynamic(() => import('../../components/Projects/Project1'), { ssr: false });

const TAGS = [
  'All',
  'Java',
  'Next.js',
  'React',
  'Figma',
  'Spring',
  'Maven',
  'UI/UX',
];

const ProjectsPage = () => {
  const { theme } = useTheme();
  const [selectedTag, setSelectedTag] = useState('All');

  // Project data (should match Project1's internal data for demo)
  const projects = [
    {
      title: 'Billing Application',
      description: 'I developed a Desktop bookshop billing software using Java, JavaFX, Maven, and Spring, showcasing my skills in full-stack development and software architecture.',
      techStack: 'Java, Java Fx, Maven, Spring',
      imgSrc: 'project img 1.png',
      livePreviewLink: 'https://github.com/ghulam-mujtaba5/java-semester-billing-software',
      viewCodeLink: 'https://github.com/ghulam-mujtaba5/java-semester-billing-software',
      tags: ['Java', 'Spring', 'Maven'],
    },
    {
      title: 'My Portfolio Project',
      description: 'Developed a personal portfolio website using Next.js, React.js, Context API, Styled Components, and Node.js. Optimized for performance and responsive design.',
      techStack: 'Next Js, Context API, Figma',
      imgSrc: 'project-2.png',
      livePreviewLink: 'https://ghulammujtaba.com/',
      viewCodeLink: 'https://github.com/ghulam-mujtaba5',
      tags: ['Next.js', 'React', 'Figma', 'UI/UX'],
    },
    {
      title: 'Portfolio v1',
      description: 'Crafted a dynamic web portfolio showcasing creative UI/UX designs and diligently coded functionalities to deliver an immersive user experience.',
      techStack: 'React, JavaScript, Html, Figma',
      imgSrc: 'project img 3.png',
      livePreviewLink: 'https://www.ghulammujtaba.tech/',
      viewCodeLink: 'https://github.com/ghulam-mujtaba5/portfolioversion1.2',
      tags: ['React', 'Figma', 'UI/UX'],
    },
  ];

  const filteredProjects = selectedTag === 'All'
    ? projects
    : projects.filter(p => p.tags.includes(selectedTag));

  return (
    <>
      <Head>
        <title>Projects | Ghulam Mujtaba</title>
        <meta name="description" content="Showcase of advanced, modern, and professional projects by Ghulam Mujtaba. Explore software, web, and UI/UX work." />
      </Head>
      <div style={{ backgroundColor: theme === 'dark' ? '#1d2127' : '#ffffff', overflowX: 'hidden' }}>
        <NavBar />
        <div className={`projects-page-bg ${theme}`}>
          <section className={`project-hero`}>
            <h1 className="project-hero-title">My Projects</h1>
            <p className="project-hero-desc">
              Explore a curated selection of my best work, from full-stack applications to creative UI/UX designs. Each project demonstrates advanced skills, modern technologies, and a passion for building impactful digital experiences.
            </p>
          </section>
          <div className="project-tags">
            {TAGS.map(tag => (
              <button
                key={tag}
                className={`project-tag-btn${selectedTag === tag ? ' active' : ''}`}
                onClick={() => setSelectedTag(tag)}
                aria-pressed={selectedTag === tag}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="project-grid">
            {filteredProjects.map((project, idx) => (
              <div key={project.title} className="project-grid-card">
                <Project1 projectOverride={project} />
              </div>
            ))}
          </div>
          <Footer />
        </div>
      </div>
      <style jsx>{`
        .projects-page-bg {
          min-height: 100vh;
          background: #ffffff;
          transition: background 0.3s;
        }
        .projects-page-bg.dark {
          background: #1d2127;
        }
        .project-hero {
          padding: 3.5rem 0 1.5rem 0;
          text-align: center;
          background: transparent;
        }
        .project-hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -1px;
        }
        .project-hero-desc {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }
        .projects-page-bg.dark .project-hero-desc {
          color: #bbb;
        }
        .project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          justify-content: center;
          margin: 2rem 0 1.5rem 0;
        }
        .project-tag-btn {
          background: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 20px;
          padding: 0.5rem 1.3rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .project-tag-btn.active, .project-tag-btn:hover {
          background: #22223b;
          color: #fff;
          border-color: #22223b;
        }
        .projects-page-bg.dark .project-tag-btn {
          background: #23272f;
          color: #eee;
          border-color: #23272f;
        }
        .projects-page-bg.dark .project-tag-btn.active, .projects-page-bg.dark .project-tag-btn:hover {
          background: #fff;
          color: #22223b;
          border-color: #fff;
        }
        .project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 2.5rem;
          padding: 2rem 0;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .project-grid-card {
          display: flex;
          align-items: stretch;
        }
        @media (max-width: 600px) {
          .project-hero-title { font-size: 2rem; }
          .project-grid { grid-template-columns: 1fr; padding: 1rem 0; }
        }
      `}</style>
    </>
  );
};

export default ProjectsPage;
