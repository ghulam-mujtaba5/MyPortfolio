import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import SEO, {
  personSchema,
  profilePageSchema,
  breadcrumbSchema,
  faqSchema,
  speakableSchema,
} from "../components/SEO";
import common from "../components/AboutPage/AboutPageCommon.module.css";
import light from "../components/AboutPage/AboutPageLight.module.css";
import dark from "../components/AboutPage/AboutPageDark.module.css";
import { useTheme } from "../context/ThemeContext";
import ScrollReveal from "../components/AnimatedUI/ScrollReveal";
import { Tooltip } from "../components/Popover/Popover";
import { useScrollTrigger } from "../hooks/useScrollAnimation";
import { useViewTransition } from "../hooks/useViewTransition";
import {
  Code2, Brain, Palette,
  Briefcase, GraduationCap, MapPin, Mail, Github, Linkedin,
  ArrowRight, Rocket, Building2, Layers,
} from "lucide-react";

const NavBarDesktop = dynamic(() => import("../components/NavBar_Desktop/nav-bar"), { ssr: false });
const NavBarMobile = dynamic(() => import("../components/NavBar_Mobile/NavBar-mobile"), { ssr: false });
const Footer = dynamic(() => import("../components/Footer/Footer"), { ssr: false });

/* -------------------------------------------------------
   DATA
   ------------------------------------------------------- */

const expertise = [
  {
    icon: <Code2 size={24} strokeWidth={1.8} />,
    title: "Full-Stack Engineering",
    description:
      "End-to-end applications with React, Next.js, Java, Spring, and cross-platform apps with React Native & Electron.js.",
  },
  {
    icon: <Brain size={24} strokeWidth={1.8} />,
    title: "AI & Data Science",
    description:
      "ML model evaluation, data annotation, NLP, and turning raw data into actionable insights that drive decisions.",
  },
  {
    icon: <Palette size={24} strokeWidth={1.8} />,
    title: "Design & User Experience",
    description:
      "User-centered interfaces, design systems, and experiences that feel intuitive, polished, and genuinely enjoyable.",
  },
];

const ventures = [
  {
    icon: <Building2 size={20} strokeWidth={1.8} />,
    name: "MegiCode",
    role: "Founder",
    description:
      "A software company focused on building high-quality digital products and providing development services for clients and businesses.",
    link: "/projects/megicode-software-company",
  },
  {
    icon: <Layers size={20} strokeWidth={1.8} />,
    name: "CampusAxis",
    role: "Founder",
    description:
      "A university portal platform designed to streamline academic operations, student management, and institutional workflows.",
    link: "/projects/campusaxis-university-portal",
  },
];

const timeline = [
  {
    type: "venture",
    title: "Founded MegiCode & CampusAxis",
    org: "Entrepreneurship",
    period: "2024 \u2014 Present",
    description:
      "Launched two ventures — MegiCode as a software company, and CampusAxis as a university portal platform — handling everything from product vision and architecture to team coordination and delivery.",
  },
  {
    type: "work",
    title: "AI Data Annotator & Model Evaluator",
    org: "Appen",
    period: "2022 \u2014 2025",
    description:
      "Evaluated and improved AI-generated content across Uolo V2 & P, Fireweed, Plumeria V2, and Emerald projects \u2014 enhancing LLM accuracy and search relevance at scale.",
  },
  {
    type: "education",
    title: "BSc Software Engineering",
    org: "COMSATS University Islamabad, Lahore",
    period: "2022 \u2014 2026 (Expected)",
    description:
      "Comprehensive study in software architecture, algorithms, database systems, artificial intelligence, and human-computer interaction.",
  },
];

const stats = [
  { value: "2", label: "Companies Founded" },
  { value: "3+", label: "Years Experience" },
  { value: "15+", label: "Projects Shipped" },
];

/* -------------------------------------------------------
   PAGE COMPONENT
   ------------------------------------------------------- */

