import React from "react";
import dynamic from "next/dynamic";
import ProjectsPreview from "../../components/Projects/ProjectsPreview";
import ArticlesPreview from "../../components/Articles/ArticlesPreview";
import NavBarDesktop from "../../components/NavBar_Desktop/nav-bar";
import NavBarMobile from "../../components/NavBar_Mobile/NavBar-mobile";
import WelcomeFrame from "../../components/welcome/welcome";
import PortfolioPictureImage from "../../components/profile-picture-desktop/PortfolioPictureImage";
import AboutMeSection from "../../components/AboutMe/AboutMeSectionLight";
import TrustStrip from "../../components/TrustStrip/TrustStrip";
import FounderJourney from "../../components/Journey/FounderJourney";
import Languages from "../../components/Languages/Languages";
import SkillFrame from "../../components/Skills/SkillFrame";
const BadgeScroll = dynamic(
  () => import("../../components/Badges/BadgeScroll"),
  { ssr: false, loading: () => <div style={{ minHeight: "120px" }} /> },
);
const Footer = dynamic(() => import("../../components/Footer/Footer"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "200px" }} />,
});
const ContactSection = dynamic(
  () => import("../../components/Contact/ContactUs"),
  { ssr: false, loading: () => <div style={{ minHeight: "400px" }} /> },
);
import { useTheme } from "../../context/ThemeContext";
import ThemeToggleIcon from "../../components/Icon/gmicon";
import ScrollReveal from "../../components/AnimatedUI/ScrollReveal";

import Head from "next/head";
import SEO, {
  personSchema,
  profilePageSchema,
  webSiteSchema,
  organizationSchema,
  professionalServiceSchema,
  navigationSchema,
  speakableSchema,
  faqSchema,
} from "../../components/SEO";
import { MAIN_SECTIONS } from "../../constants/navigation";

import { useEffect, useState } from "react";

