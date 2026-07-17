import React from "react";
import dynamic from "next/dynamic";
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
  MapPin, Mail, Github, Linkedin,
  ArrowRight,
} from "lucide-react";
import { MAIN_SECTIONS } from "../constants/navigation";
import ThemeToggleIcon from "../components/Icon/gmicon";
import FounderJourney from "../components/Journey/FounderJourney";

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
    name: "Megicode",
    role: "Founder · Software company",
    description:
      "A software company shipping digital products for clients and businesses — web apps, AI solutions, and business platforms, from scope to production.",
    link: "https://www.megicode.com",
    logoDark: "/megicode-logo-square-darkscreen.png",
    logoLight: "/megicode-logo-square-lightscreen.png",
    external: true,
  },
  {
    name: "CampusAxis",
    role: "Founder & Product Lead · students across 260+ universities",
    description:
      "An academic platform built from my own student pain — past papers, GPA/CGPA tools, merit calculators, and faculty insights for Pakistani universities.",
    link: "/projects/campusaxis-university-portal",
    logo: "/campusaxis-logo.png",
  },
  {
    name: "MegiLance",
    role: "Founder · AI + blockchain platform",
    description:
      "An AI-powered freelancing platform built with Next.js and FastAPI — smart job matching, AI pricing, blockchain escrow payments, and fraud detection.",
    link: "https://megilance.site",
    logoDark: "/megilance-logo-on-dark.png",
    logoLight: "/megilance-logo-on-light.png",
    external: true,
  },
];

const timeline = [
  {
    title: "Founder",
    org: "MegiCode",
    type: "work",
    period: "2023 \u2014 Present",
    logoDark: "/megicode-logo-square-darkscreen.png",
    logoLight: "/megicode-logo-square-lightscreen.png",
    description:
      "Founded a software company focused on building high-quality digital products and providing development services for clients and businesses.",
    link: "https://www.megicode.com",
  },
  {
    title: "AI Data Annotator / LLM Evaluator",
    org: "Appen",
    type: "work",
    period: "Oct 2022 \u2014 Jul 2025 \u00b7 2 yrs 10 mos",
    logo: "/appen-logo.png",
    description:
      "Contributed to multiple CrowdGen/Appen projects (Uolo V2 & P, Fireweed, Plumeria V2, Emerald) involving LLM response evaluation, localization ranking, question generation, and content quality review.",
  },
  {
    title: "BSc Software Engineering",
    org: "COMSATS University Islamabad",
    type: "education",
    period: "Sep 2022 \u2014 Jun 2026",
    logo: "/comsats-university-vector-logo.svg",
    description:
      "Bachelor in Software Engineering with focus on computer science, software architecture, algorithms, database systems, artificial intelligence, and human-computer interaction.",
  },
];

