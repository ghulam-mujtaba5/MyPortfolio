import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import SEO, {
  personSchema,
  profilePageSchema,
  breadcrumbSchema,
  faqSchema,
  speakableSchema,
} from "../components/SEO";
import AboutMeSection from "../components/AboutMe/AboutMeSectionLight";
import common from "../components/AboutPage/AboutPageCommon.module.css";
import light from "../components/AboutPage/AboutPageLight.module.css";
import dark from "../components/AboutPage/AboutPageDark.module.css";
import { useTheme } from "../context/ThemeContext";
import ScrollReveal from "../components/AnimatedUI/ScrollReveal";
import { Tooltip } from "../components/Popover/Popover";
import { useParallax, useScrollAnimation, useScrollTrigger } from "../hooks/useScrollAnimation";
import { useViewTransition } from "../hooks/useViewTransition";
import { 
  Sparkles, Target, Zap, TrendingUp, 
  Trophy, Lightbulb, Award, 
  Code2, Brain, BarChart3, Cloud, Cpu, Palette,
  Briefcase, GraduationCap, MapPin, Mail, Github, Linkedin,
  Heart, BookOpen, Rocket, Star, Users, ArrowRight, 
  CircleCheck, Flame, Globe, Terminal, Database, Shield
} from 'lucide-react';

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
    icon: <Sparkles size={28} strokeWidth={1.5} />,
    title: 'Innovation Mindset',
    text: 'Always exploring cutting-edge technologies and implementing creative solutions to complex problems.'
  },
  {
    icon: <Target size={28} strokeWidth={1.5} />,
    title: 'Problem Solver',
    text: 'Passionate about turning challenging requirements into elegant, user-friendly applications.'
  },
  {
    icon: <Flame size={28} strokeWidth={1.5} />,
    title: 'Fast Learner',
    text: 'Quickly adapts to new frameworks and technologies, staying ahead of industry trends.'
  },
  {
    icon: <TrendingUp size={28} strokeWidth={1.5} />,
    title: 'Growth Oriented',
    text: 'Continuously improving skills through hands-on projects and learning from the developer community.'
  }
];

const achievements = [
  {
    icon: <Trophy size={32} strokeWidth={1.5} />,
    title: 'AI Model Excellence',
    description: 'Successfully evaluated and improved LLM accuracy across multiple Appen projects, contributing to enhanced search relevance.'
  },
  {
    icon: <Lightbulb size={32} strokeWidth={1.5} />,
    title: 'Full-Stack Innovation',
    description: 'Developed diverse applications from desktop billing software to mobile financial analytics platforms.'
  },
  {
    icon: <Award size={32} strokeWidth={1.5} />,
    title: 'Certified Professional',
    description: 'Earned 5 Google certifications and Meta Front-End Developer certification, demonstrating expertise across multiple domains.'
  }
];

const skillsData = [
  {
    icon: <Code2 size={32} strokeWidth={1.5} />,
    name: 'Full-Stack Development',
    description: 'Modern web applications with React, Next.js, Node.js, and cloud platforms'
  },
  {
    icon: <Brain size={32} strokeWidth={1.5} />,
    name: 'AI & Machine Learning',
    description: 'Deep learning models, computer vision, NLP, and AI-powered solutions'
  },
  {
    icon: <BarChart3 size={32} strokeWidth={1.5} />,
    name: 'Data Science',
    description: 'Statistical analysis, data visualization, and predictive modeling'
  },
  {
    icon: <Cloud size={32} strokeWidth={1.5} />,
    name: 'Cloud Architecture',
    description: 'AWS, Google Cloud, containerization, and scalable infrastructure'
  },
  {
    icon: <Terminal size={32} strokeWidth={1.5} />,
    name: 'DevOps & Automation',
    description: 'CI/CD pipelines, testing automation, and deployment optimization'
  },
  {
    icon: <Palette size={32} strokeWidth={1.5} />,
    name: 'UI/UX Design',
    description: 'User-centered design, prototyping, and modern design systems'
  }
];

const certificationsData = [
  {
    icon: <Cloud size={28} strokeWidth={1.5} />,
    name: 'Google Cloud Professional Data Engineer',
    organization: 'Google Cloud',
    date: '2024'
  },
  {
    icon: <BarChart3 size={28} strokeWidth={1.5} />,
    name: 'Google Data Analytics Certificate',
    organization: 'Google Career Certificates',
    date: '2023'
  },
  {
    icon: <Brain size={28} strokeWidth={1.5} />,
    name: 'Machine Learning Specialization',
    organization: 'DeepLearning.AI',
    date: '2023'
  },
  {
    icon: <Cpu size={28} strokeWidth={1.5} />,
    name: 'TensorFlow Developer Certificate',
    organization: 'TensorFlow',
    date: '2023'
  }
];

