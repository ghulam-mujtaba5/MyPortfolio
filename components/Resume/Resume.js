import React from "react";
import commonStyles from "./common.module.css"; // Common styles
import lightStyles from "./light.module.css"; // Light theme styles
import darkStyles from "./dark.module.css"; // Dark theme styles
import { useTheme } from "../../context/ThemeContext"; // Assuming ThemeProvider is in a separate file and exported correctly

const Resume = () => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  return (
    <div
      className={`${commonStyles.resumeContainer} ${themeStyles.resumeContainer}`}
    >
      <div className={commonStyles.resumeHeader}>
        <div className={commonStyles.headerContent}>
          <div className={commonStyles.name}>Ghulam Mujtaba</div>
          <div className={commonStyles.jobTitle}>Software Engineer</div>
          <div className={commonStyles.contactDetails}>
            <span className={commonStyles.location}>Lahore, Pakistan</span>
            <span className="hideOnMobile"> &bull; </span>
            <span className={commonStyles.phone}>03177107849</span>
            <span className="hideOnMobile"> &bull; </span>
            <span className={commonStyles.email}>
              <a href="mailto:ghulammujtaba1005@gmail.com">
                ghulammujtaba1005@gmail.com
              </a>
            </span>
            <span className="hideOnMobile"> &bull; </span>
            <span className={commonStyles.linkedin}>
              <a href="https://linkedin.com/in/ghulamujtabaofficial">
                linkedin.com/in/ghulamujtabaofficial
              </a>
            </span>
          </div>
        </div>
        <div className={commonStyles.headerImage}>
          <img
            src="resume-photo.png"
            alt="Ghulam Mujtaba"
            className={commonStyles.profilePic}
          />
        </div>
      </div>

      <div className={commonStyles.resumeMain}>
        <div className={commonStyles.section}>
          <div className={commonStyles.sectionHeading}>EDUCATION</div>
          <hr className={commonStyles.sectionDivider} />
          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
              <strong>Comsats University Islamabad, Lahore Campus.</strong>
              <span className={commonStyles.date}>2022 - Present</span>
            </div>
            <div className={commonStyles.role}>
              Bachelor of Science in Software Engineering
            </div>
          </div>
          <div className={commonStyles.item}>
            <div className={commonStyles.header}>
              <strong>Punjab College of Information Technology Okara</strong>
              <span className={commonStyles.date}>2020 - 2022</span>
            </div>
            <div className={commonStyles.role}>
              Intermediate in Computer Science
            </div>
          </div>
        </div>

        <div className={commonStyles.section}>
          <div className={commonStyles.sectionHeading}>PROJECTS</div>
          <hr className={commonStyles.sectionDivider} />
          <div className={commonStyles.item}>
            <strong>Shop Management & Billing Software</strong>
            <p>
              Desktop Application using Java, JavaFX, Maven, and Spring,
              showcasing my skills in full-stack development and software
              architecture.
            </p>
          </div>
          <div className={commonStyles.item}>
            <strong>Ecommerce Store</strong>
            <p>
              Web Application using Next.js, React, Node.js, and MongoDB
              demonstrating my proficiency in modern web development frameworks
              and technologies.
            </p>
          </div>
          <div className={commonStyles.item}>
            <strong>My Portfolio</strong>
            <p>
              Web Application using Next.js, React, CSS Modules and Figma for
              UI/UX design.
            </p>
          </div>
        </div>

        <div className={commonStyles.section}>
          <div className={commonStyles.sectionHeading}>SKILLS</div>
          <hr className={commonStyles.sectionDivider} />
          <div className={commonStyles.item}>
            <strong>Programming Languages:</strong> Java, Python, JavaScript, C,
            C++, Html, CSS.
          </div>
          <div className={commonStyles.item}>
            <strong>Frameworks:</strong> JavaFx, Spring, React, Next.js,
            Node.js.
          </div>
          <div className={commonStyles.item}>
            <strong>Tools & Platforms:</strong> Git, Figma, Azure.
          </div>
          <div className={commonStyles.item}>
            <strong>Design & Testing:</strong> UI/UX Designing, Agile, A/B
            Testing.
          </div>
          <div className={commonStyles.item}>
            <strong>Additional Skills:</strong> Data Analysis & Visualization,
            Data Annotation.
          </div>
        </div>

        <div className={commonStyles.section}>
          <div className={commonStyles.sectionHeading}>CERTIFICATIONS</div>
          <hr className={commonStyles.sectionDivider} />
          <div className={commonStyles.item}>
            Google Data Analytics Professional Certificate
          </div>
          <div className={commonStyles.item}>
            Meta Front-End Developer Professional Certificate
          </div>
          <div className={commonStyles.item}>
            Google UX Design Professional Certificate
          </div>
          <div className={commonStyles.item}>
            Microsoft Office Specialist: Word Associate (Office 2019)
          </div>
        </div>

        <div className={commonStyles.section}>
          <div className={commonStyles.sectionHeading}>INTERESTS</div>
          <hr className={commonStyles.sectionDivider} />
          <div className={commonStyles.item}>Machine Learning</div>
          <div className={commonStyles.item}>AI Development</div>
          <div className={commonStyles.item}>Big Data Analytics</div>
          <div className={commonStyles.item}>Emerging Technologies</div>
          <div className={commonStyles.item}>Full Stack Development</div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 560px) {
          .hideOnMobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Resume;
