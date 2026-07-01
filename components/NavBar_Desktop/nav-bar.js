import styles from "./nav-bar.module.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";

const NavBar = () => {
  const [hover, setHover] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [currentHash, setCurrentHash] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [mounted, setMounted] = useState(false);
  const [nameAnimationState, setNameAnimationState] = useState("idle");
  const router = useRouter();
  const { theme } = useTheme();

  // Set mounted state and initialize client-side values
  useEffect(() => {
    setMounted(true);
    setCurrentHash(window.location.hash);
    setCurrentPath(router.asPath.split("#")[0]);

    // Trigger entrance animation shortly after mount
    const animationTimer = setTimeout(() => {
      setNameAnimationState("entering");
    }, 50);

    // Listen for hash changes
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      clearTimeout(animationTimer);
    };
  }, [router.asPath]);

  // Update path when route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      setCurrentPath(url.split("#")[0]);
      setCurrentHash(window.location.hash);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // Auto-hide navbar on scroll down, show on scroll up
  useEffect(() => {
    let rafId = null;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const previous = lastScrollY.current;

        if (currentScrollY > previous + 50 && currentScrollY > 100) {
          setIsVisible(false);
        } else if (currentScrollY < previous - 50 || currentScrollY < 100) {
          setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const handleMouseHover = useCallback((state) => {
    setHover(state);
    setNameAnimationState(state ? "hovering" : "idle");
  }, []);

  const handleScrollToSection = useCallback(
    (sectionId) => {
      const basePath = currentPath || "/";
      const targetHash = `#${sectionId}`;

      const smoothScrollTo = () => {
        window.requestAnimationFrame(() => {
          const section = document.getElementById(sectionId);
          if (section) section.scrollIntoView({ behavior: "smooth" });
        });
      };

      // If not on the home page, navigate first, then scroll. Use the router
      // to set the hash (shallow) so the browser doesn't perform an instant
      // jump that fights our smooth scroll.
      if (basePath !== "/") {
        router.push("/" + targetHash).then(smoothScrollTo);
        return;
      }

      if (window.location.hash !== targetHash) {
        router.replace("/" + targetHash, undefined, { shallow: true });
      }
      smoothScrollTo();
    },
    [router, currentPath],
  );

  const handleNavigation = useCallback(
    (path) => {
      router.push(path);
    },
    [router],
  );

  // Determine active/selected state - only on client side after mount
  const hash = mounted ? currentHash : "";
  const path = mounted ? currentPath : "";

  const isProjects = path === "/projects";
  const isHome = path === "/" && (hash === "" || hash === "#home-section");
  const isAbout = path === "/about";
  const isResume = path === "/resume";
  const isArticles = path === "/insights" || path.startsWith("/insights/");
  const isContact = path === "/" && hash === "#contact-section";

  // Determine which SVG to use based on theme
  const nameIconSrc =
    mounted && theme === "light"
      ? "/ghulam-mujtaba-wordmark-on-light.svg"
      : "/ghulam-mujtaba-wordmark-on-dark.svg";

  const logoIconSrc =
    mounted && theme === "light"
      ? "/personal-gm-monogram-on-light.svg"
      : "/personal-gm-monogram-on-dark.svg";

  // Get animation class for name
  const getNameAnimationClass = () => {
    switch (nameAnimationState) {
      case "entering":
        return styles.nameEntering;
      case "hovering":
        return styles.nameHovering;
      default:
        return "";
    }
  };

  const headerInlineStyle = mounted && theme === "dark" ? {
    backgroundColor: 'rgba(29, 33, 39, 0.95)',
    border: '1px solid rgba(0,0,0,0.6)'
  } : undefined;

  return (
    <header
      className={`${styles.header} ${isVisible ? styles.visible : styles.hidden} ${mounted ? (theme === "light" ? styles.headerLight : "") : ""}`}
      style={headerInlineStyle}
    >
      {/* Left side navigation */}
      <div className={styles.leftNavigation}>
        {/* Home button */}
        <button
          className={`${styles.home} ${isHome ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleScrollToSection("home-section")}
          type="button"
        >
          <b className={styles.homeText}>Home</b>
        </button>

        {/* About page */}
        <button
          className={`${styles.about} ${isAbout ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleNavigation("/about")}
          type="button"
        >
          <span className={styles.aboutText}>About</span>
        </button>
      </div>

      {/* Articles section */}
      <button
        className={`${styles.project} ${isArticles ? styles.active : ""} ${styles.navItem}`}
        onClick={() => handleNavigation("/insights")}
        type="button"
      >
        <span className={styles.projectText}>Insights</span>
      </button>

      {/* Logo and Name Animation - Central Element */}
      <Link
        href="/"
        className={`${styles.logoAnimation} ${hover ? styles.logoAnimationHover : ""}`}
        onMouseEnter={() => handleMouseHover(true)}
        onMouseLeave={() => handleMouseHover(false)}
        aria-label="Go to homepage - Ghulam Mujtaba"
      >
          {/* Logo Circle */}
          <span className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
            <img
              className={styles.logoIcon}
              alt="GM Logo"
              src={logoIconSrc}
              width="40"
              height="40"
            />
          </span>

          {/* Name Typography with Animation */}
          <span className={`${styles.typo} ${hover ? styles.typoHover : ""}`}>
            <span
              className={`${styles.nameWrapper} ${getNameAnimationClass()}`}
            >
              <img
                className={`${styles.nameIcon} ${hover ? styles.nameIconHover : ""}`}
                loading="eager"
                alt="Ghulam Mujtaba"
                src={nameIconSrc}
                width="190"
                height="20"
              />
            </span>

            {/* Animated underline */}
            <span
              className={`${styles.nameUnderline} ${hover ? styles.nameUnderlineActive : ""}`}
            />
          </span>

      </Link>

      {/* Right side navigation */}
      <div className={styles.rightNavigation}>
        {/* Resume section */}
        <button
          className={`${styles.resume} ${isResume ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleNavigation("/resume")}
          type="button"
        >
          <span className={styles.resumeText}>Resume</span>
        </button>

        {/* Project section */}
        <button
          className={`${styles.project} ${isProjects ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleNavigation("/projects")}
          type="button"
        >
          <span className={styles.projectText}>Projects</span>
        </button>

        {/* Contact section */}
        <button
          className={`${styles.contact} ${isContact ? styles.active : ""} ${styles.navItem}`}
          onClick={() => handleScrollToSection("contact-section")}
          type="button"
        >
          <span className={styles.contactText}>Contact</span>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