const interestsData = [
  {
    icon: <Rocket size={28} strokeWidth={1.5} />,
    name: 'Startup & Business Development',
    description: 'Learning how tech ideas grow into impactful businesses'
  },
  {
    icon: <BookOpen size={28} strokeWidth={1.5} />,
    name: 'Technology Research',
    description: 'Staying updated with emerging AI trends and experimental technologies'
  },
  {
    icon: <Heart size={28} strokeWidth={1.5} />,
    name: 'Fitness & Running',
    description: 'Maintaining physical and mental health through regular exercise'
  },
  {
    icon: <Globe size={28} strokeWidth={1.5} />,
    name: 'Innovation & Strategy',
    description: 'Connecting software engineering with problem-solving at scale'
  }
];

export default function AboutPage() {
  const { theme } = useTheme();
  const { ref: heroRef, style: heroStyle } = useParallax(0.1);
  const { startTransition } = useViewTransition();
  const { ref: statsRef, hasEntered: statsVisible } = useScrollTrigger({ threshold: 0.2 });
  const { ref: factsRef, hasEntered: factsVisible } = useScrollTrigger({ threshold: 0.2 });
  const { ref: achievementsRef, hasEntered: achievementsVisible } = useScrollTrigger({ threshold: 0.2 });
  const { ref: interestsRef, hasEntered: interestsVisible } = useScrollTrigger({ threshold: 0.2 });

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

  // --- Structured Data (JSON-LD) using centralized schema helpers ---
  const aboutPersonSchema = personSchema();
  const aboutProfilePageSchema = profilePageSchema();
  const aboutBreadcrumbSchema = breadcrumbSchema([
    { name: "Home", url: "https://ghulammujtaba.com/" },
    { name: "About", url: "https://ghulammujtaba.com/about" },
  ]);
  const aboutFaqSchema = faqSchema([
    {
      question: "Who is Ghulam Mujtaba?",
      answer:
        "Ghulam Mujtaba is a Full Stack Developer, Data Scientist, and AI Specialist based in Lahore, Pakistan. He builds end-to-end solutions integrating Data Science, Machine Learning, and AI.",
    },
    {
      question: "What technologies does Ghulam Mujtaba work with?",
      answer:
        "Ghulam Mujtaba is proficient in Java, Python, JavaScript, React, Next.js, React Native, Electron.js, Spring, MongoDB, Supabase, Azure, and various Data Science/ML frameworks.",
    },
    {
      question: "What certifications does Ghulam Mujtaba hold?",
      answer:
        "He holds several professional certifications including Meta Front-End Developer, Google UX Design, Google Data Analytics, Google Project Management, and Google Cybersecurity certificates.",
    },
    {
      question: "Where did Ghulam Mujtaba study?",
      answer:
        "He is pursuing a Bachelor of Science in Software Engineering at COMSATS University Islamabad, Lahore Campus, with an expected graduation in June 2026.",
    },
    {
      question: "Is Ghulam Mujtaba available for hire?",
      answer:
        "Yes, Ghulam Mujtaba is currently available for work and open to new opportunities, collaborations, and freelance projects. You can contact him via his portfolio website.",
    },
  ]);
  const aboutSpeakableSchema = speakableSchema({
    url: "https://ghulammujtaba.com/about",
    cssSelectors: ["#about-hero-title", "#aboutme-heading"],
  });

  const themeClass = theme === "dark" ? dark.page : light.page;

  return (
    <div className={`${common.page} ${themeClass}`}>
      <SEO
        title="About Ghulam Mujtaba | Full Stack Developer, Data Scientist & AI Specialist"
        description="Learn about Ghulam Mujtaba — Full Stack Developer, Data Scientist, and AI Specialist with 3+ years of experience. Skills in React, Next.js, Python, ML, and cloud platforms. Available for hire."
        url="https://ghulammujtaba.com/about"
        canonical="https://ghulammujtaba.com/about"
        image="https://ghulammujtaba.com/images/portfolio-picture.png"
        imageWidth={1200}
        imageHeight={630}
        imageAlt="Ghulam Mujtaba — Full Stack Developer & AI Specialist"
        author="Ghulam Mujtaba"
        jsonLd={[
          aboutPersonSchema,
          aboutProfilePageSchema,
          aboutBreadcrumbSchema,
          aboutFaqSchema,
          aboutSpeakableSchema,
        ]}
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
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={`${common.hero}`} aria-labelledby="about-hero-title">
            <div className={common.heroContent}>
              <div ref={heroRef} style={heroStyle}>
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
                    <MapPin size={16} strokeWidth={2} />
                    {scraped.location || 'Lahore, Pakistan'}
                  </span>
                  <span className={`${common.chip} ${theme === 'dark' ? dark.chip : light.chip}`}>
                    <GraduationCap size={16} strokeWidth={2} />
                    {scraped.university || 'Comsats University, Lahore'}
                  </span>
                  <Tooltip 
                    content="I am currently open to new opportunities and collaborations." 
                    placement="top"
                    trigger={
                      <span className={`${common.chip} ${theme === 'dark' ? dark.chip : light.chip}`}>
                        <CircleCheck size={16} strokeWidth={2} />
                        Available for Work
                      </span>
                    }
                  />
                </div>
                
                <div className={common.socials}>
                  <a className={`${common.socialLink} ${theme === 'dark' ? dark.socialLink : light.socialLink}`} 
                     href="mailto:ghulammujtaba1005@gmail.com"
                     aria-label="Send email">
                    <Mail size={18} strokeWidth={2} /> Email
                  </a>
                  <a className={`${common.socialLink} ${theme === 'dark' ? dark.socialLink : light.socialLink}`} 
                     href="https://github.com/ghulam-mujtaba5" target="_blank" rel="noopener noreferrer"
                     aria-label="GitHub Profile">
                    <Github size={18} strokeWidth={2} /> GitHub
                  </a>
                  <a className={`${common.socialLink} ${theme === 'dark' ? dark.socialLink : light.socialLink}`} 
                     href="https://www.linkedin.com/in/ghulamujtabaofficial" target="_blank" rel="noopener noreferrer"
                     aria-label="LinkedIn Profile">
                    <Linkedin size={18} strokeWidth={2} /> LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Professional Journey (moved up for prominence) */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={`${common.section} ${common.prominentSection}`} aria-labelledby="experience-heading">
            <div className={common.sectionHeader}>
              <Briefcase className={common.sectionIcon} />
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
        </ScrollReveal>

        {/* Education (moved up under hero) */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={`${common.section} ${common.prominentSection}`} aria-labelledby="education-heading">
            <div className={common.sectionHeader}>
              <GraduationCap className={common.sectionIcon} />
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
        </ScrollReveal>

        {/* Quick Stats */}
        <ScrollReveal animation="fadeInLeft" width="100%">
          <section className={`${common.section}`} aria-labelledby="stats-heading">
            <div className={common.sectionHeader}>
              <BarChart3 className={common.sectionIcon} strokeWidth={1.5} />
              <h2 id="stats-heading" className={common.sectionTitle}>Quick Stats</h2>
            </div>
            <div ref={statsRef} className={common.statsGrid}>
              {[
                { value: '3+', label: 'Years with AI/ML' },
                { value: '15+', label: 'Projects Delivered' },
                { value: '5', label: 'Google Certifications' },
                { value: '∞', label: 'Curiosity & Growth' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={`${common.card} ${common.statCard} ${common.cardHover}`}
                  style={{
                    opacity: statsVisible ? 1 : 0,
                    transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`
                  }}
                >
                  <div className={`${common.kpiValue} ${theme === 'dark' ? dark.kpiValue : light.kpiValue}`}>{stat.value}</div>
                  <div className={`${common.kpiLabel} ${theme === 'dark' ? dark.kpiLabel : light.kpiLabel}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Fun Facts */}
        <ScrollReveal animation="fadeInRight" width="100%">
          <section className={`${common.section}`} aria-labelledby="facts-heading">
            <div className={common.sectionHeader}>
              <Zap className={common.sectionIcon} strokeWidth={1.5} />
              <h2 id="facts-heading" className={common.sectionTitle}>What Drives Me</h2>
            </div>
            <div ref={factsRef} className={common.funFactsGrid}>
              {funFacts.map((fact, index) => (
                <div 
                  key={index} 
                  className={`${common.card} ${common.funFactCard} ${common.cardHover}`}
                  style={{
                    opacity: factsVisible ? 1 : 0,
                    transform: factsVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`
                  }}
                >
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
        </ScrollReveal>

        {/* How I Work section removed per user request */}

        <ScrollReveal animation="fadeInLeft" width="100%">
          <section className={`${common.section}`} aria-labelledby="impact-heading">
            <div className={common.sectionHeader}>
              <Star className={common.sectionIcon} strokeWidth={1.5} />
              <h2 id="impact-heading" className={common.sectionTitle}>Impact Stories</h2>
            </div>
            <div ref={achievementsRef} className={common.achievementsGrid}>
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`${common.card} ${common.achievementCard} ${common.cardHover}`}
                  style={{
                    opacity: achievementsVisible ? 1 : 0,
                    transform: achievementsVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`
                  }}
                >
                  <span className={`${common.achievementIcon} ${theme === 'dark' ? dark.achievementIcon : light.achievementIcon}`}>
                    {achievement.icon}
                  </span>
                  <h3 className={common.achievementTitle}>{achievement.title}</h3>
                  <p className={`${common.achievementDesc} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
        
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={`${common.section}`} aria-labelledby="aboutme-heading">
            <div className={common.sectionHeader}>
              <Users className={common.sectionIcon} strokeWidth={1.5} />
              <h2 id="aboutme-heading" className={common.sectionTitle}>About Me</h2>
            </div>
            <div className={`${common.card} ${theme === 'dark' ? dark.card : light.card}`}>
              <AboutMeSection showTitle={false} />
            </div>
          </section>
        </ScrollReveal>

        {/* Professional Journey and Education moved up after hero - removing duplicates */}

        {/* Projects removed from About page to avoid duplication — see /projects for full listing */}

        {/* Skills & Certifications removed — replaced with focused How I Work & Impact Stories */}

        {/* Interests */}
        <ScrollReveal animation="fadeInRight" width="100%">
          <section className={`${common.section}`} aria-labelledby="interests-heading">
            <div className={common.sectionHeader}>
              <Heart className={common.sectionIcon} strokeWidth={1.5} />
              <h2 id="interests-heading" className={common.sectionTitle}>When I'm Not Coding</h2>
            </div>
            <div ref={interestsRef} className={common.interestsGrid}>
              {interestsData.map((interest, idx) => (
                <div 
                  key={idx} 
                  className={`${common.interestCard} ${theme === 'dark' ? dark.interestCard : light.interestCard}`}
                  style={{
                    opacity: interestsVisible ? 1 : 0,
                    transform: interestsVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 100}ms`
                  }}
                >
                  <span className={`${common.interestIcon} ${theme === 'dark' ? dark.interestIcon : light.interestIcon}`}>
                    {interest.icon}
                  </span>
                  <h3 className={common.interestTitle}>{interest.name}</h3>
                  <p className={`${common.interestDesc} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                    {interest.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Call to action */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={`${common.section} ${common.ctaSection}`} aria-labelledby="cta-heading">
            <div className={`${common.ctaCard} ${theme === 'dark' ? dark.ctaCard : light.ctaCard}`}>
              <h2 id="cta-heading" className={common.ctaTitle}>Let's Build Something Amazing</h2>
              <p className={`${common.ctaDescription} ${theme === 'dark' ? dark.subtitle : light.subtitle}`}>
                Have a project in mind or want to collaborate? I'm always excited to work on innovative solutions.
              </p>
              <div className={common.ctaButtons}>
                <Link 
                  href="/contact" 
                  className={`${common.ctaButton} ${common.ctaPrimary} ${theme === 'dark' ? dark.ctaPrimary : light.ctaPrimary}`}
                  onClick={(e) => {
                    if (document.startViewTransition) {
                      e.preventDefault();
                      startTransition(() => {
                        window.location.href = '/contact';
                      });
                    }
                  }}
                >
                  <Mail size={18} strokeWidth={2} />
                  Get In Touch
                </Link>
                <Link 
                  href="/projects" 
                  className={`${common.ctaButton} ${common.ctaSecondary} ${theme === 'dark' ? dark.ctaSecondary : light.ctaSecondary}`}
                  onClick={(e) => {
                    if (document.startViewTransition) {
                      e.preventDefault();
                      startTransition(() => {
                        window.location.href = '/projects';
                      });
                    }
                  }}
                >
                  View Portfolio
                  <ArrowRight size={18} strokeWidth={2} />
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <Footer />
      </main>
    </div>
  );
}
