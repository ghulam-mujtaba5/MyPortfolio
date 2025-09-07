import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import SEO from "../components/SEO";
import AboutMeSection from "../components/AboutMe/AboutMeSectionLight";
import common from "../components/AboutPage/AboutPageCommon.module.css";
import light from "../components/AboutPage/AboutPageLight.module.css";
import dark from "../components/AboutPage/AboutPageDark.module.css";
import { useTheme } from "../context/ThemeContext";

const NavBarDesktop = dynamic(() => import("../components/NavBar_Desktop/nav-bar"), { ssr: false });
const NavBarMobile = dynamic(() => import("../components/NavBar_Mobile/NavBar-mobile"), { ssr: false });
const Footer = dynamic(() => import("../components/Footer/Footer"), { ssr: false });

const skills = [
  "Java",
  "Python",
  "JavaScript",
  "C",
  "C++",
  "HTML",
  "CSS",
  "React",
  "Next.js",
  "React Native",
  "Electron.js",
  "JavaFX",
  "Spring",
  "Supabase",
  "MongoDB",
  "Git",
  "Figma",
  "Azure",
  "Data Analysis",
  "Data Visualization",
  "Data Annotation",
];

const experience = [
  {
    role: "AI Data Annotator & AI Model Evaluator (Contract-Based, Remote)",
    company: "Appen",
    start: "2022",
    end: "2025",
    description:
      "Annotated and evaluated AI-generated content across multiple Appen projects (Uolo V2 & P, Fireweed, Plumeria V2, Emerald), improving LLM accuracy and search relevance.",
  },
];

const projects = [
  {
    name: 'Shop Management & Billing Software',
    desc: 'Desktop app (Java, JavaFX, Maven, Spring) for inventory, sales tracking and automated billing.',
  },
  {
    name: 'DigiFinSense Mobile App',
    desc: 'React Native CLI + Supabase mobile app for real-time financial analytics and API integration.',
  },
  {
    name: 'PulseFocus Desktop App',
    desc: 'Electron.js app with blink-detection for AI-powered productivity and eye-strain management.',
  },
  {
    name: 'My Portfolio',
    desc: 'This website (Next.js, React) showcasing projects, articles and contact.',
  },
];

const certifications = [
  'Meta Front-End Developer',
  'Google UX Design',
  'Google Data Analytics',
  'Google Project Management',
  'Google Cybersecurity',
];

const interests = [
  'Machine Learning',
  'Big Data Analytics',
  'Full stack & AI Development',
  'Large Language Models',
];

const funFacts = [
  {
    icon: '🚀',
    title: 'Innovation Mindset',
    text: 'Always exploring cutting-edge technologies and implementing creative solutions to complex problems.'
  },
  {
    icon: '🎯',
    title: 'Problem Solver',
    text: 'Passionate about turning challenging requirements into elegant, user-friendly applications.'
  },
  {
    icon: '⚡',
    title: 'Fast Learner',
    text: 'Quickly adapts to new frameworks and technologies, staying ahead of industry trends.'
  },
  {
    icon: '🌱',
    title: 'Growth Oriented',
    text: 'Continuously improving skills through hands-on projects and learning from the developer community.'
  }
];

const achievements = [
  {
    icon: '🏆',
    title: 'AI Model Excellence',
    description: 'Successfully evaluated and improved LLM accuracy across multiple Appen projects, contributing to enhanced search relevance.'
  },
  {
    icon: '💡',
    title: 'Full-Stack Innovation',
    description: 'Developed diverse applications from desktop billing software to mobile financial analytics platforms.'
  },
  {
    icon: '🎓',
    title: 'Certified Professional',
    description: 'Earned 5 Google certifications and Meta Front-End Developer certification, demonstrating expertise across multiple domains.'
  }
];

const skillsData = [
  {
    icon: '🚀',
    name: 'Full-Stack Development',
    description: 'Modern web applications with React, Next.js, Node.js, and cloud platforms'
  },
  {
    icon: '🤖',
    name: 'AI & Machine Learning',
    description: 'Deep learning models, computer vision, NLP, and AI-powered solutions'
  },
  {
    icon: '📊',
    name: 'Data Science',
    description: 'Statistical analysis, data visualization, and predictive modeling'
  },
  {
    icon: '☁️',
    name: 'Cloud Architecture',
    description: 'AWS, Google Cloud, containerization, and scalable infrastructure'
  },
  {
    icon: '🔧',
    name: 'DevOps & Automation',
    description: 'CI/CD pipelines, testing automation, and deployment optimization'
  },
  {
    icon: '🎨',
    name: 'UI/UX Design',
    description: 'User-centered design, prototyping, and modern design systems'
  }
];

