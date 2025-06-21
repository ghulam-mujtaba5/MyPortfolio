
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
  const isHome = router.pathname === '/' && (!hash || hash === '#home-section');
  const isAbout = router.pathname === '/' && hash === '#about-section';
  const isSkills = router.pathname === '/' && hash === '#languages-section';
  const isResume = router.pathname === '/resume';
  const isProjects = router.pathname === '/projects';
  const isContact = router.pathname === '/' && hash === '#contact-section';

  return (
    <header className={styles.header}>
      {/* Home button */}
      <button
        className={`${styles.home} ${isHome ? styles.active : ''}`}
        onClick={() => handleScrollToSection("home-section")}
      >
        <b className={styles.homeText}>Home</b>
      </button>

      {/* About section */}
      <div
        className={`${styles.about} ${isAbout ? styles.active : ''}`}
        onClick={() => handleScrollToSection("about-section")}
      >
        <div className={styles.aboutText}>About</div>
      </div>

      {/* Skills section */}
      <div
        className={`${styles.skills} ${isSkills ? styles.active : ''}`}
        onClick={() => handleScrollToSection("languages-section")}
      >
        <div className={styles.skillsText}>Skills</div>
      </div>

      {/* Logo and Name Animation */}
      <Link href="http://softbuilt.ghulammujtaba.com" passHref>
        <div
          className={styles.logoAnimation}
          onMouseEnter={() => handleMouseHover(true)}
          onMouseLeave={() => handleMouseHover(false)}
        >
          <button className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
            <img
              className={styles.logoIcon}
              alt="Logo"
              src={hover ? "sb.svg" : "gmVectorDark.svg"}
              style={{
                width: hover ? "30px" : "40px",
                height: hover ? "30px" : "40px",
              }}
            />
          </button>
          <div className={styles.typo}>
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
          </div>
        </div>
      </Link>

      {/* Resume section */}
      <div className={`${styles.resume} ${isResume ? styles.active : ''}`} onClick={() => handleNavigation("/resume")}>
        <div className={styles.resumeText}>Resume</div>
      </div>

      {/* Project section */}
      <div
        className={`${styles.project} ${isProjects ? styles.active : ''}`}
        onClick={() => handleNavigation("/projects")}
      >
        <div className={styles.projectText}>Project</div>
      </div>

      {/* Contact section */}
      <div
        className={`${styles.contact} ${isContact ? styles.active : ''}`}
        onClick={() => handleScrollToSection("contact-section")}
      >
        <div className={styles.contactText}>Contact</div>
      </div>
    </header>
  );
};

export default NavBar;