export default function AboutPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { startTransition } = useViewTransition();
  const { ref: statsRef, hasEntered: statsVisible } = useScrollTrigger({ threshold: 0.3 });

  let scraped = {};
  try {
    // eslint-disable-next-line global-require
    scraped = require("../data/about-scraped.json");
  } catch (err) {
    scraped = {};
  }

  /* --- JSON-LD structured data (SEO) --- */
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
    cssSelectors: ["#about-hero-title", "#about-story"],
  });

  const t = theme === "dark" ? dark : light;

  return (
    <div className={`${common.page} ${t.page}`}>
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

      <div className="nav-desktop-wrapper">
        <NavBarDesktop />
      </div>
      <div className="show-on-mobile">
        <NavBarMobile />
      </div>

      <main className={common.main}>
        {/* ==================== HERO ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.hero} aria-labelledby="about-hero-title">
            <img
              src={scraped.image ? scraped.image.replace(/^\//, "") : "/images/portfolio-picture.png"}
              alt="Ghulam Mujtaba"
              className={`${common.avatar} ${t.avatar}`}
              width={150}
              height={150}
            />
            <h1 id="about-hero-title" className={`${common.heroName} ${t.heroName}`}>
              Ghulam Mujtaba
            </h1>
            <span className={`${common.heroAccent} ${t.heroAccent}`} aria-hidden="true" />
            <p className={`${common.heroRole} ${t.heroRole}`}>
              Software Engineer &middot; AI Specialist &middot; Data Scientist
            </p>
            <div className={common.heroPills}>
              <span className={`${common.locationPill} ${t.locationPill}`}>
                <MapPin size={14} /> {scraped.location || "Lahore, Pakistan"}
              </span>
              <Tooltip
                content="Open to new opportunities and collaborations"
                placement="top"
                trigger={
                  <span className={`${common.statusPill} ${t.statusPill}`}>
                    <span className={common.statusDot} />
                    Available for Work
                  </span>
                }
              />
            </div>
            <div className={common.heroLinks}>
              <a className={`${common.heroLink} ${t.heroLink}`} href="mailto:ghulammujtaba1005@gmail.com" aria-label="Send email">
                <Mail size={18} />
              </a>
              <a className={`${common.heroLink} ${t.heroLink}`} href="https://github.com/ghulam-mujtaba5" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
                <Github size={18} />
              </a>
              <a className={`${common.heroLink} ${t.heroLink}`} href="https://www.linkedin.com/in/ghulamujtabaofficial" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
                <Linkedin size={18} />
              </a>
            </div>
          </section>
        </ScrollReveal>

        {/* ==================== MY STORY ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.storySection} id="about-story" aria-labelledby="story-heading">
            <h2 className={`${common.sectionTitle} ${t.sectionTitle}`} id="story-heading">
              My Story
            </h2>
            <div className={`${common.storyBody} ${t.storyBody}`}>
              <p>
                I am a software engineer from Lahore, Pakistan, currently in my final year of Software
                Engineering at COMSATS University. What started as curiosity about how apps are built
                has grown into founding two companies and shipping products used by real people.
              </p>
              <p>
                I started MegiCode as a software company to build digital products for clients, and
                CampusAxis to solve real problems I saw in how universities manage their operations.
                Running these alongside my degree taught me more about product thinking, deadlines,
                and user needs than any classroom could.
              </p>
              <p>
                In parallel, I spent three years at Appen evaluating and improving large language
                models &mdash; work that gave me a hands-on understanding of how AI actually works
                under the hood, not just how to use it. That experience shapes how I approach every
                project: I care about what happens after the code ships.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* ==================== WHAT I'M BUILDING ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.section} aria-labelledby="ventures-heading">
            <h2 className={`${common.sectionTitle} ${t.sectionTitle}`} id="ventures-heading">
              What I&rsquo;m Building
            </h2>
            <div className={common.venturesGrid}>
              {ventures.map((v, i) => (
                <Link
                  key={i}
                  href={v.link}
                  className={`${common.ventureCard} ${t.ventureCard}`}
                  onClick={(e) => {
                    if (document.startViewTransition) {
                      e.preventDefault();
                      startTransition(() => router.push(v.link));
                    }
                  }}
                >
                  <div className={common.ventureHeader}>
                    <span className={`${common.ventureIcon} ${t.ventureIcon}`}>{v.icon}</span>
                    <div>
                      <h3 className={common.ventureName}>{v.name}</h3>
                      <span className={`${common.ventureRole} ${t.ventureRole}`}>{v.role}</span>
                    </div>
                  </div>
                  <p className={`${common.ventureDesc} ${t.ventureDesc}`}>{v.description}</p>
                  <span className={`${common.ventureLink} ${t.ventureLink}`}>
                    View Project <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ==================== WHAT I DO ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.section} aria-labelledby="expertise-heading">
            <h2 className={`${common.sectionTitle} ${t.sectionTitle}`} id="expertise-heading">
              What I Do
            </h2>
            <div className={common.expertiseGrid}>
              {expertise.map((item, i) => (
                <div key={i} className={`${common.expertiseCard} ${t.expertiseCard}`}>
                  <span className={`${common.expertiseIcon} ${t.expertiseIcon}`}>{item.icon}</span>
                  <h3 className={common.expertiseTitle}>{item.title}</h3>
                  <p className={`${common.expertiseDesc} ${t.expertiseDesc}`}>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ==================== JOURNEY ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.section} aria-labelledby="journey-heading">
            <h2 className={`${common.sectionTitle} ${t.sectionTitle}`} id="journey-heading">
              My Journey
            </h2>
            <div className={common.timeline}>
              {timeline.map((entry, i) => (
                <div key={i} className={`${common.timelineEntry} ${t.timelineEntry}`}>
                  <div className={`${common.timelineDot} ${t.timelineDot}`}>
                    {entry.type === "work" ? (
                      <Briefcase size={14} />
                    ) : entry.type === "venture" ? (
                      <Rocket size={14} />
                    ) : (
                      <GraduationCap size={14} />
                    )}
                  </div>
                  <div className={common.timelineBody}>
                    <h3 className={common.timelineTitle}>{entry.title}</h3>
                    <p className={`${common.timelineMeta} ${t.timelineMeta}`}>
                      {entry.org} &middot; {entry.period}
                    </p>
                    <p className={`${common.timelineDesc} ${t.timelineDesc}`}>{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ==================== BY THE NUMBERS ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <div
            ref={statsRef}
            className={`${common.statStrip} ${t.statStrip}`}
            role="list"
            aria-label="Key statistics"
            style={{
              opacity: statsVisible ? 1 : 0,
              transform: statsVisible ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className={`${common.statDivider} ${t.statDivider}`} aria-hidden="true" />}
                <div className={common.statItem} role="listitem">
                  <span className={`${common.statValue} ${t.statValue}`}>{s.value}</span>
                  <span className={`${common.statLabel} ${t.statLabel}`}>{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </ScrollReveal>

        {/* ==================== CTA ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={`${common.ctaSection} ${t.ctaSection}`} aria-labelledby="cta-heading">
            <h2 id="cta-heading" className={`${common.ctaTitle} ${t.ctaTitle}`}>
              Let&rsquo;s build something together.
            </h2>
            <p className={`${common.ctaDesc} ${t.ctaDesc}`}>
              Got a project, an idea, or just want to say hello? I&rsquo;d love to hear from you.
            </p>
            <div className={common.ctaActions}>
              <Link
                href="/contact"
                className={`${common.ctaBtn} ${common.ctaPrimary} ${t.ctaPrimary}`}
                onClick={(e) => {
                  if (document.startViewTransition) {
                    e.preventDefault();
                    startTransition(() => router.push("/contact"));
                  }
                }}
              >
                <Mail size={18} /> Get In Touch
              </Link>
              <Link
                href="/projects"
                className={`${common.ctaBtn} ${common.ctaSecondary} ${t.ctaSecondary}`}
                onClick={(e) => {
                  if (document.startViewTransition) {
                    e.preventDefault();
                    startTransition(() => router.push("/projects"));
                  }
                }}
              >
                View My Work <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        </ScrollReveal>

        <Footer />
      </main>
    </div>
  );
}
