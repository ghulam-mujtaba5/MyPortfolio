import React from 'react';
import SEO, { personSchema, breadcrumbSchema } from '../../components/SEO';
import { useTheme } from '../../context/ThemeContext';
import Resume from '../../components/Resume/Resume';
import NavBarDesktop from '../../components/NavBar_Desktop/nav-bar';
import NavBarMobile from '../../components/NavBar_Mobile/NavBar-mobile';
import Footer from '../../components/Footer/Footer';
import ScrollReveal from '../../components/AnimatedUI/ScrollReveal';
import ThemeToggleIcon from '../../components/Icon/gmicon';
import { MAIN_SECTIONS } from '../../constants/navigation';

const ResumePage = ({ resume }) => {
  const { theme } = useTheme();

  return (
    <>
      <SEO
        title="Ghulam Mujtaba's Resume | Full Stack Developer & AI Specialist"
        description="Resume of Ghulam Mujtaba — Full Stack Developer & AI Specialist. Founder of Megicode & CampusAxis. 3+ years of AI/ML work for Meta."
        url="https://ghulammujtaba.com/resume"
        image="https://ghulammujtaba.com/og-image.png"
        type="profile"
        canonical="https://ghulammujtaba.com/resume"
        keywords="Ghulam Mujtaba Resume, Full Stack Developer, Data Scientist, AI Specialist, Pakistan, MERN, React, Next.js, TensorFlow"
        jsonLd={[
          personSchema({
            url: 'https://ghulammujtaba.com/resume',
            sameAs: [
              'https://www.linkedin.com/in/ghulamujtabaofficial',
              'https://www.instagram.com/ghulamujtabaofficial/',
              'https://github.com/ghulam-mujtaba5',
              'https://stackoverflow.com/users/27756536',
              'https://dev.to/ghulam-mujtaba',
              'https://medium.com/@ghulam-mujtaba',
              'https://kaggle.com/ghulamujtaba',
              'https://leetcode.com/u/ghulam-mujtaba',
              'https://linktr.ee/ghulam__mujtaba',
              'https://www.megicode.com',
              'https://www.campusaxis.com',
            ],
          }),
          breadcrumbSchema([
            { name: 'Resume', url: 'https://ghulammujtaba.com/resume' },
          ]),
        ]}
      />
      <div className="resumePageBg" style={{ backgroundColor: theme === 'dark' ? '#272c34' : '#e8ebee', minHeight: '100vh', overflowX: 'hidden' }}>
        <header>
          <ThemeToggleIcon />
          <NavBarDesktop />
          <NavBarMobile sections={MAIN_SECTIONS} />
        </header>
        <main id="main-content" className={theme === 'dark' ? 'darkTheme' : 'lightTheme'}>
        {resume && (
          <div className="resumeActions" data-noprint>
            <span className="resumeHint">
              ATS-friendly PDF — the same content as this page
            </span>
            <a
              href={`/api/download-resume?url=${encodeURIComponent(resume.url)}&filename=${encodeURIComponent(resume.filename)}`}
              className="downloadButton"
              download
            >
              Download Resume PDF
            </a>
          </div>
        )}
        <ScrollReveal animation="fadeInUp" width="100%">
          <Resume />
        </ScrollReveal>
        {resume && (
          <ScrollReveal animation="fadeInUp" delay={200}>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }} data-noprint>
              <a
                href={`/api/download-resume?url=${encodeURIComponent(resume.url)}&filename=${encodeURIComponent(resume.filename)}`}
                className="downloadButton"
                download
              >
                Download Resume PDF
              </a>
            </div>
          </ScrollReveal>
        )}
      </main>
      <Footer />
      </div>
      <style jsx>{`
        .downloadButton {
          display: inline-block;
          padding: 12px 24px;
          margin: 20px auto;
          font-size: 16px;
          font-weight: bold;
          color: #ffffff;
          background-color: var(--brand-primary, #4573df);
          border: none;
          border-radius: 5px;
          text-decoration: none;
          text-align: center;
          cursor: pointer;
          transition: background-color 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .downloadButton:hover {
          background-color: var(--brand-primary-hover, #3b5fc7);
        }

        .downloadButton:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(69, 115, 223, 0.35);
        }

        .resumeActions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 4px 18px;
          padding: 18px 16px 0;
          text-align: center;
        }

        .resumeHint {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          color: var(--text-tertiary, #6b7280);
        }

        /* Print: resume content only — no nav, footer, buttons, or dark bg */
        @media print {
          .resumeActions,
          [data-noprint],
          :global(header),
          :global(footer) {
            display: none !important;
          }

          .darkTheme,
          .lightTheme {
            background-color: #ffffff !important;
            color: #000000 !important;
          }

          .resumePageBg {
            background-color: #ffffff !important;
          }
        }

        .darkTheme {
          padding: 0;
          color: #ffffff;
          background-color: #272c34;
        }

        .lightTheme {
          padding: 0;
          color: #000000;
          background-color: #e8ebee;
        }

        @media (max-width: 560px) {
          .darkTheme,
          .lightTheme {
            padding-top: calc(clamp(82px, 18vw, 96px) + env(safe-area-inset-top, 0px));
          }

          .downloadButton {
            padding: 10px 20px;
            font-size: 14px;
            margin-left: 0px;
          }
        }
      `}</style>
    </>
  );
};

export async function getServerSideProps() {
  try {
    const dbConnect = (await import('../../lib/mongoose')).default;
    const Resume = (await import('../../models/Resume')).default;
    await dbConnect();
    const resume = await Resume.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
    return { props: { resume: resume ? JSON.parse(JSON.stringify(resume)) : null } };
  } catch (error) {
    return { props: { resume: null } };
  }
}

export default ResumePage;
