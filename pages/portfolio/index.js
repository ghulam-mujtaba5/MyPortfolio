import React from "react";
import dynamic from "next/dynamic";
import ProjectsPreview from "../../components/Projects/ProjectsPreview";
import ArticlesPreview from "../../components/Articles/ArticlesPreview";
import NavBarDesktop from "../../components/NavBar_Desktop/nav-bar";
import NavBarMobile from "../../components/NavBar_Mobile/NavBar-mobile";
import WelcomeFrame from "../../components/welcome/welcome";
import PortfolioPictureImage from "../../components/profile-picture-desktop/PortfolioPictureImage";
import AboutMeSection from "../../components/AboutMe/AboutMeSectionLight";
import Languages from "../../components/Languages/Languages";
import SkillFrame from "../../components/Skills/SkillFrame";
const BadgeScroll = dynamic(
  () => import("../../components/Badges/BadgeScroll"),
  { ssr: false },
);
const Footer = dynamic(() => import("../../components/Footer/Footer"), {
  ssr: false,
});
const ContactSection = dynamic(
  () => import("../../components/Contact/ContactUs"),
  { ssr: false },
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
  navigationSchema,
  speakableSchema,
  faqSchema,
} from "../../components/SEO";
import { MAIN_SECTIONS } from "../../constants/navigation";

import { useEffect, useState } from "react";

const Home = ({ previewProjects = [], previewArticles = [] }) => {
  const { theme } = useTheme();

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
          "Ghulam Mujtaba is a Full Stack Developer, Data Scientist, and AI Specialist based in Lahore, Pakistan. He specializes in building end-to-end solutions using React, Next.js, Python, Java, and modern AI/ML technologies.",
      },
      {
        question: "What services does Ghulam Mujtaba offer?",
        answer:
          "Ghulam Mujtaba offers Full Stack Web Development (React, Next.js, Node.js), Mobile App Development (React Native), Desktop App Development (Electron.js, JavaFX), Data Science & Analytics, AI/ML Model Development, and UI/UX Design.",
      },
      {
        question: "What certifications does Ghulam Mujtaba hold?",
        answer:
          "Ghulam Mujtaba holds 5 Google certifications (UX Design, Data Analytics, Project Management, Cybersecurity) and the Meta Front-End Developer Certificate.",
      },
      {
        question: "How can I contact Ghulam Mujtaba?",
        answer:
          "You can contact Ghulam Mujtaba via email at ghulammujtaba1005@gmail.com, through LinkedIn at linkedin.com/in/ghulamujtabaofficial, or through the contact form on ghulammujtaba.com.",
      },
      {
        question: "Where is Ghulam Mujtaba based?",
        answer:
          "Ghulam Mujtaba is based in Lahore, Punjab, Pakistan. He is currently pursuing a BSc in Software Engineering at COMSATS University Islamabad, Lahore Campus, with expected graduation in June 2026.",
      },
    ]),
  ];

  return (
    <>
      <SEO
        title="Ghulam Mujtaba | Full Stack Developer, Data Scientist & AI Specialist"
        description="Portfolio of Ghulam Mujtaba — Full Stack Developer, Data Scientist, and AI Specialist based in Lahore, Pakistan. Explore innovative projects in web, mobile, desktop, AI and data science. 5 Google certifications & Meta certified."
        url="https://ghulammujtaba.com"
        image="https://ghulammujtaba.com/og-image.png"
        imageAlt="Ghulam Mujtaba — Full Stack Developer, Data Scientist & AI Specialist Portfolio"
        type="website"
        canonical="https://ghulammujtaba.com"
        keywords="Ghulam Mujtaba, Portfolio, Full Stack Developer, Data Scientist, AI Specialist, Software Engineer, React, Next.js, Python, Machine Learning, Lahore Pakistan"
        jsonLd={homeJsonLd}
      />

      <div
        className="portfolio-main-container"
        style={{
          backgroundColor: theme === "dark" ? "#1d2127" : "#ffffff",
          overflowX: "hidden",
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
            aria-labelledby="home-section-heading"
            style={{ width: "100%" }}
          >
            <h1 id="home-section-heading" className="visually-hidden">
              Ghulam Mujtaba | Full Stack Developer, Data Scientist, AI
              Specialist
            </h1>
            <div
              id="portfolio-picture"
              style={{ width: "100%", textAlign: "center" }}
            >
              <PortfolioPictureImage
                style={{
                  width: "200px",
                  height: "200px",
                  margin: "20px auto",
                  display: "block",
                }}
                alt="Ghulam Mujtaba Portfolio Picture"
                priority
              />
            </div>
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

          <section
            id="about-section"
            aria-labelledby="about-section-heading"
            style={{ width: "100%", textAlign: "center" }}
          >
            <h2 id="about-section-heading" className="visually-hidden">
              About Me
            </h2>
            <ScrollReveal animation="fadeInUp" width="100%">
              <AboutMeSection />
            </ScrollReveal>
          </section>

          <section
            id="languages-section"
            aria-labelledby="languages-section-heading"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <h2 id="languages-section-heading" className="visually-hidden">
              Languages
            </h2>
            <ScrollReveal animation="fadeInUp" width="100%">
              <Languages />
            </ScrollReveal>
          </section>

          <section
            id="skills-section"
            aria-labelledby="skills-section-heading"
            style={{ width: "100%" }}
          >
            <h2 id="skills-section-heading" className="visually-hidden">
              Skills
            </h2>
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
            aria-labelledby="project-section-heading"
            style={{ width: "100%" }}
          >
            <h2 id="project-section-heading" className="visually-hidden">
              Projects
            </h2>
            <ScrollReveal animation="fadeInUp" width="100%">
              <ProjectsPreview projects={previewProjects} />
            </ScrollReveal>
          </section>

          <section
            id="articles-section"
            aria-labelledby="articles-section-heading"
            style={{ width: "100%" }}
          >
            <h2 id="articles-section-heading" className="visually-hidden">
              Articles
            </h2>
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
                plexusMaxNodes={100}
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
        }
        .skip-link:focus {
          top: 0;
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
