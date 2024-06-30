
import React from 'react';
import NavBarDesktop from '../components/NavBar_Desktop/nav-bar';
import NavBarMobile from '../components/NavBar_Mobile/NavBar-mobile';
import WelcomeFrame from '../components/welcome/welcome';
import PortfolioPictureImage from '../components/profile-picture-desktop/PortfolioPictureImage';
import AboutMeSection from '../components/AboutMe/AboutMeSectionLight';
import Languages from '../components/Languages/Languages';
import SkillFrame from '../components/Skills/SkillFrame';
import Project from "../components/Projects/Project1";
import Footer from "../components/Footer/Footer";
import ContactSection from "../components/Contact/ConatctUs";
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook
import ThemeToggleIcon from '../components/Icon/gmicon'; // Import the ThemeToggleIcon component

import Head from 'next/head';

const Home = () => {
  const { theme } = useTheme(); // Destructure theme from the context

  const sections = [
    { id: 'home-section', label: 'Home' },
    { id: 'about-section', label: 'About' },
    { id: 'languages-section', label: 'Skills' },
    { route: '/resume', label: 'Resume' },
    { id: 'project-section', label: 'Projects' },
    { id: 'contact-section', label: 'Contact' }
  ];

  return (
    <>
      <Head>
        <title>Ghulam Mujtaba - Software Engineer Portfolio</title>
        <meta name="description" content="Software engineer specializing in emerging technologies with expertise in Software Development, Data Science and AI." />
        <meta property="og:title" content="Ghulam Mujtaba - Software Engineer Portfolio" />
        <meta property="og:description" content="" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ghulammujtaba.com" />
        <meta property="og:image" content="https://ghulammujtaba.com/og-image.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" /> 
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        {/* Structured Data */}
        <script type="application/ld+json">
  {JSON.stringify({
    "@context": "http://schema.org",
    "@type": "Person",
    "name": "Ghulam Mujtaba",
    "url": "https://ghulammujtaba.com",
    "sameAs": [
      "https://www.linkedin.com/in/ghulamujtabaofficial",
      "https://www.instagram.com/ghulamujtabaofficial/",
      "https://github.com/ghulam-mujtaba5"
    ]
  })}
</script>

      </Head>
      <div style={{ backgroundColor: theme === 'dark' ? '#1d2127' : '#ffffff' }}>
        {/* Skip Link for Accessibility */}
        <a href="#main-content" className="skip-link" style={{ position: 'absolute', top: '-40px', left: '0', background: '#000', color: '#fff', padding: '8px', zIndex: '100' }}>Skip to main content</a>

        <header>
          {/* Theme Toggle Icon */}
          <ThemeToggleIcon style={{ width: '100%', height: 'auto' }} />

          {/* Desktop NavBar */}
          <nav>
            <NavBarDesktop style={{ width: '100%', height: '80px' }} />
          </nav>

          {/* Mobile NavBar */}
          <nav>
            <NavBarMobile style={{ width: '100%', height: '60px' }} sections={sections} />
          </nav>
        </header>

        {/* Main content sections */}
        <main id="main-content">
          <section id="home-section" aria-labelledby="home-section-heading">
            <h1 id="home-section-heading" className="visually-hidden">Home Section</h1>
            <div id="portfolio-picture" style={{ width: '100%', textAlign: 'center' }}>
              <PortfolioPictureImage style={{ width: '200px', height: '200px', margin: '20px auto', display: 'block' }} alt="Portfolio Picture" />
            </div>
            <WelcomeFrame style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          </section>

          <section id="about-section" aria-labelledby="about-section-heading" style={{ width: '100%', textAlign: 'center' }}>
            <h2 id="about-section-heading" className="visually-hidden">About Me</h2>
            <AboutMeSection />
          </section>

          <section id="languages-section" aria-labelledby="languages-section-heading" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <h2 id="languages-section-heading" className="visually-hidden">Skills</h2>
            <Languages />
          </section>

          <section id="skills-section" aria-labelledby="skills-section-heading" style={{ width: '100%' }}>
            <h2 id="skills-section-heading" className="visually-hidden">Skills</h2>
            <SkillFrame />
          </section>

          <section id="project-section" aria-labelledby="project-section-heading" style={{ width: '100%' }}>
            <h2 id="project-section-heading" className="visually-hidden">Projects</h2>
            <Project />
          </section>

          <section id="contact-section" aria-labelledby="contact-section-heading" style={{ width: '100%' }}>
            <h2 id="contact-section-heading" className="visually-hidden">Contact</h2>
            <ContactSection />
          </section>
        </main>

        {/* Footer */}
        <footer>
          <Footer style={{ width: '100%', height: '100px' }} />
        </footer>
      </div>
      <style jsx>{`
        .skip-link:focus {
          top: 0;
        }
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
      `}</style>
    </>
  );
};

export default Home;
