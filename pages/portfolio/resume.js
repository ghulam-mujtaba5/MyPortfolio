import React from 'react';
import SEO from '../../components/SEO';
import { useTheme } from '../../context/ThemeContext';
import Resume from '../../components/Resume/Resume';
import Footer from '../../components/Footer/Footer';

const ResumePage = ({ resume }) => {
  const { theme } = useTheme();

  return (
    <>
      <SEO
        title="Ghulam Mujtaba's Resume | Software Engineer"
        description="Explore my professional journey and skills in detail as a Software Engineer specializing in emerging technologies on my resume page."
        url="https://ghulammujtaba.com/portfolio/resume"
        image="https://ghulammujtaba.com/og-image.png"
        type="profile"
        canonical="https://ghulammujtaba.com/portfolio/resume"
        keywords="Ghulam Mujtaba, Resume, Software Engineer, Portfolio, Skills, Experience"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'http://schema.org',
              '@type': 'Person',
              name: 'Ghulam Mujtaba',
              url: 'https://ghulammujtaba.com/portfolio/resume',
              sameAs: [
                'https://www.linkedin.com/in/ghulamujtabaofficial',
                'https://www.instagram.com/ghulamujtabaofficial/',
                'https://github.com/ghulam-mujtaba5',
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
      </SEO>
      <main className={theme === 'dark' ? 'darkTheme' : 'lightTheme'}>
        <Resume />
        {resume && (
          <a
            href={`/api/download-resume?url=${encodeURIComponent(resume.url)}&filename=${encodeURIComponent(resume.filename)}`}
            className="downloadButton"
            download
          >
            Download Resume PDF
          </a>
        )}
      </main>
      <Footer />
      <style jsx>{`
        .downloadButton {
          display: inline-block;
          padding: 12px 24px;
          margin: 20px 0;
          margin-left: 30px;
          font-size: 16px;
          font-weight: bold;
          color: #ffffff;
          background-color: #45818e;
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume`);
    if (!res.ok) {
      console.error('Failed to fetch resume, status:', res.status);
      return { props: { resume: null } };
    }
    const data = await res.json();
    return { props: { resume: data.resume } };
  } catch (error) {
    console.error('Error fetching resume:', error);
    return { props: { resume: null } };
  }
}

export default ResumePage;
