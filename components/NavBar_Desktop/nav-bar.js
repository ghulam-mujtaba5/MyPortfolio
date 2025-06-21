
import styles from "./nav-bar.module.css";
import { useState } from "react";
import { useRouter } from "next/router"; // Import useRouter from Next.js
import Link from "next/link"; // Import Link from Next.js

const NavBar = () => {
  const [hover, setHover] = useState(false);
  const router = useRouter(); // Initialize the router

  const handleMouseHover = (state) => {
    setHover(state);
  };

  const handleScrollToSection = (sectionId) => {
    // If on the projects page, navigate to the home page with hash
    if (router.pathname === '/projects') {
      router.push('/#' + sectionId);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleNavigation = (path) => {
    router.push(path); // Use router to navigate to the specified path
  };

  // Determine active/selected state
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const isProjects = router.pathname === '/projects';
  const isHome = !isProjects;
  const isAbout = router.pathname === '/' && hash === '#about-section';
  const isSkills = router.pathname === '/' && hash === '#languages-section';
  const isResume = router.pathname === '/resume';
  const isContact = router.pathname === '/' && hash === '#contact-section';

  return (
    <header className={styles.header}>
      <nav aria-label="Main Navigation">
        {/* Home link */}
        <a
          href="#home-section"
          className={`${styles.home} ${isHome ? styles.active : ''}`}
          onClick={e => { e.preventDefault(); handleScrollToSection("home-section"); }}
        >
          <b className={styles.homeText}>Home</b>
        </a>

        {/* About section */}
        <a
          href="#about-section"
          className={`${styles.about} ${isAbout ? styles.active : ''}`}
          onClick={e => { e.preventDefault(); handleScrollToSection("about-section"); }}
        >
          <span className={styles.aboutText}>About</span>
        </a>

        {/* Skills section */}
        <a
          href="#languages-section"
          className={`${styles.skills} ${isSkills ? styles.active : ''}`}
          onClick={e => { e.preventDefault(); handleScrollToSection("languages-section"); }}
        >
          <span className={styles.skillsText}>Skills</span>
        </a>

        {/* Logo and Name Animation */}
        <Link href="http://softbuilt.ghulammujtaba.com" passHref legacyBehavior>
          <a className={styles.logoAnimation} onMouseEnter={() => handleMouseHover(true)} onMouseLeave={() => handleMouseHover(false)} aria-label="SoftBuilt Home">
            <span className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
              <img
                className={styles.logoIcon}
                alt="Logo"
                src={hover ? "sb.svg" : "gmVectorDark.svg"}
                style={{
                  width: hover ? "30px" : "40px",
                  height: hover ? "30px" : "40px",
                }}
              />
            </span>
            <span className={styles.typo}>
              {!hover && (
                <img
                  className={styles.nameIcon}
                  loading="lazy"
                  alt="Ghulam Mujtaba"
                  src="/ghulam-mujtaba.svg"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}
              {hover && (
                <img
                  className={styles.alternativeNameIcon}
                  loading="lazy"
                  alt="SoftBuilt"
                  src="/sbname.svg"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}
            </span>
          </a>
        </Link>

        {/* Resume section */}
        <a
          href="/resume"
          className={`${styles.resume} ${isResume ? styles.active : ''}`}
          onClick={e => { e.preventDefault(); handleNavigation("/resume"); }}
        >
          <span className={styles.resumeText}>Resume</span>
        </a>

        {/* Project section */}
        <a
          href="/projects"
          className={`${styles.project} ${isProjects ? styles.active : ''}`}
          onClick={e => { e.preventDefault(); handleNavigation("/projects"); }}
        >
          <span className={styles.projectText}>Project</span>
        </a>

        {/* Contact section */}
        <a
          href="#contact-section"
          className={`${styles.contact} ${isContact ? styles.active : ''}`}
          onClick={e => { e.preventDefault(); handleScrollToSection("contact-section"); }}
        >
          <span className={styles.contactText}>Contact</span>
        </a>
      </nav>
    </header>
  );
};

export default NavBar;
