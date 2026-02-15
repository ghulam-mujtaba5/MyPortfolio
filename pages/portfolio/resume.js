import React from 'react';
import SEO from '../../components/SEO';
import { useTheme } from '../../context/ThemeContext';
import Resume from '../../components/Resume/Resume';
import NavBarDesktop from '../../components/NavBar_Desktop/nav-bar';
import NavBarMobile from '../../components/NavBar_Mobile/NavBar-mobile';
import Footer from '../../components/Footer/Footer';
import ScrollReveal from '../../components/AnimatedUI/ScrollReveal';
import { MAIN_SECTIONS } from '../../constants/navigation';

const ResumePage = ({ resume }) => {
  const { theme } = useTheme();

  return (
    <>
      <SEO
        title="Ghulam Mujtaba's Resume | Software Engineer"
        description="Explore my professional journey and skills in detail as a Software Engineer specializing in emerging technologies on my resume page."
        url="https://ghulammujtaba.com/resume"
        image="https://ghulammujtaba.com/og-image.png"
        type="profile"
        canonical="https://ghulammujtaba.com/resume"
        keywords="Ghulam Mujtaba, Resume, Software Engineer, Portfolio, Skills, Experience"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'http://schema.org',
              '@type': 'Person',
              name: 'Ghulam Mujtaba',
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
              ],
              jobTitle:
                'Software Engineer, Full Stack Developer, Data Scientist, AI Specialist',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'PK',
              },
              image: 'https://ghulammujtaba.com/og-image.png',
            }),
          }}
        />
        {/* JSON-LD: Breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ghulammujtaba.com/' },
                { '@type': 'ListItem', position: 2, name: 'Resume', item: 'https://ghulammujtaba.com/resume' }
              ]
            })
          }}
        />
      </SEO>
      <div style={{ backgroundColor: theme === 'dark' ? '#1d2127' : '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
        <header>
          <nav><NavBarDesktop /></nav>
          <nav><NavBarMobile sections={MAIN_SECTIONS} /></nav>
        </header>
        <main id="main-content" className={theme === 'dark' ? 'darkTheme' : 'lightTheme'}>
        <ScrollReveal animation="fadeInUp" width="100%">
          <Resume />
        </ScrollReveal>
        {resume && (
          <ScrollReveal animation="fadeInUp" delay={200}>
            <a
              href={`/api/download-resume?url=${encodeURIComponent(resume.url)}&filename=${encodeURIComponent(resume.filename)}`}
              className="downloadButton"
              download
            >
              Download Resume PDF
            </a>
          </ScrollReveal>
        )}
      </main>
      <Footer />
      </div>
      <style jsx>{`
        .downloadButton {
          display: inline-block;
          padding: 12px 24px;
          margin: 20px 0;
          margin-left: 30px;
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
          background-color: #356570;
        }

        .darkTheme {
          padding: 20px;
          color: #ffffff;
          background-color: #272c34;
        }

        .lightTheme {
          padding: 20px;
          color: #000000;
          background-color: #e8ebee;
        }

        @media (max-width: 560px) {
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
