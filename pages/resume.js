import React from 'react';
import Head from 'next/head';
import { useTheme } from '../context/ThemeContext'; // Assuming ThemeProvider is in a separate file and exported correctly
import Resume from '../components/Resume/Resume'; // Import the Resume component
import Footer from '../components/Footer/Footer'; // Import the Footer component

const ResumePage = () => {
  const { theme } = useTheme();

  return (
    <div>
      <Head>
        <title>Ghulam Mujtaba's Resume | Software Engineer</title>
        <meta
          name="description"
          content="Explore my professional journey and skills in detail as a Software Engineer specializing in emerging technologies on my resume page."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* Ensure no horizontal scrolling with overflow-x: hidden */}
        <style>{`
          body {
            overflow-x: hidden;
          }
        `}</style>
      </Head>
      <main className={theme === 'dark' ? 'darkTheme' : 'lightTheme'}>
        <Resume />
        <a href="/Resume.pdf" download className="downloadButton">
          Download Resume PDF
        </a>
      </main>
      <Footer /> {/* Reuse the Footer component */}
      <style jsx>{`
        .downloadButton {
          display: inline-block;
          padding: 12px 24px;
          margin: 20px 0;
          margin-left:30px;
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
            margin-left:0px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumePage;
