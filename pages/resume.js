import React from 'react';
import Head from 'next/head'; // Import Head from next/head for SEO
import { useTheme } from '../context/ThemeContext'; // Assuming ThemeProvider is in a separate file and exported correctly

const ResumePage = () => {
  const { theme } = useTheme();

  const pageStyle = {
    padding: '20px',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    backgroundColor: theme === 'dark' ? '#272c34' : '#e8ebee',
  };

  const footerStyle = {
    padding: '20px',
    textAlign: 'center',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    backgroundColor: theme === 'dark' ? '#1d2127' : '#ffffff',
  };

  return (
    <div>
      <Head>
        <title>Ghulam Mujtaba's Resume | Software Engineer</title>
        <meta name="description" content="Explore my professional journey and skills in detail as a Software Engineer specializing in emerging technologies on my resume page." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={pageStyle}>
        <h1>Resume - Ghulam Mujtaba</h1>
        <embed
          src="Resume.pdf"
          width="100%"
          height="800px"
          type="application/pdf"
          title="Resume"
          aria-label="Resume PDF"
        />
      </main>
      <footer style={footerStyle}>
        <p>© {new Date().getFullYear()} Ghulam Mujtaba. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ResumePage;