const certificationsData = [
  {
    icon: '☁️',
    name: 'Google Cloud Professional Data Engineer',
    organization: 'Google Cloud',
    date: '2024'
  },
  {
    icon: '📊',
    name: 'Google Data Analytics Certificate',
    organization: 'Google Career Certificates',
    date: '2023'
  },
  {
    icon: '🤖',
    name: 'Machine Learning Specialization',
    organization: 'DeepLearning.AI',
    date: '2023'
  },
  {
    icon: '⚡',
    name: 'TensorFlow Developer Certificate',
    organization: 'TensorFlow',
    date: '2023'
  }
];

const interestsData = [
  {
    icon: '🚀',
    name: 'Startup & Business Development',
    description: 'Learning how tech ideas grow into impactful businesses'
  },
  {
    icon: '📚',
    name: 'Technology Research',
    description: 'Staying updated with emerging AI trends and experimental technologies'
  },
  {
    icon: '🏃‍♂️',
    name: 'Fitness & Running',
    description: 'Maintaining physical and mental health through regular exercise'
  },
  {
    icon: '💡',
    name: 'Innovation & Strategy',
    description: 'Connecting software engineering with problem-solving at scale'
  }
];

export default function AboutPage() {
  const { theme } = useTheme();

  // Populate person data from local scraped JSON when available
  let scraped = {};
  try {
    // This file is created/updated by the helper script `scripts/populate_about_from_github.js`
    // It contains lightweight extracted fields from your GitHub README/profile and resume.
    // It is optional; About page will still work if it doesn't exist.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    scraped = require('../data/about-scraped.json');
  } catch (err) {
    scraped = {};
  }

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ghulam Mujtaba",
    url: "https://ghulammujtaba.com/about",
    image: scraped.image || "https://ghulammujtaba.com/images/portfolio-picture.png",
    jobTitle: scraped.jobTitle || "Software Engineer",
    sameAs: [
      "https://github.com/ghulam-mujtaba5",
      "https://www.linkedin.com/in/ghulamujtabaofficial",
      "https://www.instagram.com/ghulammujtabaofficial/",
    ],
    description:
      scraped.summary || "I\u2019m a Software Engineer focused on building end-to-end solutions that integrate Data Science, Machine Learning, and AI.",
    knowsAbout: skills,
    alumniOf: { "@type": "CollegeOrUniversity", name: scraped.university || "Comsats University, Lahore (BSc Software Engineering)" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "professional",
        email: "mailto:" + (scraped.email || 'ghulammujtaba1005@gmail.com'),
        telephone: scraped.phone || '03177107849',
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ghulammujtaba.com/" },
      { "@type": "ListItem", position: 2, name: "About", item: "https://ghulammujtaba.com/about" },
    ],
  };

  const themeClass = theme === "dark" ? dark.page : light.page;

  return (
    <div className={`${common.page} ${themeClass}`}>
      <SEO
        title="About — Ghulam Mujtaba"
        description="About Ghulam Mujtaba — Full Stack Developer, Data Scientist, and AI Specialist. Experience, skills, and contact information."
        url="https://ghulammujtaba.com/about"
        canonical="https://ghulammujtaba.com/about"
        jsonLd={[personJsonLd, breadcrumbJsonLd]}
      />

      <Head>
        <meta name="robots" content="index,follow" />
      </Head>

      {/* Render wrapper placeholders for navbars on both server and client.
          The NavBar components are dynamically imported with ssr:false, so
          on the server the components render nothing but these wrappers
          keep the DOM structure stable to avoid hydration mismatches. */}
      <div className="nav-desktop-wrapper">
        <NavBarDesktop />
      </div>
      <div className="show-on-mobile">
        <NavBarMobile />
      </div>
      <main className={common.container}>
        {/* Hero Section */}
        <section className={`${common.hero} ${common.fadeInUp}`} aria-labelledby="about-hero-title">
          <div className={common.heroContent}>
            <div>
              <img
                src={scraped.image ? scraped.image.replace(/^\//, '') : '/images/portfolio-picture.png'}
                alt="Ghulam Mujtaba"
                className={common.avatar}
                width={200}
                height={200}
              />
            </div>
            <div className={common.heroText}>
              <h1 id="about-hero-title" className={`${common.title} ${theme === 'dark' ? dark.title : light.title}`}>
                Ghulam Mujtaba
              </h1>
              <p className={`${common.subtitle} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                {scraped.summary || "Software Engineer focused on building end-to-end solutions that integrate Data Science, Machine Learning, and AI."}
              </p>
              
              {/* Mission Statement */}
              <div className={`${common.missionStatement} ${theme === 'dark' ? dark.missionStatement : light.missionStatement}`}>
                <p style={{ margin: 0, fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "I believe in creating technology that not only solves problems but inspires innovation. 
                  My mission is to bridge the gap between complex AI/ML concepts and practical, 
                  user-friendly applications that make a real difference."
                </p>
              </div>

              <div className={common.chips}>
                <span className={`${common.chip} ${theme === 'dark' ? dark.chip : light.chip}`}>
                  📍 {scraped.location || 'Lahore, Pakistan'}
                </span>
                <span className={`${common.chip} ${theme === 'dark' ? dark.chip : light.chip}`}>
                  🎓 {scraped.university || 'Comsats University, Lahore'}
                </span>
                <span className={`${common.chip} ${theme === 'dark' ? dark.chip : light.chip}`}>
                  💼 Available for Work
                </span>
              </div>
              
              <div className={common.socials}>
                <a className={`${common.socialLink} ${theme === 'dark' ? dark.socialLink : light.socialLink}`} 
                   href="mailto:ghulammujtaba1005@gmail.com">
                  📧 Email
                </a>
                <a className={`${common.socialLink} ${theme === 'dark' ? dark.socialLink : light.socialLink}`} 
                   href="https://github.com/ghulam-mujtaba5" target="_blank" rel="noopener noreferrer">
                  🔗 GitHub
                </a>
                <a className={`${common.socialLink} ${theme === 'dark' ? dark.socialLink : light.socialLink}`} 
                   href="https://www.linkedin.com/in/ghulamujtabaofficial" target="_blank" rel="noopener noreferrer">
                  💼 LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Journey (moved up for prominence) */}
        <section className={`${common.section} ${common.fadeInUp} ${common.prominentSection}`} aria-labelledby="experience-heading">
          <div className={common.sectionHeader}>
            <span className={common.sectionIcon}>💼</span>
            <h2 id="experience-heading" className={`${common.sectionTitle} ${common.prominentTitle}`}>Professional Journey</h2>
          </div>
          <div className={common.timeline}>
            {experience.map((e, idx) => (
              <div className={`${common.timelineItem} ${common.timelineItemFeatured}`} key={idx}>
                <div className={common.contentCol}>
                  <h3 className={common.itemTitle}>{e.role}</h3>
                  <p className={`${common.itemMeta} ${theme === 'dark' ? dark.itemMeta : light.itemMeta}`}>
                    {e.company} • <time>{e.start}</time> — <time>{e.end}</time>
                  </p>
                  <p className={`${common.itemDesc} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                    {e.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education (moved up under hero) */}
        <section className={`${common.section} ${common.fadeInUp} ${common.prominentSection}`} aria-labelledby="education-heading">
          <div className={common.sectionHeader}>
            <span className={common.sectionIcon}>🎓</span>
            <h2 id="education-heading" className={`${common.sectionTitle} ${common.prominentTitle}`}>Education</h2>
          </div>
          <div className={`${common.card} ${theme === 'dark' ? dark.card : light.card}`}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 600 }}>
              Comsats University Islamabad, Lahore Campus
            </h3>
            <p className={`${common.subtitle} ${theme === 'dark' ? dark.subtitle : light.subtitle}`} style={{ margin: 0 }}>
              Bachelor of Science in Software Engineering
            </p>
            <p className={`${common.itemMeta} ${theme === 'dark' ? dark.itemMeta : light.itemMeta}`} style={{ marginTop: 8 }}>
              Expected Graduation: June 2026
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className={`${common.section} ${common.fadeInLeft}`} aria-labelledby="stats-heading">
          <div className={common.sectionHeader}>
            <span className={common.sectionIcon}>📊</span>
            <h2 id="stats-heading" className={common.sectionTitle}>Quick Stats</h2>
          </div>
          <div className={common.statsGrid}>
            <div className={`${common.card} ${common.statCard} ${common.cardHover}`}>
              <div className={`${common.kpiValue} ${theme === 'dark' ? dark.kpiValue : light.kpiValue}`}>3+</div>
              <div className={`${common.kpiLabel} ${theme === 'dark' ? dark.kpiLabel : light.kpiLabel}`}>Years with AI/ML</div>
            </div>
            <div className={`${common.card} ${common.statCard} ${common.cardHover}`}>
              <div className={`${common.kpiValue} ${theme === 'dark' ? dark.kpiValue : light.kpiValue}`}>15+</div>
              <div className={`${common.kpiLabel} ${theme === 'dark' ? dark.kpiLabel : light.kpiLabel}`}>Projects Delivered</div>
            </div>
            <div className={`${common.card} ${common.statCard} ${common.cardHover}`}>
              <div className={`${common.kpiValue} ${theme === 'dark' ? dark.kpiValue : light.kpiValue}`}>5</div>
              <div className={`${common.kpiLabel} ${theme === 'dark' ? dark.kpiLabel : light.kpiLabel}`}>Google Certifications</div>
            </div>
            <div className={`${common.card} ${common.statCard} ${common.cardHover}`}>
              <div className={`${common.kpiValue} ${theme === 'dark' ? dark.kpiValue : light.kpiValue}`}>∞</div>
              <div className={`${common.kpiLabel} ${theme === 'dark' ? dark.kpiLabel : light.kpiLabel}`}>Curiosity & Growth</div>
            </div>
          </div>
        </section>

        {/* Fun Facts */}
        <section className={`${common.section} ${common.fadeInRight}`} aria-labelledby="facts-heading">
          <div className={common.sectionHeader}>
            <span className={common.sectionIcon}>✨</span>
            <h2 id="facts-heading" className={common.sectionTitle}>What Drives Me</h2>
          </div>
          <div className={common.funFactsGrid}>
            {funFacts.map((fact, index) => (
              <div key={index} className={`${common.card} ${common.funFactCard} ${common.cardHover}`}>
                <span className={`${common.funFactIcon} ${theme === 'dark' ? dark.funFactIcon : light.funFactIcon}`}>
                  {fact.icon}
                </span>
                <h3 className={common.funFactTitle}>{fact.title}</h3>
                <p className={`${common.funFactText} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                  {fact.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How I Work section removed per user request */}

        <section className={`${common.section} ${common.fadeInLeft}`} aria-labelledby="impact-heading">
          <div className={common.sectionHeader}>
            <span className={common.sectionIcon}>📈</span>
            <h2 id="impact-heading" className={common.sectionTitle}>Impact Stories</h2>
          </div>
          <div className={common.achievementsGrid}>
            <div className={`${common.card} ${common.achievementCard} ${common.cardHover}`}>
              <h3 className={common.achievementTitle}>Improved LLM Relevance</h3>
              <p className={`${common.achievementDesc} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                Evaluated and refined large language model outputs across multiple projects, increasing search relevance and user satisfaction metrics.
              </p>
            </div>
            <div className={`${common.card} ${common.achievementCard} ${common.cardHover}`}>
              <h3 className={common.achievementTitle}>End-to-end Platform</h3>
              <p className={`${common.achievementDesc} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                Built full-stack solutions combining React frontends with ML-powered backends, delivering analytics dashboards and automation features.
              </p>
            </div>
            <div className={`${common.card} ${common.achievementCard} ${common.cardHover}`}>
              <h3 className={common.achievementTitle}>Certifications to Practice</h3>
              <p className={`${common.achievementDesc} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                Earned industry certifications and applied learnings to production projects to improve deployment and scaling practices.
              </p>
            </div>
          </div>
        </section>
        <section className={`${common.section} ${common.fadeInUp}`} aria-labelledby="aboutme-heading">
          <div className={common.sectionHeader}>
            <span className={common.sectionIcon}>👨‍💻</span>
            <h2 id="aboutme-heading" className={common.sectionTitle}>About Me</h2>
          </div>
          <div className={`${common.card} ${theme === 'dark' ? dark.card : light.card}`}>
            <AboutMeSection />
          </div>
        </section>

        {/* Professional Journey and Education moved up after hero - removing duplicates */}

        {/* Projects removed from About page to avoid duplication — see /projects for full listing */}

        {/* Skills & Certifications removed — replaced with focused How I Work & Impact Stories */}

        {/* Interests */}
        <section className={`${common.section} ${common.fadeInRight}`} aria-labelledby="interests-heading">
          <div className={common.sectionHeader}>
            <span className={common.sectionIcon}>🎯</span>
            <h2 id="interests-heading" className={common.sectionTitle}>When I'm Not Coding</h2>
          </div>
          <div className={common.interestsGrid}>
            {interestsData.map((interest, idx) => (
              <div key={idx} className={`${common.interestCard} ${theme === 'dark' ? dark.interestCard : light.interestCard}`}>
                <span className={common.interestIcon}>{interest.icon}</span>
                <h3 className={common.interestTitle}>{interest.name}</h3>
                <p className={`${common.interestDesc} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                  {interest.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className={`${common.section} ${common.fadeInUp} ${common.ctaSection}`} aria-labelledby="cta-heading">
          <div className={`${common.ctaCard} ${theme === 'dark' ? dark.ctaCard : light.ctaCard}`}>
            <h2 id="cta-heading" className={common.ctaTitle}>Start a project</h2>
            <p className={`${common.ctaDescription} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
              Have a project or want to collaborate? Let's talk.
            </p>
            <div className={common.ctaButtons}>
              <Link href="/contact" className={`${common.ctaButton} ${common.ctaPrimary} ${theme === 'dark' ? dark.ctaPrimary : light.ctaPrimary}`}>
                Contact
              </Link>
              <Link href="/projects" className={`${common.ctaButton} ${common.ctaSecondary} ${theme === 'dark' ? dark.ctaSecondary : light.ctaSecondary}`}>
                Portfolio
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
