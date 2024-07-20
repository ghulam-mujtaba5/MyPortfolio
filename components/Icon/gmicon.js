import React, { useCallback, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Importing next/image for better image optimization
import styles from './gmicon.module.css'; // Ensure the correct path and module import

const ThemeToggleIcon = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const handleIconClick = useCallback(() => {
    router.push("/softbuilt");
  }, [router]);

  const iconClass = useMemo(() => {
    return `${styles['theme-toggle-icon']} ${theme === 'light' ? styles.light : styles.dark}`;
  }, [theme, styles]);

  const iconSrc = useMemo(() => {
    return theme === 'light' ? "gmVector.svg" : "gmVectorDark.svg";
  }, [theme]);

  return (
    <div
      className={iconClass}
      onClick={handleIconClick}
      role="button"
      aria-label="Toggle Theme and Navigate"
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
