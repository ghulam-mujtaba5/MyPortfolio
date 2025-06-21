import Icon from '../components/Icon/gmicon';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useTheme } from '../context/ThemeContext';
import NavBar from '../components/NavBar_Desktop/nav-bar';
import NavBarMobile from '../components/NavBar_Mobile/NavBar-mobile';

import Footer from '../components/Footer/Footer';

// Dynamically import Project1 to avoid SSR issues with next/image
const Project1 = dynamic(() => import('../components/Projects/Project1'), { ssr: false });

const TAGS = [
  'All',
  'Software Development',
  'Web Development',
  'AI',
  'Data Science',
  'UI/UX',
  'Others',
];

// Sections for NavBarMobile navigation
const sections = [
  { route: '/#home-section', label: 'Home' },
  { route: '/#about-section', label: 'About' },
  { route: '/#languages-section', label: 'Skills' },
  { route: '/resume', label: 'Resume' },
  { route: '/projects', label: 'Projects' },
  { route: '/#contact-section', label: 'Contact' }
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

  const filteredProjects = selectedTag === 'All'
    ? projects
    : projects.filter(p => p.tags.includes(selectedTag));

  return (
    <>
      <Head>
        <title>Projects | Ghulam Mujtaba</title>
        <meta name="description" content="Showcase of advanced, modern, and professional projects by Ghulam Mujtaba. Explore software, web, mobile, AI, data science, and UI/UX work." />
      </Head>
      <div style={{ backgroundColor: theme === 'dark' ? '#1d2127' : '#ffffff', overflowX: 'hidden', minHeight: '100vh' }}>
        {/* Desktop NavBar */}
        <div className="hide-on-mobile">
          <NavBar />
        </div>
        {/* Mobile NavBar with top-left icon and hamburger alignment (logo only here, not in NavBarMobile) */}
        <div className="show-on-mobile mobile-navbar-container">
          <div className="mobile-navbar-row">
            <div className="mobile-logo-align">
              <Icon name="sbicon" size={32} />
            </div>
            <div className="mobile-hamburger-align">
              {/* Ensure menu is always visible in NavBarMobile */}
              <NavBarMobile sections={sections} />
            </div>
          </div>
        </div>
        <div className={`projects-page-bg ${theme}`}>
          <section className={`project-hero fade-in`}>
            <div className="hero-bg-visual-soft" aria-hidden="true">
              {/* Abstract lines SVG background */}
              <svg width="100%" height="100%" viewBox="0 0 900 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}>
                <polyline points="60,60 200,40 350,100 500,60 700,120 850,60" stroke="#3b82f6" strokeWidth="2.5" opacity="0.13" fill="none" />
                <polyline points="100,120 300,80 450,180 600,100 800,180" stroke="#60a5fa" strokeWidth="2" opacity="0.10" fill="none" />
                <polyline points="80,180 250,160 400,200 650,160 820,200" stroke="#a5b4fc" strokeWidth="1.5" opacity="0.09" fill="none" />
                <circle cx="60" cy="60" r="4" fill="#3b82f6" opacity="0.18" />
                <circle cx="850" cy="60" r="3" fill="#3b82f6" opacity="0.13" />
                <circle cx="800" cy="180" r="3" fill="#60a5fa" opacity="0.13" />
                <circle cx="100" cy="120" r="3" fill="#60a5fa" opacity="0.13" />
              </svg>
            </div>
            <div className="project-hero-intro refined-intro refined-intro-centered">
              <h1 className="refined-intro-main animated-gradient-headline">
                <span>Featured Projects & Digital Solutions</span>
              </h1>
              <div className="project-icons-row">
                {/* Icons removed as per request */}
              </div>
              <h2 className="refined-intro-sub animated-fadein">
                Innovating Across Web, Mobile, Desktop, AI, and Data Science
              </h2>
              <p className="refined-intro-desc animated-fadein-delayed">
                Explore impactful projects where technology, design, and problem solving converge—each a testament to innovation and quality.
              </p>
            </div>
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
        .mobile-navbar-container {
          width: 100vw;
          z-index: 100;
        }
          /* position: fixed; */
          /* top: 0; */
          /* left: 0; */
  
        .projects-page-bg.dark .mobile-navbar-row {
          background: #23272f !important;
          box-shadow: 0 2px 8px 0 rgba(34,34,59,0.13);
        }
        .projects-page-bg.dark .mobile-navbar-row {
          background: #23272f;
          box-shadow: 0 2px 8px 0 rgba(34,34,59,0.13);
        }
        .mobile-logo-align {
          display: flex;
          align-items: center;
        }
        .mobile-hamburger-align {
          display: flex;
          align-items: center;
        }
        @media (max-width: 600px) {
          .mobile-navbar-row {
            padding: 0.7rem 0.7rem 0.7rem 0.7rem;
          }
        }
        @media (max-width: 800px) {
          .mobile-navbar-container {
            width: 100vw;
            z-index: 100;
            background: transparent;
          }
            /* position: fixed; */
            /* top: 0; */
            /* left: 0; */
        }
        .hide-on-mobile { display: block; }
        .show-on-mobile { display: none; }
        @media (max-width: 800px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: block !important; }
        }
        .project-icons-row {
          display: flex;
          gap: 0.5rem;
          margin: 0.7rem 0 0.2rem 0;
          justify-content: center;
          align-items: center;
        }
        .animated-gradient-headline span {
          display: inline-block;
          background: linear-gradient(270deg, #2563eb, #60a5fa, #a5b4fc, #2563eb);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          animation: gradientMove 3.5s ease-in-out infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-fadein {
          opacity: 0;
          transform: translateY(18px);
          animation: fadeInUp 1.1s cubic-bezier(.39,.575,.565,1.000) 0.3s forwards;
        }
        .animated-fadein-delayed {
          opacity: 0;
          transform: translateY(18px);
          animation: fadeInUp 1.1s cubic-bezier(.39,.575,.565,1.000) 0.7s forwards;
        }
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
          padding: 3.2rem 0 1.5rem 0;
          text-align: center;
          background: none;
          border-radius: 0 0 24px 24px;
          overflow: hidden;
        }
        @media (max-width: 600px) {
          .project-hero {
            margin-top: 4.2rem;
            padding: 3.5rem 0 1.1rem 0;
            border-radius: 0 0 12px 12px;
          }
        }
        .hero-bg-visual-soft {
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          width: 100vw;
          max-width: 700px;
          height: 220px;
          z-index: 0;
          pointer-events: none;
          opacity: 0.5;
          filter: blur(0.5px);
        }
        .project-hero-intro.refined-intro {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
          position: relative;
          margin-top: 1.2rem;
        }
        .refined-intro-main {
          font-size: 2.8rem;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 0.5rem;
          line-height: 1.1;
          text-shadow: 0 4px 24px rgba(60,100,200,0.10);
        }
        .refined-intro-sub {
          font-size: 1.35rem;
          color: #3b82f6;
          font-weight: 600;
          margin-bottom: 0.7rem;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 12px rgba(60,100,200,0.08);
        }
        .refined-intro-desc {
          font-size: 1.13rem;
          color: #4b5563;
          font-weight: 400;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.6;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 6px rgba(60,100,200,0.06);
        }
        .refined-intro-centered {
          align-items: center;
          text-align: center;
        }
        .projects-page-bg.dark .hero-bg-visual-soft {
          opacity: 0.3;
        }
        .projects-page-bg.dark .refined-intro-main {
          color: #60a5fa;
        }
        .projects-page-bg.dark .gradient-headline {
          background: linear-gradient(90deg, #60a5fa 30%, #a5b4fc 70%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .projects-page-bg.dark .refined-intro-sub {
          color: #b8c0ff;
        }
        .projects-page-bg.dark .refined-intro-desc {
          color: #bbb;
        }
        @media (max-width: 600px) {
          .refined-intro-main { font-size: 1.2rem; }
          .refined-intro-sub { font-size: 0.98rem; }
          .project-hero { padding: 1.3rem 0 0.7rem 0; border-radius: 0 0 12px 12px; }
          .hero-bg-visual-soft { height: 120px; }
        }
        .project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          justify-content: center;
          margin: 2rem 0 1.5rem 0;
        }
        @media (max-width: 600px) {
          .project-tags {
            gap: 0.4rem;
            margin: 1.2rem 0 1.1rem 0;
          }
        }
        .project-tag-btn {
          background: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 20px;
          padding: 0.5rem 1.1rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s, box-shadow 0.3s;
          box-shadow: 0 2px 8px 0 rgba(60,60,100,0.06);
        }
        @media (max-width: 600px) {
          .project-tag-btn {
            font-size: 0.93rem;
            padding: 0.38rem 0.7rem;
            margin-bottom: 0.2rem;
          }
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
        @media (max-width: 900px) {
          .project-grid {
            grid-template-columns: 1fr;
            gap: 1.2rem;
            padding: 1.2rem 0.5rem;
          }
        }
        @media (max-width: 600px) {
          .project-grid {
            grid-template-columns: 1fr;
            gap: 1.2rem;
            padding: 1.8rem 0.1rem 1.2rem 0.1rem;
            justify-items: center;
          }
        }
        .project-grid-card {
          display: flex;
          align-items: stretch;
          background: none !important;
          box-shadow: none !important;
          min-width: 0;
          width: 100%;
          max-width: 420px;
        }
        @media (max-width: 600px) {
          .project-grid-card {
            max-width: 98vw;
            width: 100%;
            margin: 0 auto;
            border-radius: 16px;
            box-shadow: 0 2px 12px 0 rgba(60,60,100,0.10);
            background: #fff;
            justify-content: center;
          }
          .projects-page-bg.dark .project-grid-card {
            background: #23272f;
            box-shadow: 0 2px 12px 0 rgba(34,34,59,0.16);
          }
        }
      `}</style>
    </>
  );
};

export default ProjectsPage;