const Home = ({ previewProjects = [], previewArticles = [] }) => {
  const { theme } = useTheme();
  const pageBackground =
    theme === "dark"
      ? "radial-gradient(circle at 18% 6%, rgba(69, 115, 223, 0.18), transparent 30rem), linear-gradient(180deg, #171b21 0%, #1d2127 46%, #171b21 100%)"
      : "radial-gradient(circle at 18% 6%, rgba(69, 115, 223, 0.13), transparent 30rem), linear-gradient(180deg, #ffffff 0%, #f7f9fd 42%, #ffffff 100%)";

  const sections = MAIN_SECTIONS;

  // Build comprehensive JSON-LD schemas for the homepage
  const homeJsonLd = [
    // 1️⃣ Full Person schema with hasOccupation, hasCredential, alumniOf, knowsAbout
    personSchema(),
    // 2️⃣ ProfilePage — Google's newer schema that triggers rich profile cards
    profilePageSchema(),
    // 3️⃣ WebSite with SearchAction — enables sitelinks search box
    webSiteSchema(),
    // 4️⃣ Organization — establishes brand identity
    organizationSchema(),
    // 4.5️⃣ ProfessionalService — the freelance/consulting service entity,
    // with the three homepage service categories as nested Service offers
    professionalServiceSchema(),
    // 5️⃣ SiteNavigationElement — hints to Google which sections are primary
    navigationSchema(),
    // 6️⃣ Speakable — marks content for Google Assistant / TTS
    speakableSchema({
      url: "https://ghulammujtaba.com",
      cssSelectors: ["h1", "#about-section", "[data-speakable]"],
    }),
    // 7️⃣ FAQ — drives rich FAQ snippets in Google search
    faqSchema([
      {
        question: "Who is Ghulam Mujtaba?",
        answer:
          "Ghulam Mujtaba is a Full Stack Developer, Data Scientist, and AI Specialist based in Lahore, Pakistan. He is the founder of Megicode, a software company, and the founder of CampusAxis, a student platform used by students across 260+ Pakistani universities. He has 3+ years of AI/ML experience working on various projects.",
      },
      {
        question: "What is Megicode?",
        answer:
          "Megicode (megicode.com) is a software company founded by Ghulam Mujtaba in 2025. It is a hybrid service-and-product company with 10+ shipped projects, providing UI/UX design, mobile/web/desktop app development, and AI solutions including data scraping, visualization, and analytics.",
      },
      {
        question: "What is CampusAxis?",
        answer:
          "CampusAxis (campusaxis.com) is a student-focused platform built by Ghulam Mujtaba that is used by students across 260+ Pakistani universities. It provides past papers, GPA calculation, faculty reviews, and study resources, with a decision-first product philosophy designed to reduce student friction during midterms and registration.",
      },
      {
        question: "What services does Ghulam Mujtaba offer?",
        answer:
          "Ghulam Mujtaba offers full-stack web development (React, Next.js, Node.js), mobile development (React Native, Flutter), AI/ML model development (TensorFlow, PyTorch, Scikit-learn), data science and analytics, and UI/UX design. He also mentors via Topmate and Mentoga.",
      },
      {
        question: "What certifications and training does Ghulam Mujtaba hold?",
        answer:
          "Ghulam Mujtaba holds five Google professional certifications (Cybersecurity, Data Analytics, Advanced Data Analytics, Project Management, UX Design), the Meta Front-End Developer Certificate, and is participating in the Aspire AI-Integrated Leadership Program led by Harvard Faculty.",
      },
      {
        question: "How can I contact Ghulam Mujtaba?",
        answer:
          "You can contact Ghulam Mujtaba via email at ghulammujtaba1005@gmail.com, through LinkedIn at linkedin.com/in/ghulamujtabaofficial, book a 1:1 mentoring session at topmate.io/ghulam_mujtaba, or use the contact form on ghulammujtaba.com.",
      },
      {
        question: "Where is Ghulam Mujtaba based?",
        answer:
          "Ghulam Mujtaba is based in Lahore, Punjab, Pakistan (Asia/Karachi, UTC+5). He is currently in his 8th semester of a BSc in Software Engineering at COMSATS University Islamabad, Lahore Campus, with expected graduation in June 2026.",
      },
      {
        question: "What type of software engineering roles is Ghulam Mujtaba seeking?",
        answer:
          "Ghulam Mujtaba is targeting full-time roles as a Software Engineer, Full Stack Engineer, or AI/ML Engineer. He is particularly suited for roles requiring end-to-end product ownership — from model development to production deployment. He is open to remote positions globally and on-site or hybrid roles in Lahore, Pakistan.",
      },
    ]),
  ];

  return (
    <>
      <SEO
        title="Ghulam Mujtaba | Founder, Megicode & CampusAxis · Full Stack + AI"
        description="Founder of Megicode (software company, 10+ shipped products) and CampusAxis (student platform used by students across 260+ Pakistani universities)."
        url="https://ghulammujtaba.com"
        image="https://ghulammujtaba.com/og-image.png"
        imageAlt="Ghulam Mujtaba — Founder of Megicode and CampusAxis, Full Stack Developer and AI Specialist"
        type="website"
        canonical="https://ghulammujtaba.com"
        keywords="Ghulam Mujtaba, Megicode founder, CampusAxis founder, Full Stack Developer, AI Specialist, Data Scientist, React, Next.js, TensorFlow, PyTorch, Lahore Pakistan, COMSATS"
        jsonLd={homeJsonLd}
      />

      <div
        className="portfolio-main-container"
        style={{
          overflowX: "hidden",
          background: pageBackground,
        }}
      >
        <a
          href="#main-content"
          className="skip-link"
          style={{
            position: "absolute",
            top: "-40px",
            left: "0",
            background: "#000",
            color: "#fff",
            padding: "8px",
            zIndex: "100",
          }}
        >
          Skip to main content
        </a>

        <header>
          <ThemeToggleIcon style={{ width: "100%", height: "auto" }} />
          <nav>
            <NavBarDesktop style={{ width: "100%", height: "80px" }} />
          </nav>
          <nav>
            <NavBarMobile
              style={{ width: "100%", height: "60px" }}
              sections={sections}
            />
          </nav>
        </header>

        <main id="main-content">
          <section
            id="home-section"
            aria-label="Introduction — Ghulam Mujtaba, Founder of Megicode and CampusAxis"
            style={{ width: "100%" }}
          >
            <PortfolioPictureImage
              style={{
                width: "100%",
                display: "block",
              }}
              alt="Ghulam Mujtaba Portfolio Picture"
              priority
            />
            <WelcomeFrame
              style={{
                width: "100%",
                minHeight: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </section>

          <TrustStrip />

          <section
            id="about-section"
            aria-labelledby="about-title"
            style={{ width: "100%", textAlign: "center" }}
          >
            <ScrollReveal animation="fadeInUp" width="100%">
              <AboutMeSection />
            </ScrollReveal>
          </section>

          <section
            id="languages-section"
            aria-labelledby="languages-title"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <ScrollReveal animation="fadeInUp" width="100%">
              <Languages />
            </ScrollReveal>
          </section>

          <section
            id="skills-section"
            aria-labelledby="skills-title"
            style={{ width: "100%" }}
          >
            <ScrollReveal animation="fadeInUp" width="100%">
              <SkillFrame />
            </ScrollReveal>
          </section>

          {/* ✅ BadgeScroll section inserted below skills and above projects */}
          <section
            aria-labelledby="certifications-heading"
            style={{ width: "100%" }}
          >
            <h2 id="certifications-heading" className="visually-hidden">
              Certifications
            </h2>
            <ScrollReveal animation="fadeInLeft" width="100%">
              <BadgeScroll />
            </ScrollReveal>
          </section>

          <section
            id="project-section"
            aria-labelledby="projects-title"
            style={{ width: "100%" }}
          >
            <ScrollReveal animation="fadeInUp" width="100%">
              <ProjectsPreview projects={previewProjects} />
            </ScrollReveal>
          </section>

          <section
            id="journey-section"
            aria-labelledby="journey-title"
            style={{ width: "100%" }}
          >
            <ScrollReveal animation="fadeInUp" width="100%">
              <FounderJourney />
            </ScrollReveal>
          </section>

          <section
            id="articles-section"
            aria-labelledby="insights-title"
            style={{ width: "100%" }}
          >
            <ScrollReveal animation="fadeInUp" width="100%">
              <ArticlesPreview articles={previewArticles} />
            </ScrollReveal>
          </section>

          <section
            id="contact-section"
            aria-labelledby="contact-section-heading"
            style={{ width: "100%" }}
          >
            <h2 id="contact-section-heading" className="visually-hidden">
              Contact
            </h2>
            <ScrollReveal animation="fadeInUp" width="100%">
              <ContactSection
                plexusMaxNodes={60}
                plexusMaxDistance={120}
                plexusSpeed={0.7}
                plexusInteraction={"attract"}
                plexusIntensity={1}
                plexusHoverBoost={true}
              />
            </ScrollReveal>
          </section>
        </main>

        <footer>
          <Footer style={{ width: "100%", height: "100px" }} />
        </footer>
      </div>

      <style jsx global>{`
        .portfolio-main-container {
          font-family: var(--font-primary);
          font-size: var(--font-size-base);
          line-height: var(--line-height-base);
          color: #222;
          background-color: #ffffff;
          transition: background-color 0.2s ease;
        }
        [data-theme="dark"] .portfolio-main-container {
          /* Match the document root dark background precisely and force it
             to avoid cascade/order issues causing the hero area to remain
             light. */
          background-color: rgb(29, 33, 39) !important;
          color: #e0e0e0;
        }
        #home-section {
          min-height: clamp(600px, 64vh, 680px);
          position: relative;
          overflow: visible;
          z-index: 1;
        }
        #about-section,
        #languages-section,
        #skills-section,
        #project-section,
        #articles-section,
        #contact-section {
          position: relative;
        }
        #about-section {
          z-index: 2;
        }
        #languages-section,
        #skills-section {
          padding-inline: clamp(16px, 1.8vw, 24px);
        }
        .skip-link:focus {
          top: 0;
        }
        @media (max-width: 980px) {
          #home-section {
            min-height: auto;
          }
        }
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
          font-size: 2em; /* Ensures h1 keeps a heading-appropriate size for accessibility */
        }
      `}</style>
    </>
  );
};

export default Home;

// Server-side fetch of latest published projects for the homepage preview
import dbConnect from "../../lib/mongoose";
import Project from "../../models/Project";
import Article from "../../models/Article";

export async function getStaticProps() {
  try {
    await dbConnect();
    let docs = await Project.find({ published: true, featuredOnHome: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(3)
      .lean();

    // Fallback: if no featured projects, show latest published
    if (!docs || docs.length === 0) {
      docs = await Project.find({ published: true })
        .sort({ displayOrder: 1, createdAt: -1 })
        .limit(3)
        .lean();
    }

    // Articles: prefer featured, fallback to latest published
    let art = await Article.find({ published: true, featuredOnHome: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    if (!art || art.length === 0) {
      art = await Article.find({ published: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
    }

    return {
      props: {
        previewProjects: JSON.parse(JSON.stringify(docs)),
        previewArticles: JSON.parse(JSON.stringify(art)),
      },
      revalidate: 3600, // Regenerate every hour
    };
  } catch (e) {
    return {
      props: { previewProjects: [], previewArticles: [] },
      revalidate: 60, // Retry sooner on error
    };
  }
}
