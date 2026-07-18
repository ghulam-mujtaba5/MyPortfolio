import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "../context/ThemeContext";
import SEO, { breadcrumbSchema } from "../components/SEO";
import { MAIN_SECTIONS } from "../constants/navigation";
import styles from "../styles/UsesPage.module.css";
import { Laptop, Cpu, Server } from "lucide-react";

const NavBarDesktop = dynamic(() => import("../components/NavBar_Desktop/nav-bar"), { ssr: false });
const NavBarMobile = dynamic(() => import("../components/NavBar_Mobile/NavBar-mobile"), { ssr: false });
const Footer = dynamic(() => import("../components/Footer/Footer"), { ssr: false });

export default function UsesPage() {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const sections = MAIN_SECTIONS;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const usesJsonLd = [
    breadcrumbSchema([
      { name: "Home", url: "https://ghulammujtaba.com/" },
      { name: "Uses", url: "https://ghulammujtaba.com/uses" }
    ])
  ];

  return (
    <>
      <SEO
        title="My Developer Setup & Tech Stack | Ghulam Mujtaba"
        description="What Ghulam Mujtaba uses for software engineering, full-stack web development, and AI coding. Hardware, editor configs, extensions, hosting, and dev tools."
        url="https://ghulammujtaba.com/uses"
        canonical="https://ghulammujtaba.com/uses"
        image="https://ghulammujtaba.com/og-image.png"
        imageWidth={1200}
        imageHeight={630}
        imageAlt="Ghulam Mujtaba — Developer Setup & Tech Stack"
        author="Ghulam Mujtaba"
        keywords="developer setup, workspace uses, tech stack, VS Code settings, hardware, software engineering tools, laptop for programming"
        jsonLd={usesJsonLd}
      />

      <div className={styles.pageBg}>
        <header>
          {isMobile ? <NavBarMobile sections={sections} /> : <NavBarDesktop />}
        </header>

        <main id="main-content" className={styles.contentContainer}>
          <section className={styles.usesHero}>
            <h1 className={styles.usesTitle}>
              My <span className={styles.usesTitleGradient}>Workspace & Setup</span>
            </h1>
            <p className={styles.usesSubtitle}>
              A detailed list of the hardware, software, editor configuration, hosting environments, and dev tools I use on a daily basis to build and scale applications.
            </p>
          </section>

          {/* --- Hardware & Workspace --- */}
          <section className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>
              <Laptop size={28} /> Hardware & Desk Setup
            </h2>
            <div className={styles.usesGrid}>
              <div className={styles.usesCard}>
                <h3 className={styles.usesCardTitle}>Laptop & Computing</h3>
                <ul className={styles.usesList}>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>MacBook Pro M3 Pro (16-inch)</span>
                    <span className={styles.usesItemDesc}>12-core CPU, 18-core GPU, 36GB Unified Memory, 1TB SSD. My primary workhorse for heavy compilation, local container testing, and model evaluations.</span>
                  </li>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>Custom Desktop (Windows 11)</span>
                    <span className={styles.usesItemDesc}>AMD Ryzen 9 5900X, 64GB DDR4 RAM, NVIDIA RTX 3080 Ti 12GB. Used as a local machine learning sandbox and GPU training box.</span>
                  </li>
                </ul>
              </div>

              <div className={styles.usesCard}>
                <h3 className={styles.usesCardTitle}>Peripherals & Audio</h3>
                <ul className={styles.usesList}>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>Dell UltraSharp 27" 4K Monitor</span>
                    <span className={styles.usesItemDesc}>Vertical pivot support, color accurate panel. Great for reading code files side-by-side.</span>
                  </li>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>Keychron Q1 Pro Mechanical Keyboard</span>
                    <span className={styles.usesItemDesc}>75% layout, custom Gateron Brown tactile switches. Highly responsive and ergonomic typing experience.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* --- Editor & Development --- */}
          <section className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>
              <Cpu size={28} /> Editor & Development Stack
            </h2>
            <div className={styles.usesGrid}>
              <div className={styles.usesCard}>
                <h3 className={styles.usesCardTitle}>VS Code & Terminal</h3>
                <ul className={styles.usesList}>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>VS Code (Theme: One Dark Pro)</span>
                    <span className={styles.usesItemDesc}>Font: Fira Code (with ligatures enabled). Key extensions: Copilot, ESLint, GitLens, Prettier, Prisma, Tailwind CSS IntelliSense.</span>
                  </li>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>Warp / iTerm2 Terminal</span>
                    <span className={styles.usesItemDesc}>Using Zsh with Oh My Zsh, Starship prompt, syntax highlighting, and auto-suggestions.</span>
                  </li>
                </ul>
              </div>

              <div className={styles.usesCard}>
                <h3 className={styles.usesCardTitle}>Primary Languages & Frameworks</h3>
                <ul className={styles.usesList}>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>TypeScript & Node.js</span>
                    <span className={styles.usesItemDesc}>The core of my full-stack web projects. Next.js is my default framework choice for SEO and optimization.</span>
                  </li>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>Python (AI / Data Science)</span>
                    <span className={styles.usesItemDesc}>Used extensively with TensorFlow, PyTorch, Pandas, and FastAPI for backend ML APIs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* --- Infrastructure & Databases --- */}
          <section className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>
              <Server size={28} /> Hosting, Databases & SaaS
            </h2>
            <div className={styles.usesGrid}>
              <div className={styles.usesCard}>
                <h3 className={styles.usesCardTitle}>Infrastructure</h3>
                <ul className={styles.usesList}>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>Vercel (Front-end hosting)</span>
                    <span className={styles.usesItemDesc}>Next.js deployments, CI/CD pipeline, previews, and automatic domain configurations.</span>
                  </li>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>AWS (Amazon Web Services)</span>
                    <span className={styles.usesItemDesc}>S3 for static assets, EC2 for custom API compute, and ECS for containerized services.</span>
                  </li>
                </ul>
              </div>

              <div className={styles.usesCard}>
                <h3 className={styles.usesCardTitle}>Databases & Third-Party</h3>
                <ul className={styles.usesList}>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>MongoDB Atlas</span>
                    <span className={styles.usesItemDesc}>My primary document store. Used for storing projects, articles, user credentials, and app states.</span>
                  </li>
                  <li className={styles.usesItem}>
                    <span className={styles.usesItemName}>Cloudinary / GridFS</span>
                    <span className={styles.usesItemDesc}>Image asset delivery, hosting, dynamic resizing, and PDF downloads.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