const stats = [
  { value: "2", label: "Platforms Founded" },
  { value: "260+", label: "Universities Reached" },
  { value: "3+", label: "Years AI/ML Experience" },
  { value: "7", label: "Products Built" },
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
        "He holds several professional certifications including the Google Advanced Data Analytics, Google Data Analytics, Google Cybersecurity, Google UX Design, Google Project Management, Meta Front-End Developer, and Meta Android Developer Professional Certificates, as well as the Aspire AI-Integrated Leadership Program (Harvard Faculty).",
    },
    {
      question: "Where did Ghulam Mujtaba study?",
      answer:
        "He graduated with a Bachelor of Science in Software Engineering from COMSATS University Islamabad, Lahore Campus in June 2026.",
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
        title="About Ghulam Mujtaba | Full Stack & AI Specialist"
        description="Learn about Ghulam Mujtaba — Full Stack Developer & AI Specialist. 3+ years of experience building scalable applications, AI models, and student platforms."
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

      <header>
        <ThemeToggleIcon />
        <div className="nav-desktop-wrapper">
          <NavBarDesktop />
        </div>
        <div className="show-on-mobile">
          <NavBarMobile sections={MAIN_SECTIONS} />
        </div>
      </header>

      <main className={common.main}>
        {/* ==================== HERO ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.hero} aria-labelledby="about-hero-title">
            <div className={common.heroContent}>
              <p className={`${common.heroEyebrow} ${t.heroEyebrow}`}>
                <MapPin size={12} /> {scraped.location || "Lahore, Pakistan"}
              </p>
              <h1 id="about-hero-title" className={`${common.heroName} ${t.heroName}`}>
                Ghulam Mujtaba
              </h1>
              <ul className={common.heroRoles} aria-label="Positioning">
                <li className={`${common.heroRoleItem} ${t.heroRoleItem}`}>Founder — Megicode &amp; CampusAxis</li>
                <li className={`${common.heroRoleItem} ${t.heroRoleItem}`}>Full-Stack Engineering</li>
                <li className={`${common.heroRoleItem} ${t.heroRoleItem}`}>AI &amp; Data Science</li>
              </ul>
              <nav className={common.heroSocial} aria-label="Contact and social links">
                <a className={`${common.heroSocialLink} ${t.heroSocialLink}`} href="mailto:ghulammujtaba1005@gmail.com">
                  <Mail size={14} /> Email
                </a>
                <a className={`${common.heroSocialLink} ${t.heroSocialLink}`} href="https://github.com/ghulam-mujtaba5" target="_blank" rel="noopener noreferrer">
                  <Github size={14} /> GitHub
                </a>
                <a className={`${common.heroSocialLink} ${t.heroSocialLink}`} href="https://www.linkedin.com/in/ghulamujtabaofficial" target="_blank" rel="noopener noreferrer">
                  <Linkedin size={14} /> LinkedIn
                </a>
              </nav>
            </div>
            <div className={common.heroVisual}>
              <div className={`${common.avatarFrame} ${t.avatarFrame}`}>
                <img
                  src={scraped.image || "/images/portfolio-picture.png"}
                  alt="Ghulam Mujtaba"
                  className={common.avatar}
                  width={200}
                  height={200}
                />
                <Tooltip
                  content="Open to new opportunities and collaborations"
                  placement="top"
                  trigger={
                    <span className={`${common.avatarBadge} ${t.avatarBadge}`}>
                      <span className={common.statusDot} />
                      Available
                    </span>
                  }
                />
              </div>
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
                I am a software engineer from Lahore, Pakistan, and a graduate of Software Engineering
                at COMSATS University. What started as curiosity about how apps are built
                has grown into founding a software company and shipping products used by real people.
              </p>
              <p>
                I founded MegiCode to build digital products for clients, created CampusAxis — started from COMSATS student problems and expanded into a Pakistani university platform covering 260+ universities — and built MegiLance &mdash;
                an AI-powered freelancing platform &mdash; as my final year project. Running these
                alongside my studies taught me more about product thinking, deadlines, and user needs
                than any classroom could.
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

        {/* ==================== FOUNDER JOURNEY ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.section} aria-labelledby="journey-title">
            <FounderJourney />
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

        {/* ==================== WHAT I'M BUILDING ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.section} aria-labelledby="ventures-heading">
            <h2 className={`${common.sectionTitle} ${t.sectionTitle}`} id="ventures-heading">
              What I&rsquo;m Building
            </h2>
            <div className={common.venturesGrid}>
              {ventures.map((v, i) => {
                const CardTag = v.external ? "a" : Link;
                const cardProps = v.external
                  ? { href: v.link, target: "_blank", rel: "noopener noreferrer" }
                  : {
                      href: v.link,
                      onClick: (e) => {
                        if (document.startViewTransition) {
                          e.preventDefault();
                          startTransition(() => router.push(v.link));
                        }
                      },
                    };
                return (
                  <CardTag
                    key={i}
                    className={`${common.ventureCard} ${t.ventureCard}`}
                    {...cardProps}
                  >
                    <div className={common.ventureHeader}>
                      <img
                        src={v.logoDark ? (theme === "dark" ? v.logoDark : v.logoLight) : v.logo}
                        alt={`${v.name} logo`}
                        className={common.ventureLogo}
                        width={44}
                        height={44}
                      />
                      <div>
                        <h3 className={common.ventureName}>{v.name}</h3>
                        <span className={`${common.ventureRole} ${t.ventureRole}`}>{v.role}</span>
                      </div>
                    </div>
                    <p className={`${common.ventureDesc} ${t.ventureDesc}`}>{v.description}</p>
                    <span className={`${common.ventureLink} ${t.ventureLink}`}>
                      {v.external ? "Visit Site" : "View Project"} <ArrowRight size={14} />
                    </span>
                  </CardTag>
                );
              })}
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

        {/* ==================== EXPERIENCE ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.section} aria-labelledby="experience-heading">
            <h2 className={`${common.sectionTitle} ${t.sectionTitle}`} id="experience-heading">
              Experience
            </h2>
            <div className={common.journeyTimeline}>
              {timeline.filter(e => e.type === "work").map((entry, i, arr) => (
                <div key={entry.org} className={common.journeyEntry}>
                  <div className={common.journeyNodeCol}>
                    <div className={common.journeyBadgeWrap}>
                      <div className={`${common.journeyBadgeRing} ${common.journeyRingWork}`} aria-hidden="true" />
                      <div className={`${common.journeyBadge} ${t.journeyBadge}`}>
                        <img
                          src={entry.logoDark ? (theme === "dark" ? entry.logoDark : entry.logoLight) : entry.logo}
                          alt={`${entry.org} logo`}
                          className={common.journeyBadgeLogo}
                          width={50}
                          height={50}
                        />
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={common.journeyConnector} aria-hidden="true" />
                    )}
                  </div>
                  <div className={`${common.journeyCard} ${t.journeyCard} ${common.journeyCardWork}`}>
                    <div className={common.journeyCardTop}>
                      <span className={`${common.journeyTypeBadge} ${common.journeyTypeWork}`}>Work</span>
                      <span className={`${common.journeyPeriod} ${t.journeyPeriod}`}>{entry.period}</span>
                    </div>
                    <h3 className={common.journeyCardTitle}>{entry.title}</h3>
                    <p className={`${common.journeyCardOrg} ${t.journeyCardOrg}`}>{entry.org}</p>
                    <p className={`${common.journeyCardDesc} ${t.journeyCardDesc}`}>{entry.description}</p>
                    {entry.link && (
                      entry.link.startsWith("http") ? (
                        <a
                          href={entry.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${common.journeyCardLink} ${t.journeyCardLink}`}
                        >
                          Visit Site <ArrowRight size={13} />
                        </a>
                      ) : (
                        <Link
                          href={entry.link}
                          className={`${common.journeyCardLink} ${t.journeyCardLink}`}
                          onClick={(e) => {
                            if (document.startViewTransition) {
                              e.preventDefault();
                              startTransition(() => router.push(entry.link));
                            }
                          }}
                        >
                          View Project <ArrowRight size={13} />
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ==================== EDUCATION ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.section} aria-labelledby="education-heading">
            <h2 className={`${common.sectionTitle} ${t.sectionTitle}`} id="education-heading">
              Education
            </h2>
            <div className={common.journeyTimeline}>
              {timeline.filter(e => e.type === "education").map((entry, i, arr) => (
                <div key={entry.org} className={common.journeyEntry}>
                  <div className={common.journeyNodeCol}>
                    <div className={common.journeyBadgeWrap}>
                      <div className={`${common.journeyBadgeRing} ${common.journeyRingWork}`} aria-hidden="true" />
                      <div className={`${common.journeyBadge} ${t.journeyBadge} ${common.journeyBadgeLg}`}>
                        <img
                          src={entry.logo}
                          alt={`${entry.org} logo`}
                          className={`${common.journeyBadgeLogo} ${common.journeyBadgeLogoLg}`}
                          width={60}
                          height={60}
                        />
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={common.journeyConnector} aria-hidden="true" />
                    )}
                  </div>
                  <div className={`${common.journeyCard} ${t.journeyCard} ${common.journeyCardWork}`}>
                    <div className={common.journeyCardTop}>
                      <span className={`${common.journeyTypeBadge} ${common.journeyTypeEdu}`}>Education</span>
                      <span className={`${common.journeyPeriod} ${t.journeyPeriod}`}>{entry.period}</span>
                    </div>
                    <h3 className={common.journeyCardTitle}>{entry.title}</h3>
                    <p className={`${common.journeyCardOrg} ${t.journeyCardOrg}`}>{entry.org}</p>
                    <p className={`${common.journeyCardDesc} ${t.journeyCardDesc}`}>{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ==================== CTA ==================== */}
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={`${common.ctaSection} ${t.ctaSection}`} aria-labelledby="cta-heading">
            <h2 id="cta-heading" className={`${common.ctaTitle} ${t.ctaTitle}`}>
              Building something? Hiring someone?
            </h2>
            <p className={`${common.ctaDesc} ${t.ctaDesc}`}>
              I take on serious projects through Megicode and I&rsquo;m open to
              full-stack and AI engineering roles — remote or in Lahore.
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

      </main>
      <Footer />
    </div>
  );
}
