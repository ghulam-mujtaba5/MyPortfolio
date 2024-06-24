import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Import the useTheme hook
import styles from './welcomeLight.module.css'; // Import the light mode CSS file
import darkStyles from './welcomeDark.module.css'; // Import the dark mode CSS file
import commonStyles from './welcomeCommon.module.css'; // Import the common CSS file

const Frame = () => {
  const { theme } = useTheme(); // Destructure theme from the context

  const [helloImVisible, setHelloImVisible] = useState(false);
  const [ghulamMujtabaLetters, setGhulamMujtabaLetters] = useState('');
  const [paragraphWords, setParagraphWords] = useState([]);
  const paragraph =
    'Software Engineer with a keen interest in developing innovative solutions through the integration of emerging technologies.';

  useEffect(() => {
    let isMounted = true;

    const helloImTimeout = setTimeout(() => {
      if (isMounted) {
        setHelloImVisible(true);
      }
    }, 500);

    const ghulamMujtabaTimeout = setTimeout(() => {
      try {
        const name = 'GHULAM MUJTABA';
        let index = -1;
        const intervalId = setInterval(() => {
          if (isMounted && index < 13) {
            setGhulamMujtabaLetters(prevLetters => prevLetters + name[index]);
            index++;
          } else {
            clearInterval(intervalId);
          }
        }, 70);

        return () => {
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error('Error occurred while setting up ghulamMujtabaLetters:', error);
      }
    }, 1000);

    const paragraphTimeout = setTimeout(() => {
      try {
        const words = paragraph.split(' ');
        let index = -1;
        const intervalId = setInterval(() => {
          if (isMounted && index < words.length) {
            setParagraphWords(prevWords => [...prevWords, words[index]]);
            index++;
          } else {
            clearInterval(intervalId);
          }
        }, 150);

        return () => {
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error('Error occurred while setting up paragraphWords:', error);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(helloImTimeout);
      clearTimeout(ghulamMujtabaTimeout);
      clearTimeout(paragraphTimeout);
    };
  }, []);

  return (
    <section className={`${theme === 'dark' ? darkStyles.darkContainer : styles.container} ${commonStyles.container}`} role="region" aria-labelledby="introduction-heading">
      <div className={`${commonStyles.textContainer}`}>
        <p id="welcome" className={`${commonStyles.text} ${theme === 'dark' ? darkStyles.text : styles.text} ${helloImVisible ? styles.visible : ''}`}>
          Hello, I’m
        </p>
        <h1 className={`${commonStyles.ghulamMujtaba} ${theme === 'dark' ? darkStyles.text : styles.text} ${theme === 'dark' ? darkStyles.ghulamMujtaba : styles.ghulamMujtaba}`} aria-live="polite">
          {ghulamMujtabaLetters}
        </h1>
        <p className={`${commonStyles.paragraph} ${theme === 'dark' ? darkStyles.paragraph : styles.paragraph}`} aria-live="polite">
          {paragraphWords.join(' ')}
        </p>
      </div>
    </section>
  );
};

export default Frame;
