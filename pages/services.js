import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "../context/ThemeContext";
import SEO, { breadcrumbSchema, professionalServiceSchema } from "../components/SEO";
import { MAIN_SECTIONS } from "../constants/navigation";
import styles from "../styles/ServicesPage.module.css";
import { Code2, Brain, Smartphone, Database, Calendar, Mail, ArrowRight } from "lucide-react";

const NavBarDesktop = dynamic(() => import("../components/NavBar_Desktop/nav-bar"), { ssr: false });
const NavBarMobile = dynamic(() => import("../components/NavBar_Mobile/NavBar-mobile"), { ssr: false });
const Footer = dynamic(() => import("../components/Footer/Footer"), { ssr: false });

const servicesList = [
  {
    icon: <Code2 size={32} />,
    title: "Full-Stack Web Development",
    description: "End-to-end, high-performance web applications built with Next.js, React, Node.js, and MongoDB. Specializing in secure, scalable MERN stack apps, startup MVPs, and customized workflows.",
    tech: ["Next.js", "React", "Node.js", "Express", "MongoDB", "TypeScript", "PostgreSQL"]
  },
  {
    icon: <Brain size={32} />,
    title: "Custom AI & Chatbot Development",
    description: "Integrating advanced generative AI capabilities into business portals. Designing RAG chatbot setups, prompt engineering pipelines, LLM fine-tuning, and automated workflows to save hundreds of operational hours.",
    tech: ["OpenAI API", "LangChain", "Vector DBs", "RAG Pipeline", "FastAPI", "Python", "LlamaIndex"]
  },
  {
    icon: <Smartphone size={32} />,
    title: "Cross-Platform Mobile Apps",
    description: "Building responsive, modern iOS and Android mobile applications using React Native and Flutter. Supporting clean state management, offline storage, push notifications, and native hardware features.",
    tech: ["React Native", "Flutter", "Redux", "Firebase", "SQLite", "App Store Deployments"]
  },
  {
    icon: <Database size={32} />,
    title: "Data Science & Analytics",
    description: "Processing complex datasets into actionable business dashboards. Expertise in regression models, NLP classification pipelines, Google Analytics integrations, data extraction, and visual reports.",
    tech: ["Python", "TensorFlow", "Pandas", "Scikit-Learn", "Data Analytics", "Power BI", "Tableau"]
  }
];

export default function ServicesPage() {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const sections = MAIN_SECTIONS;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const servicesJsonLd = [
    professionalServiceSchema(),
    breadcrumbSchema([
      { name: "Home", url: "https://ghulammujtaba.com/" },
      { name: "Services", url: "https://ghulammujtaba.com/services" }
    ])
  ];

  return (
    <>
      <SEO
        title="Full-Stack Web Development & AI Services | Ghulam Mujtaba"
        description="Hire Ghulam Mujtaba, a professional Next.js full-stack developer and AI/ML specialist based in Pakistan. Offering customized software, chatbots, and APIs."
        url="https://ghulammujtaba.com/services"
        canonical="https://ghulammujtaba.com/services"
        image="https://ghulammujtaba.com/og-image.png"
        imageWidth={1200}
        imageHeight={630}
        imageAlt="Ghulam Mujtaba — Full-Stack Web Development & AI Services"
        author="Ghulam Mujtaba"
        keywords="hire full stack developer, freelance developer pakistan, next.js developer for hire, freelance programmer, custom AI development, MERN developer, custom chatbots"
        jsonLd={servicesJsonLd}
      />

      <div className={styles.pageBg}>
        <header>
          {isMobile ? <NavBarMobile sections={sections} /> : <NavBarDesktop />}
        </header>

        <main id="main-content" className={styles.contentContainer}>
          <section className={styles.heroSection}>
            <h1 className={styles.heroTitle}>
              Software Engineering & <span className={styles.heroTitleGradient}>AI Development Services</span>
            </h1>
            <p className={styles.heroSubtitle}>
              I help startups and businesses design, build, and deploy production-ready digital products. From scalable web frameworks to secure AI chatbot pipelines, let's build something exceptional together.
            </p>
          </section>

          <section className={styles.servicesGrid}>
            {servicesList.map((service, index) => (
              <div key={index} className={styles.serviceCard}>
                <div className={styles.iconWrapper}>
                  {service.icon}
                </div>
                <h2 className={styles.cardTitle}>{service.title}</h2>
                <p className={styles.cardDescription}>{service.description}</p>
                <div className={styles.techTags}>
                  {service.tech.map((t, i) => (
                    <span key={i} className={styles.techTag}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>Ready to Scale Your Project?</h2>
            <p className={styles.ctaText}>
              Whether you need a dedicated full-stack developer for a Next.js platform or want to explore how generative AI chatbots can streamline your workflows, I'm ready to collaborate.
            </p>
            <div className={styles.ctaButtonGroup}>
              <a href="/#contact-section" className={styles.primaryCta}>
                Get in Touch <ArrowRight size={18} style={{ display: "inline-block", marginLeft: "8px", verticalAlign: "middle" }} />
              </a>
              <a href="https://topmate.io/ghulam_mujtaba" target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
                Book a 1:1 Call
              </a>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
