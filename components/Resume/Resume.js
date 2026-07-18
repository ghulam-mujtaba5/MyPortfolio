import React from "react";
import commonStyles from "./common.module.css";
import lightStyles from "./light.module.css";
import darkStyles from "./dark.module.css";
import { useTheme } from "../../context/ThemeContext";

const Resume = () => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  return (
    <div className={`${commonStyles.resumeContainer} ${themeStyles.resumeContainer}`}>

      {/* ── Header ── */}
      <div className={commonStyles.resumeHeader}>
        <div className={commonStyles.headerContent}>
          <h1 className={commonStyles.name}>Ghulam Mujtaba</h1>
          <div className={commonStyles.jobTitle}>
            Software Engineer · Full Stack + AI
          </div>
          <div className={commonStyles.contactDetails}>
            <span className={commonStyles.location}>Lahore, Pakistan</span>
            <span className={commonStyles.sep}> · </span>
            <span className={commonStyles.phone}>+92 317 710 7849</span>
            <span className={commonStyles.sep}> · </span>
            <span className={commonStyles.email}>
              <a href="mailto:ghulammujtaba1005@gmail.com">
                ghulammujtaba1005@gmail.com
              </a>
            </span>
            <span className={commonStyles.sep}> · </span>
            <span className={commonStyles.linkedin}>
              <a
                href="https://linkedin.com/in/ghulamujtabaofficial"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin/ghulamujtabaofficial
              </a>
            </span>
            <span className={commonStyles.sep}> · </span>
            <span>
              <a
                href="https://github.com/ghulam-mujtaba5"
                target="_blank"
                rel="noopener noreferrer"
              >
                github/ghulam-mujtaba5
              </a>
            </span>
          </div>
        </div>
        <div className={commonStyles.headerImage}>
          <img
            src="/resume-photo.png"
            alt="Ghulam Mujtaba"
            className={commonStyles.profilePic}
          />
        </div>
      </div>

      <div className={commonStyles.resumeMain}>

        {/* ── Summary ── */}
        <div className={commonStyles.section}>
          <h2 className={commonStyles.sectionHeading}>PROFESSIONAL SUMMARY</h2>
          <hr className={commonStyles.sectionDivider} />
          <p className={commonStyles.summary}>
            Results-driven <strong>Computer Software Engineer</strong> and <strong>Full Stack Developer</strong>. Founder of <strong>Megicode</strong> (software company) and{" "}
            <strong>CampusAxis</strong> (student platform, 260+ Pakistani
            universities). 3+ years of experience delivering robust full stack software engineer resume skills, machine learning models, and web applications end-to-end. Experienced in custom software developer cv architecture, model evaluation, and production deployment.
          </p>
        </div>

        {/* ── Education ── */}
        <div className={commonStyles.section}>
          <h2 className={commonStyles.sectionHeading}>EDUCATION</h2>
          <hr className={commonStyles.sectionDivider} />
          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
              <strong>COMSATS University Islamabad, Lahore Campus</strong>
              <span className={commonStyles.date}>2022 – 2026</span>
            </div>
            <div className={commonStyles.role}>
              BSc in Software Engineering · June 2026
            </div>
          </div>
        </div>

        {/* ── Experience ── */}
        <div className={commonStyles.section}>
          <h2 className={commonStyles.sectionHeading}>EXPERIENCE</h2>
          <hr className={commonStyles.sectionDivider} />

          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
                <strong>Founder — Megicode</strong>
              <span className={commonStyles.date}>2025 – Present</span>
            </div>
            <div className={commonStyles.role}>
                <a href="https://megicode.com" target="_blank" rel="noopener noreferrer">megicode.com</a>
                <span className={commonStyles.sep}> · </span>
                Lahore, Pakistan
            </div>
            <ul className={commonStyles.bullets}>
              <li>
                Architected and shipped products end-to-end — including a commercial clinic platform built and paid for by a real client — across web, mobile, and AI.
              </li>
            </ul>
          </div>

          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
              <strong>Founder & Product Lead — CampusAxis</strong>
              <span className={commonStyles.date}>2024 – Present</span>
            </div>
            <div className={commonStyles.role}>
              <a href="https://campusaxis.pk" target="_blank" rel="noopener noreferrer">campusaxis.pk</a>
              <span className={commonStyles.sep}> · </span>
              Used across 260+ Pakistani universities
            </div>
            <ul className={commonStyles.bullets}>
              <li>
                Built and scaled a Next.js + MongoDB student study platform serving users across 260+ Pakistani universities.
              </li>
            </ul>
          </div>

          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
              <strong>AI / ML Specialist — Various Clients</strong>
              <span className={commonStyles.date}>2022 – Present</span>
            </div>
            <div className={commonStyles.role}>Remote · Contract</div>
            <ul className={commonStyles.bullets}>
              <li>
                Delivered ML pipelines, LLM evaluations, and search relevance tuning for image and NLP tasks over 3+ years.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Projects ── */}
        <div className={commonStyles.section}>
          <h2 className={commonStyles.sectionHeading}>SELECTED PROJECTS</h2>
          <hr className={commonStyles.sectionDivider} />

          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
              <strong>Megilance (FYP)</strong>
              <span className={commonStyles.techStack}>
                Next.js · Node.js · MongoDB
              </span>
            </div>
            <p>
              Final Year Project — full-stack web application developed as an
              academic capstone (Megilance).
            </p>
          </div>

          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
              <strong>CampusAxis</strong>
              <span className={commonStyles.techStack}>
                Next.js · MongoDB · Node.js
              </span>
            </div>
            <p>
              Student platform used by students across 260+ Pakistani universities with past
              papers, GPA tools, faculty reviews, and resources. Production
              SaaS with multi-university data model.
            </p>
          </div>

          {/* AI-Powered Portfolio removed per request */}

          {/* Shop Management & Billing Software removed per request */}

          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
              <strong>Aesthetics Clinic Website & Management System</strong>
              <span className={commonStyles.techStack}>
                Next.js · Node.js · MongoDB · LibSQL
              </span>
            </div>
            <p>
              A full-stack clinic platform for a doctor-led aesthetic center. Includes a website, internal portal, appointment scheduling, patient records, billing, staff roles, and service management to streamline daily clinic operations.
            </p>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className={commonStyles.section}>
          <h2 className={commonStyles.sectionHeading}>TECHNICAL SKILLS</h2>
          <hr className={commonStyles.sectionDivider} />
          <div className={commonStyles.skillsGrid}>
            <div className={commonStyles.skillGroup}>
              <strong>Languages</strong>
              <span>Python, JavaScript, TypeScript, Java, C++, HTML, CSS</span>
            </div>
            <div className={commonStyles.skillGroup}>
              <strong>Frontend</strong>
              <span>React, Next.js, React Native, Flutter, Framer Motion</span>
            </div>
            <div className={commonStyles.skillGroup}>
              <strong>Backend</strong>
              <span>Node.js, Express, Spring Boot, REST APIs, GraphQL</span>
            </div>
            <div className={commonStyles.skillGroup}>
              <strong>AI / ML</strong>
              <span>
                TensorFlow, PyTorch, Scikit-learn, OpenCV, LLM Evaluation,
                Data Annotation, Search Relevance
              </span>
            </div>
            <div className={commonStyles.skillGroup}>
              <strong>Databases</strong>
              <span>MongoDB, PostgreSQL, MySQL, Redis, Firebase</span>
            </div>
            <div className={commonStyles.skillGroup}>
              <strong>Cloud & DevOps</strong>
              <span>AWS, Vercel, Docker, Git, GitHub Actions, CI/CD</span>
            </div>
            <div className={commonStyles.skillGroup}>
              <strong>Design</strong>
              <span>Figma, UI/UX Design, Prototyping, A/B Testing</span>
            </div>
            <div className={commonStyles.skillGroup}>
              <strong>Leadership</strong>
              <span>
                System Architecture, Technical Co-founding, Agile, Code Review
              </span>
            </div>
          </div>
        </div>

        {/* ── Certifications ── */}
        <div className={commonStyles.section}>
          <h2 className={commonStyles.sectionHeading}>CERTIFICATIONS</h2>
          <hr className={commonStyles.sectionDivider} />
          <div className={commonStyles.certGrid}>
            {[
              "Google Advanced Data Analytics Professional Certificate",
              "Google Data Analytics Professional Certificate",
              "Google Cybersecurity Professional Certificate",
              "Google UX Design Professional Certificate",
              "Google Project Management Professional Certificate",
              "Meta Front-End Developer Professional Certificate",
              "Aspire AI-Integrated Leadership Program (Harvard Faculty)",
              "Microsoft Office Specialist: Word Associate (Office 2019)",
            ].map((cert) => (
              <div key={cert} className={commonStyles.certItem}>
                <span className={commonStyles.certDot} />
                {cert}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Resume;
