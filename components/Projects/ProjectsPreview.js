import React, { useRef, useEffect, useState } from 'react';
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
  // Animation: track which cards are visible
  const [visible, setVisible] = useState([false, false, false]);
  const cardRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const observers = cardRefs.map((ref, idx) => {
      if (!ref.current) return null;
      return new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(v => {
              if (v[idx]) return v;
              const updated = [...v];
              updated[idx] = true;
              return updated;
            });
          }
        },
        { threshold: 0.2 }
      );
    });
    observers.forEach((observer, idx) => {
      if (observer && cardRefs[idx].current) {
        observer.observe(cardRefs[idx].current);
      }
    });
    return () => {
      observers.forEach((observer, idx) => {
        if (observer && cardRefs[idx].current) {
          observer.unobserve(cardRefs[idx].current);
        }
      });
    };
    // eslint-disable-next-line
  }, []);

  return (
    <section style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '3.5rem 0 2.5rem 0' }}>
      <div style={{ width: '100%', marginBottom: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{
          fontSize: '2.1rem',
          fontWeight: 800,
          letterSpacing: '-1px',
          color: theme === 'dark' ? '#fff' : '#18181b',
          margin: 0,
          textShadow: theme === 'dark' ? '0 2px 8px #0002' : '0 2px 8px #fff2',
        }}>Projects</h2>
        <Link href="/projects" legacyBehavior>
          <a
            className={styles.viewAll}
            tabIndex={0}
            style={{
              fontSize: '1.05rem',
              marginLeft: 0,
              padding: '0.55rem 1.3rem',
              borderRadius: 18,
              display: 'inline-block',
              background: theme === 'dark' ? '#23272f' : '#f3f4f6',
              color: theme === 'dark' ? '#60a5fa' : '#2563eb',
              boxShadow: '0 1px 6px 0 rgba(60,60,100,0.09)',
              fontWeight: 700,
              border: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            View All
          </a>
        </Link>
      </div>
      <div className={styles.projectGrid}>
        {projects.slice(0, 3).map((project, idx) => (
          <div
            key={project.title}
            className={
              styles.projectCard +
              ' ' + (visible[idx] ? styles.cardVisible : styles.cardHidden)
            }
            ref={cardRefs[idx]}
            style={{ background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
          >
            <Project1 projectOverride={project} />
          </div>
        ))}
      </div>
      <style jsx>{`
        @media (max-width: 600px) {
          .${styles.viewAll} {
            font-size: 1rem !important;
            padding: 0.5rem 1.1rem !important;
            border-radius: 16px !important;
            display: inline-block !important;
            background: #23272f !important;
            color: #60a5fa !important;
            box-shadow: 0 1px 4px 0 rgba(60,60,100,0.09) !important;
            font-weight: 700 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ProjectsPreview;
