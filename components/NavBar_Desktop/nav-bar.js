import styles from "./nav-bar.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Import useRouter from Next.js
import Link from "next/link"; // Import Link from Next.js
import { useScrollDirection } from "../../hooks/useScrollAnimation";

const NavBar = () => {
  const [hover, setHover] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter(); // Initialize the router
  const { scrollDirection } = useScrollDirection();

  // Auto-hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY + 50 && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 50 || currentScrollY < 100) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleMouseHover = (state) => {
    setHover(state);
  };

  const handleScrollToSection = (sectionId) => {
    // If not on the home page, navigate to the home page with the hash
    const basePath =
      typeof window !== "undefined"
        ? router.asPath.split("#")[0]
        : router.pathname;
    const targetHash = `#${sectionId}`;

    // If not on the home page, navigate to the home page first, then set the hash and scroll
    if (basePath !== "/") {
      router.push("/").then(() => {
        if (typeof window !== "undefined") {
          // Update the URL hash and attempt smooth scroll once the page is loaded
          try {
            window.location.hash = targetHash;
          } catch (e) {
            /* ignore */
          }
          window.requestAnimationFrame(() => {
            const section = document.getElementById(sectionId);
            if (section) section.scrollIntoView({ behavior: "smooth" });
          });
        }
      });
      return;
    }

    // Already on home: ensure URL hash reflects target, then smooth scroll
    if (typeof window !== "undefined" && window.location.hash !== targetHash) {
      // Update hash without a full navigation
      router.replace("/" + targetHash, undefined, { shallow: true });
    }
    // Defer to next frame to ensure DOM focus/URL update before scrolling
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  };

  const handleNavigation = (path) => {
    router.push(path); // Use router to navigate to the specified path
  };

  // Determine active/selected state
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  // Use asPath (without hash) to correctly detect current route, including dynamic routes
  const path =
    typeof window !== "undefined"
      ? router.asPath.split("#")[0]
      : router.pathname;
  const isProjects = path === "/projects";
  const isHome = path === "/" && (hash === "" || hash === "#home-section");
  const isAbout = path === "/" && hash === "#about-section";
  const isResume = path === "/resume";
  const isArticles = path === "/articles" || path.startsWith("/articles/");
  const isContact = path === "/" && hash === "#contact-section";

  return (
    <header className={`${styles.header} ${isVisible ? styles.visible : styles.hidden}`}>
      {/* Left side navigation */}
      <div className={styles.leftNavigation}>
        {/* Home button */}
        <button
          className={`${styles.home} ${isHome ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleScrollToSection("home-section")}
        >
          <b className={styles.homeText}>Home</b>
        </button>

        {/* About section */}
        <div
          className={`${styles.about} ${isAbout ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleScrollToSection("about-section")}
        >
          <div className={styles.aboutText}>About</div>
        </div>
      </div>

      {/* Articles section */}
      <div
        className={`${styles.project} ${isArticles ? styles.active : ""} ${styles.navItem}`}
        onClick={() => handleNavigation("/articles")}
      >
        <div className={styles.projectText}>Articles</div>
      </div>

      {/* Logo and Name Animation */}
      <Link href="/" passHref>
        <div
          className={styles.logoAnimation}
          onMouseEnter={() => handleMouseHover(true)}
          onMouseLeave={() => handleMouseHover(false)}
        >
          <button className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
            <img
              className={styles.logoIcon}
              alt="GM Logo"
              src="/gmVectorDark.svg"
              style={{
                width: "40px",
                height: "40px",
              }}
            />
          </button>
          <div className={styles.typo}>
            <img
              className={styles.nameIcon}
              loading="lazy"
              alt="Ghulam Mujtaba"
              src="/ghulam-mujtaba.svg"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>
      </Link>

      {/* Right side navigation */}
      <div className={styles.rightNavigation}>
        {/* Resume section */}
        <div
          className={`${styles.resume} ${isResume ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleNavigation("/resume")}
        >
          <div className={styles.resumeText}>Resume</div>
        </div>

        {/* Project section */}
        <div
          className={`${styles.project} ${isProjects ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleNavigation("/projects")}
        >
          <div className={styles.projectText}>Projects</div>
        </div>

        {/* Contact section */}
        <div
          className={`${styles.contact} ${isContact ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleScrollToSection("contact-section")}
        >
          <div className={styles.contactText}>Contact</div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
