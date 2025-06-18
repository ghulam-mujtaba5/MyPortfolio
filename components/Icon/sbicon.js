

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
import Image from 'next/image';
import styles from './sbicon.module.css'; // Ensure the correct path and module import

const ThemeToggleIcon = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [animate, setAnimate] = useState(false);
  const iconRef = useRef(null);

  const handleIconClick = useCallback(() => {
    window.location.href = 'https://ghulammujtaba.com'; // Change to your subdomain
  }, []);

  const iconClass = useMemo(() => {
    return `${styles['theme-toggle-icon']} ${theme === 'light' ? styles.light : styles.dark} ${animate ? styles.animate : ''}`;
  }, [theme, animate]);

  const iconSrc = useMemo(() => {
    return "/sbVector.svg"; // Assuming the same icon for both themes
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          // Reset animation class after animation completes
          setTimeout(() => setAnimate(false), 1000); // Match duration with animation time
        }
      },
      { threshold: 0.1 } // Adjust based on when you want the animation to trigger
    );

    if (iconRef.current) {
      observer.observe(iconRef.current);
    }

    return () => {
      if (iconRef.current) {
        observer.unobserve(iconRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={iconRef}
      className={iconClass}
      onClick={handleIconClick}
      role="button"
      aria-label="Toggle Theme and Navigate to HomePortfolio"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleIconClick();
        }
      }}
    >
      <Image src={iconSrc} alt="Theme Icon" width={32} height={32} />
    </div>
  );
};

export default ThemeToggleIcon;
