import React from "react";
import dynamic from "next/dynamic";
import SEO, { breadcrumbSchema, personSchema } from "../components/SEO";
import common from "../components/AboutPage/AboutPageCommon.module.css";
import light from "../components/AboutPage/AboutPageLight.module.css";
import dark from "../components/AboutPage/AboutPageDark.module.css";
import { useTheme } from "../context/ThemeContext";
import ScrollReveal from "../components/AnimatedUI/ScrollReveal";
import { Mail, Github, Linkedin, MapPin } from "lucide-react";
import { MAIN_SECTIONS } from "../constants/navigation";
import ThemeToggleIcon from "../components/Icon/gmicon";

const NavBarDesktop = dynamic(() => import("../components/NavBar_Desktop/nav-bar"), { ssr: false });
const NavBarMobile = dynamic(() => import("../components/NavBar_Mobile/NavBar-mobile"), { ssr: false });
const Footer = dynamic(() => import("../components/Footer/Footer"), { ssr: false });
const ContactSection = dynamic(() => import("../components/Contact/ContactUs"), { ssr: false });

export default function ContactPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? dark : light;

  const contactBreadcrumbSchema = breadcrumbSchema([
    { name: "Contact", url: "https://ghulammujtaba.com/contact" },
  ]);
  const contactPersonSchema = personSchema();

  return (
    <div className={`${common.page} ${t.page}`}>
      <SEO
        title="Contact Ghulam Mujtaba | Full Stack Developer & AI Specialist"
        description="Get in touch with Ghulam Mujtaba for project inquiries, collaborations, or opportunities. Based in Lahore, Pakistan — available for freelance and full-time work."
        url="https://ghulammujtaba.com/contact"
        canonical="https://ghulammujtaba.com/contact"
        image="https://ghulammujtaba.com/images/portfolio-picture.png"
        imageWidth={1200}
        imageHeight={630}
        imageAlt="Contact Ghulam Mujtaba"
        author="Ghulam Mujtaba"
        jsonLd={[contactPersonSchema, contactBreadcrumbSchema]}
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
        <ScrollReveal animation="fadeInUp" width="100%">
          <section className={common.storySection} aria-labelledby="contact-hero-title">
            <p className={`${common.heroEyebrow} ${t.heroEyebrow}`}>
              <MapPin size={12} /> Lahore, Pakistan
            </p>
            <h1 id="contact-hero-title" className={`${common.sectionTitle} ${t.sectionTitle}`}>
              Let&rsquo;s Build Something Together
            </h1>
            <div className={`${common.storyBody} ${t.storyBody}`}>
              <p>
                Have a project in mind, a question, or just want to say hello? Fill out the
                form below or reach out directly &mdash; I typically respond within a day or two.
              </p>
            </div>
            <nav className={common.heroSocial} aria-label="Direct contact links">
              <a className={`${common.heroSocialLink} ${t.heroSocialLink}`} href="mailto:hello@ghulammujtaba.com">
                <Mail size={14} /> Email
              </a>
              <a className={`${common.heroSocialLink} ${t.heroSocialLink}`} href="https://github.com/ghulam-mujtaba5" target="_blank" rel="noopener noreferrer">
                <Github size={14} /> GitHub
              </a>
              <a className={`${common.heroSocialLink} ${t.heroSocialLink}`} href="https://www.linkedin.com/in/ghulamujtabaofficial" target="_blank" rel="noopener noreferrer">
                <Linkedin size={14} /> LinkedIn
              </a>
            </nav>
          </section>
        </ScrollReveal>

        <ScrollReveal animation="fadeInUp" width="100%">
          <ContactSection email="hello@ghulammujtaba.com" />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
