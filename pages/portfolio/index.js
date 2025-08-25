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
// const Project = dynamic(() => import('../../components/Projects/Project1'), { ssr: false });
const Footer = dynamic(() => import("../../components/Footer/Footer"), {
  ssr: false,
});
const ContactSection = dynamic(
  () => import("../../components/Contact/ContactUs"),
  { ssr: false },
);
import { useTheme } from "../../context/ThemeContext";
import ThemeToggleIcon from "../../components/Icon/gmicon";

import Head from "next/head";
import SEO from "../../components/SEO";

import { useEffect, useState } from "react";

const Home = ({ previewProjects = [], previewArticles = [] }) => {
  const { theme } = useTheme();

  const sections = [
    { id: "home-section", label: "Home" },
    { id: "about-section", label: "About" },
    { route: "/resume", label: "Resume" },
    { route: "/projects", label: "Projects" },
    { route: "/articles", label: "Articles" },
    { id: "contact-section", label: "Contact" },
  ];

  return (
    <>
      <SEO
        title="Ghulam Mujtaba | Portfolio"
        description="Portfolio of Ghulam Mujtaba – Full Stack Developer, Data Scientist, and AI Specialist based in Pakistan. Projects, skills, and contact."
        url="https://ghulammujtaba.com"
        image="https://ghulammujtaba.com/og-image.png"
        type="website"
        canonical="https://ghulammujtaba.com/portfolio"
        keywords="Ghulam Mujtaba, Portfolio, Developer, Data Scientist, AI, Pakistan"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "http://schema.org",
              "@type": "Person",
              name: "Ghulam Mujtaba",
              url: "https://ghulammujtaba.com",
              sameAs: [
                "https://www.linkedin.com/in/ghulamujtabaofficial",
                "https://www.instagram.com/ghulamujtabaofficial/",
                "https://github.com/ghulam-mujtaba5",
              ],
              jobTitle: "Full Stack Developer, Data Scientist, AI Specialist",
              address: {
                "@type": "PostalAddress",
                addressCountry: "PK",
              },
              image: "https://ghulammujtaba.com/og-image.png",
            }),
          }}
        />
      </SEO>

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
                height: "400px",
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
            <AboutMeSection />
          </section>

          <section
            id="languages-section"
            aria-labelledby="languages-section-heading"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <h2 id="languages-section-heading" className="visually-hidden">
              Languages
            </h2>
            <Languages />
          </section>

          <section
            id="skills-section"
            aria-labelledby="skills-section-heading"
            style={{ width: "100%" }}
          >
            <h2 id="skills-section-heading" className="visually-hidden">
              Skills
            </h2>
            <SkillFrame />
          </section>

          {/* ✅ BadgeScroll section inserted below skills and above projects */}
          <section
            aria-labelledby="certifications-heading"
            style={{ width: "100%" }}
          >
            <h2 id="certifications-heading" className="visually-hidden">
              Certifications
            </h2>
            <BadgeScroll />
          </section>

          <section
            id="project-section"
            aria-labelledby="project-section-heading"
            style={{ width: "100%" }}
          >
            <h2 id="project-section-heading" className="visually-hidden">
              Projects
            </h2>
            <ProjectsPreview projects={previewProjects} />
          </section>

          <section
            id="articles-section"
            aria-labelledby="articles-section-heading"
            style={{ width: "100%" }}
          >
            <h2 id="articles-section-heading" className="visually-hidden">
              Articles
            </h2>
            <ArticlesPreview articles={previewArticles} />
          </section>

          <section
            id="contact-section"
            aria-labelledby="contact-section-heading"
            style={{ width: "100%" }}
          >
            <h2 id="contact-section-heading" className="visually-hidden">
              Contact
            </h2>
            <ContactSection />
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

export async function getServerSideProps() {
  try {
    await dbConnect();
    let docs = await Project.find({ published: true, featuredOnHome: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Fallback: if no featured projects, show latest published
    if (!docs || docs.length === 0) {
      docs = await Project.find({ published: true })
        .sort({ createdAt: -1 })
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
    };
  } catch (e) {
    return { props: { previewProjects: [], previewArticles: [] } };
  }
}
