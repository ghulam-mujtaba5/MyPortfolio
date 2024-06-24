import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Import the useTheme hook
import styles from './welcomeLight.module.css'; // Import the light mode CSS file
import darkStyles from './welcomeDark.module.css'; // Import the dark mode CSS file
import commonStyles from './welcomeCommon.module.css'; // Import the common CSS file

const Frame = () => {
  const { theme } = useTheme(); // Destructure theme from the context

  const [welcomeText, setWelcomeText] = useState('');
  const [softBuiltText, setSoftBuiltText] = useState('');
  const [serviceWords, setServiceWords] = useState([]);
  const serviceText = 'Elevate your Business with our Services.';

  useEffect(() => {
    let isMounted = true;

    const welcomeTimeout = setTimeout(() => {
      try {
        const welcomeText = 'Weelcome to ';
        let index = 0;
        const intervalId = setInterval(() => {
          if (isMounted && index < 11) {
            setWelcomeText(prevText => prevText + welcomeText[index]);
            index++;
          } else {
            clearInterval(intervalId);
          }
        }, 70);

        return () => {
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error('Error in welcome text animation:', error);
      }
    }, 1000);

    const softBuiltTimeout = setTimeout(() => {
      try {
        const softBuiltText = ' Soft Built';
        let index = 0;
        const intervalId = setInterval(() => {
          if (isMounted && index < 10) {
            setSoftBuiltText(prevText => prevText + softBuiltText[index]);
            index++;
          } else {
            clearInterval(intervalId);
          }
        }, 70);

        return () => {
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error('Error in "Soft Built" text animation:', error);
      }
    }, 1500);

    const serviceTimeout = setTimeout(() => {
      try {
        const words = serviceText.split(' ');
        let index = -1;
        const intervalId = setInterval(() => {
          if (isMounted && index < words.length) {
            setServiceWords(prevWords => [...prevWords, words[index]]);
            index++;
          } else {
            clearInterval(intervalId);
          }
        }, 150);

        return () => {
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error('Error in service text animation:', error);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(welcomeTimeout);
      clearTimeout(softBuiltTimeout);
      clearTimeout(serviceTimeout);
    };
  }, []);

  return (
    <section className={`${commonStyles.container} ${theme === 'dark' ? darkStyles.darkContainer : styles.container}`} aria-label="Welcome to Soft Built">
      <div className={`${commonStyles.textContainer} ${theme === 'dark' ? darkStyles.textContainer : styles.textContainer}`}>
        <h1 className={`${commonStyles.text} ${theme === 'dark' ? darkStyles.text : styles.text}`}>
          {welcomeText}
          <span className={styles.softBuilt}>{softBuiltText}</span>
        </h1>
        <p className={`${commonStyles.paragraph} ${theme === 'dark' ? darkStyles.paragraph : styles.paragraph}`}>
          {serviceWords.join(' ')}
        </p>
      </div>
    </section>
  );
};

export default Frame;
