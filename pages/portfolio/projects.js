
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useTheme } from '../../context/ThemeContext';
import NavBar from '../../components/NavBar_Desktop/nav-bar';
import Footer from '../../components/Footer/Footer';

// Dynamically import Project1 to avoid SSR issues with next/image
const Project1 = dynamic(() => import('../../components/Projects/Project1'), { ssr: false });

const TAGS = [
  'All',
  'Software Development',
  'Web Development',
  'AI',
  'Data Science',
  'UI/UX',
  'Others',
];

const ProjectsPage = () => {
  // Parallax effect for hero globe
  useEffect(() => {
    const globe = document.getElementById('hero-globe-parallax');
    if (!globe) return;
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      globe.style.transform = `translate(-50%, -50%) rotateX(${y}deg) rotateY(${-x}deg)`;
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
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
          <section className={`project-hero fade-in`}>
            <div className="hero-bg-visual" aria-hidden="true" id="hero-globe-parallax">
              {/* Animated SVG Globe with Dots */}
              <svg className="hero-globe" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="globeGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#5e60ce" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#48bfe3" stopOpacity="0.05" />
                  </radialGradient>
                  <linearGradient id="dotGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5e60ce" />
                    <stop offset="100%" stopColor="#48bfe3" />
                  </linearGradient>
                </defs>
                <circle cx="250" cy="250" r="200" fill="url(#globeGradient)" />
                <g className="globe-lines">
                  <ellipse cx="250" cy="250" rx="180" ry="60" stroke="#5e60ce" strokeWidth="1.5" opacity="0.18" />
                  <ellipse cx="250" cy="250" rx="120" ry="180" stroke="#48bfe3" strokeWidth="1.2" opacity="0.13" />
                  <ellipse cx="250" cy="250" rx="160" ry="100" stroke="#3a3a7c" strokeWidth="1.2" opacity="0.10" />
                </g>
                {/* Animated Dots for Locations */}
                <g className="globe-dots">
                  <circle className="globe-dot" cx="370" cy="180" r="7" fill="url(#dotGradient)" />
                  <circle className="globe-dot" cx="140" cy="320" r="6" fill="url(#dotGradient)" />
                  <circle className="globe-dot" cx="320" cy="340" r="5" fill="url(#dotGradient)" />
                  <circle className="globe-dot" cx="220" cy="120" r="5.5" fill="url(#dotGradient)" />
                  <circle className="globe-dot" cx="270" cy="400" r="4.5" fill="url(#dotGradient)" />
                  <circle className="globe-dot" cx="90" cy="200" r="4" fill="url(#dotGradient)" />
                </g>
              </svg>
            </div>
            <h1 className="project-hero-title gradient-text shimmer-on-hover">Building Impactful Digital Solutions — Globally.</h1>
            <div className="project-hero-subtitle">From AI to UI, I craft experiences that drive results and delight users.</div>
            <p className="project-hero-desc">
              Explore a curated portfolio of innovative software, intelligent AI, and beautiful web experiences. Trusted by clients worldwide, my work blends technology and creativity for real-world impact.<br /><br />
              <span className="project-hero-highlight">Explore. Get inspired. See what’s possible.</span>
            </p>
            <button className="hero-cta" aria-label="View my work">View My Work</button>
          </section>
          <div className="project-tags fade-in-up">
            {TAGS.map((tag, i) => (
              <button
                key={tag}
                className={`project-tag-btn${selectedTag === tag ? ' active' : ''}`}
                onClick={() => setSelectedTag(tag)}
                aria-pressed={selectedTag === tag}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="project-grid">
            {filteredProjects.map((project, idx) => (
              <div
                key={project.title}
                className="project-grid-card card-animate"
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <Project1 projectOverride={project} />
              </div>
            ))}
          </div>
          <Footer />
        </div>
      </div>
      <style jsx>{`
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
        }
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1.000) forwards;
        }
        .fade-in-up .project-tag-btn {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.5s cubic-bezier(.39,.575,.565,1.000) forwards;
        }
        .fade-in-up .project-tag-btn {
          animation-delay: inherit;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: none;
          }
        }
        .card-animate {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          animation: cardFadeIn 0.7s cubic-bezier(.39,.575,.565,1.000) forwards;
        }
        .card-animate:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 8px 32px 0 rgba(60,60,100,0.18);
          transition: box-shadow 0.3s, transform 0.3s;
        }
        @keyframes cardFadeIn {
          to {
            opacity: 1;
            transform: none;
          }
        }
        .projects-page-bg {
          min-height: 100vh;
          background: #ffffff;
          transition: background 0.3s;
        }
        .projects-page-bg.dark {
          background: #1d2127;
        }
        .project-hero {
          position: relative;
          padding: 5.5rem 0 2.7rem 0;
          text-align: center;
          background: linear-gradient(120deg,rgba(34,34,59,0.04) 0%,rgba(0,0,0,0) 100%);
          border-radius: 0 0 32px 32px;
          box-shadow: 0 4px 32px 0 rgba(60,60,100,0.10);
          overflow: hidden;
        }
        .hero-bg-visual {
        /* Animated globe dots */
        .globe-dot {
          opacity: 0.85;
          filter: drop-shadow(0 0 8px #5e60ce88);
          transform-origin: 50% 50%;
          animation: dotPulse 2.2s infinite alternate;
        }
        .globe-dot:nth-child(1) { animation-delay: 0s; }
        .globe-dot:nth-child(2) { animation-delay: 0.5s; }
        .globe-dot:nth-child(3) { animation-delay: 1s; }
        .globe-dot:nth-child(4) { animation-delay: 1.5s; }
        .globe-dot:nth-child(5) { animation-delay: 0.8s; }
        .globe-dot:nth-child(6) { animation-delay: 1.2s; }
        @keyframes dotPulse {
          0% { r: 4.5; opacity: 0.7; }
          50% { r: 7.5; opacity: 1; }
          100% { r: 4.5; opacity: 0.7; }
        }
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          z-index: 0;
          pointer-events: none;
          opacity: 0.7;
          filter: blur(0.5px);
          animation: globeFloat 8s ease-in-out infinite alternate;
        }
        .hero-globe {
          width: 100%;
          height: 100%;
          display: block;
        }
        .globe-lines ellipse {
          transform-origin: 50% 50%;
          animation: globeSpin 16s linear infinite;
        }
        @keyframes globeSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes globeFloat {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -52%) scale(1.04); }
        }
        .project-hero-title {
          font-size: 3.3rem;
          font-weight: 900;
          margin-bottom: 0.7rem;
          letter-spacing: -2px;
          line-height: 1.1;
          z-index: 2;
          position: relative;
          text-shadow: 0 4px 32px rgba(60,60,100,0.13);
        }
        .gradient-text {
          background: linear-gradient(90deg,#3a3a7c 10%,#5e60ce 50%,#48bfe3 90%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          transition: background-position 0.7s cubic-bezier(.39,.575,.565,1.000);
          background-size: 200% 100%;
          background-position: 0% 50%;
        }
        .shimmer-on-hover:hover {
          background-position: 100% 50%;
          filter: brightness(1.08) drop-shadow(0 2px 16px #5e60ce33);
        }
        .project-hero-subtitle {
          font-size: 1.28rem;
          color: #5e60ce;
          font-weight: 600;
          margin-bottom: 1.1rem;
          letter-spacing: 0.5px;
          z-index: 2;
          position: relative;
        }
        .project-hero-desc {
          font-size: 1.18rem;
          color: #444;
          max-width: 700px;
          margin: 0 auto 1.5rem auto;
          line-height: 1.7;
          font-weight: 400;
          z-index: 2;
          position: relative;
        }
        .project-hero-highlight {
          display: inline-block;
          margin-top: 0.7rem;
          font-size: 1.08rem;
          color: #22223b;
          background: #e0e7ff;
          border-radius: 8px;
          padding: 0.18em 0.7em;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        .hero-cta {
          margin-top: 1.2rem;
          padding: 0.85em 2.2em;
          font-size: 1.13rem;
          font-weight: 700;
          border-radius: 30px;
          border: none;
          background: linear-gradient(90deg,#5e60ce 10%,#48bfe3 90%);
          color: #fff;
          box-shadow: 0 4px 24px 0 rgba(60,60,100,0.13);
          cursor: pointer;
          transition: background 0.3s, box-shadow 0.3s, transform 0.2s;
          z-index: 2;
          position: relative;
        }
        .hero-cta:hover, .hero-cta:focus {
          background: linear-gradient(90deg,#48bfe3 10%,#5e60ce 90%);
          box-shadow: 0 8px 32px 0 rgba(60,96,206,0.18);
          transform: translateY(-2px) scale(1.04);
          outline: 2px solid #5e60ce;
        }
        .projects-page-bg.dark .project-hero-title.gradient-text {
          background: linear-gradient(90deg,#b8c0ff 10%,#5e60ce 50%,#48bfe3 90%);
        }
        .projects-page-bg.dark .project-hero-subtitle {
          color: #b8c0ff;
        }
        .projects-page-bg.dark .project-hero-desc {
          color: #bbb;
        }
        .projects-page-bg.dark .project-hero-highlight {
          color: #181c20;
          background: #b8c0ff;
        }
        .projects-page-bg.dark .hero-cta {
          background: linear-gradient(90deg,#b8c0ff 10%,#48bfe3 90%);
          color: #181c20;
        }
        .projects-page-bg.dark .hero-cta:hover, .projects-page-bg.dark .hero-cta:focus {
          background: linear-gradient(90deg,#48bfe3 10%,#b8c0ff 90%);
          color: #181c20;
        }
        @media (max-width: 600px) {
          .project-hero-title { font-size: 2.1rem; }
          .project-hero-subtitle { font-size: 1.05rem; }
          .project-hero { padding: 2.2rem 0 1.2rem 0; border-radius: 0 0 18px 18px; }
          .hero-bg-visual { width: 320px; height: 320px; }
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
          transition: all 0.2s, box-shadow 0.3s;
          box-shadow: 0 2px 8px 0 rgba(60,60,100,0.06);
        }
        .project-tag-btn.active, .project-tag-btn:hover {
          background: #22223b;
          color: #fff;
          border-color: #22223b;
          box-shadow: 0 4px 16px 0 rgba(34,34,59,0.18);
          transform: translateY(-2px) scale(1.05);
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
