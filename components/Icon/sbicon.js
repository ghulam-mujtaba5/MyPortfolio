import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
import Image from 'next/image';
import styles from './sbicon.module.css'; // Ensure the correct path and module import

const ThemeToggleIcon = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const handleIconClick = useCallback(() => {
    router.push("/HomePortfolio");
  }, [router]);

  const iconClass = useMemo(() => {
    return `${styles['theme-toggle-icon']} ${theme === 'light' ? styles.light : styles.dark}`;
  }, [theme]);

  const iconSrc = useMemo(() => {
    return theme === 'light' ? "/sbVector.svg" : "/sbVector.svg";
  }, [theme]);

  return (
    <div
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
