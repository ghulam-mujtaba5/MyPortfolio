import React, { useCallback } from 'react';
import Head from 'next/head';
import { useTheme } from '../../context/ThemeContext'; // Import the useTheme hook
import NavBarDesktop from '../../components/NavBar_Desktop_Company/nav-bar-Company';
import NavBarMobile from '../../components/NavBar_Mobile/NavBar-mobile';
import WelcomeFrame from '../../components/welcomeCompany/welcome';
import AboutMeSection from '../../components/AboutMeCompany/AboutMeSectionLight';
import ServicesFrame from '../../components/Services/ServicesFrame';
import ContactSection from '../../components/Contact/ConatctUs';
import Footer from '../../components/Footer/Footer';
import ThemeToggleIcon from '../../components/Icon/sbicon'; // Import the ThemeToggleIcon component

export default function CompanyHome() {
  const { theme } = useTheme(); // Destructure theme from the context

  const onDarkModeButtonContainerClick = useCallback(() => {
    // Add your dark mode toggle logic here
  }, []);

  // Define paths for social media links
  const linkedinUrl = "https://www.linkedin.com/in/ghulamujtabaofficial";
  const instagramUrl = "https://www.instagram.com/ghulamujtabaofficial/";
  const githubUrl = "https://github.com/ghulam-mujtaba5";
  const copyrightText = "Copyright 2024 Soft Built. All Rights Reserved.";
  const contactEmail = "softbuilt@ghulammujtaba.com";
  const contactPhoneNumber = "+123 456 7890";

  // Sample menu list override
  const sections = [
    { id: 'home-section', label: 'Home' },
    { id: 'about-section', label: 'About' },
    { id: 'services-section', label: 'Services' },
    { id: 'contact-section', label: 'Contact' }
  ];

  return (
    <div style={{ backgroundColor: theme === 'dark' ? '#1d2127' : '#ffffff', overflowX: 'hidden' }}>
      <Head>
        <title>Soft Built Company</title>
        <meta name="description" content="Welcome to SoftBuilt, founded by Ghulam Mujtaba, specializing in Desktop, Web, and Mobile applications, data science, and AI solutions. Partner with us to turn your project ideas into reality." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="icon" href="/faviconsb.svg" type="image/svg+xml" />
        <link rel="icon" href="/faviconsb.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/faviconsb.ico" type="image/x-icon" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "http://schema.org",
            "@type": "Organization",
            "name": "Soft Built",
            "url": "http://www.ghulammujtaba.com",
            "logo": "https://ghulammujtaba.com/favicon.png",
            "sameAs": [
              linkedinUrl,
              instagramUrl,
              githubUrl
            ]
          })}
        </script>
      </Head>

      {/* Theme Toggle Icon */}
      <div id="theme-toggle" role="button" tabIndex="0" onClick={onDarkModeButtonContainerClick}>
        <ThemeToggleIcon style={{ width: '100%', height: 'auto' }} />
      </div>

      {/* Desktop NavBar */}
      <nav id="desktop-navbar" aria-label="Main Navigation">
        <NavBarDesktop style={{ width: '100%', height: '80px' }} />
      </nav>

      {/* Mobile NavBar */}
      <nav id="mobile-navbar" aria-label="Mobile Navigation">
        <NavBarMobile style={{ width: '100%', height: '60px' }} sections={sections} />
      </nav>

      {/* Welcome Frame */}
      <section id="welcome-section" aria-labelledby="welcome-heading" style={{ width: '100%', overflow: 'hidden' }}>
        <h1 id="welcome-heading" className="visually-hidden">Welcome</h1>
        <WelcomeFrame style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
      </section>
      
      {/* About Me Section */}
      <section id="about-section" aria-labelledby="about-heading" style={{ width: '100%', overflow: 'hidden' }}>
        <h2 id="about-heading" className="visually-hidden">About Me</h2>
        <AboutMeSection style={{ width: '100%', padding: '20px', textAlign: 'center' }} />
      </section>

      {/* Services Frame */}
      <section id="services-section" aria-labelledby="services-heading" style={{ width: '100%', overflow: 'hidden' }}>
        <h2 id="services-heading" className="visually-hidden">Services</h2>
        <ServicesFrame style={{ width: '100%', padding: '20px' }} />
      </section>

      {/* Contact Section */}
      <section id="contact-section" aria-labelledby="contact-heading" style={{ width: '100%', overflow: 'hidden' }}>
        <h2 id="contact-heading" className="visually-hidden">Contact</h2>
        <ContactSection 
          style={{ width: '100%', padding: '20px' }}
          email={contactEmail}
          phoneNumber={contactPhoneNumber}
          showCertificationBadge={false} 
        />
      </section>
      
      {/* Footer */}
      <footer id="footer-section" aria-label="Footer" style={{ width: '100%', overflow: 'hidden' }}>
        <Footer 
          style={{ width: '100%', height: '100px', padding: '20px' }}
          linkedinUrl={linkedinUrl}
          instagramUrl={instagramUrl}
          githubUrl={githubUrl}
          copyrightText={copyrightText}
        />
      </footer>
    </div>
  );
}
