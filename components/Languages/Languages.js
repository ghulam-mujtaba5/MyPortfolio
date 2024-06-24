import React from 'react';
import { useTheme } from '../../context/ThemeContext'; // Import the useTheme hook
import commonStyles from './LanguagesCommon.module.css'; // Import common styles
import lightStyles from './LanguagesLight.module.css'; // Import light mode styles
import darkStyles from './LanguagesDark.module.css'; // Import dark mode styles
import Head from 'next/head';

const Frame = () => {
  const { theme } = useTheme(); // Destructure theme from the context

  return (
    <>
    <Head>
        <html lang="en" />
      </Head>
      <section className={`${commonStyles.frameContainer} ${theme === 'dark' ? darkStyles.frameContainer : lightStyles.frameContainer}`} aria-labelledby="languages-title">
        <h2 id="languages-title" className={commonStyles.title}>Languages</h2>
        <div className={commonStyles.iconContainer} >
          <img className={commonStyles.icon} alt="Java programming language" src="java.png"  />
          <img className={commonStyles.icon} alt="Python programming language" src="python icon.svg" />
          <img className={commonStyles.icon} alt="R programming language" src="r icon.svg"  />
          <img className={commonStyles.icon} alt="C programming language" src="c language icon.svg"  />
          <img className={commonStyles.icon} alt="C++ programming language" src="c++ language icon.png" />
          <img className={commonStyles.icon} alt="JavaScript programming language" src="javscript icon.svg" />
          <img className={commonStyles.icon} alt="HTML markup language" src="html icon.svg"  />
          <img className={commonStyles.icon} alt="CSS styling language" src="css icon.svg"  />
        </div>
      </section>
    </>
  );
};

export default Frame;
