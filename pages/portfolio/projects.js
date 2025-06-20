
import React from 'react';
import dynamic from 'next/dynamic';
import SEO from '../../components/SEO';
import NavBar from '../../components/NavBar_Desktop/nav-bar';
import Footer from '../../components/Footer/Footer';

// Dynamically import Project1 to avoid SSR issues with useTheme
const Project1 = dynamic(() => import('../../components/Projects/Project1'), { ssr: false });

const ProjectsPage = () => {
  return (
    <>
      <SEO
        title="Projects | Ghulam Mujtaba Portfolio"
        description="Explore a curated selection of software engineering projects by Ghulam Mujtaba, showcasing expertise in full-stack development, UI/UX, and modern web technologies."
        url="https://ghulammujtaba.com/portfolio/projects"
        image="/og-image.png"
        type="website"
        canonical="https://ghulammujtaba.com/portfolio/projects"
        keywords="Ghulam Mujtaba, Portfolio, Projects, Software Engineer, Full Stack, React, Next.js, Java, UI/UX"
      />
      <NavBar />
      <main
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f9f9f9 60%, #e3e8f0 100%)',
          paddingTop: 40,
          paddingBottom: 40,
        }}
        aria-label="Projects Section"
      >
        <section
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 16px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 18,
            boxShadow: '0 4px 32px 0 rgba(60,60,60,0.07)',
            border: '1px solid #e3e8f0',
          }}
        >
          <header style={{ marginBottom: 36, textAlign: 'center', paddingTop: 32 }}>
            <h1
              style={{
                fontFamily: 'Open Sans, sans-serif',
                fontWeight: 800,
                fontSize: 40,
                margin: 0,
                letterSpacing: '-0.5px',
                color: '#1d2127',
              }}
              tabIndex={0}
            >
              Projects
            </h1>
            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#3a3a3a',
                fontSize: 20,
                marginTop: 16,
                marginBottom: 0,
                maxWidth: 700,
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.6,
              }}
              tabIndex={0}
            >
              Explore a curated gallery of impactful software engineering projects. From robust full-stack applications to elegant UI/UX solutions, each project highlights my technical expertise, creative problem-solving, and dedication to delivering value.
            </p>
          </header>
          <hr style={{ border: 'none', borderTop: '1.5px solid #e3e8f0', margin: '0 0 36px 0' }} />
          <Project1 />
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ProjectsPage;
