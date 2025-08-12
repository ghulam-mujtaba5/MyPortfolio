import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import styles from './PreviewBanner.module.css';
import lightStyles from './PreviewBanner.light.module.css';
import darkStyles from './PreviewBanner.dark.module.css';
import Link from 'next/link';

const PreviewBanner = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={`${styles.banner} ${themeStyles.banner}`}>
      <p>
        This is a preview. <Link href="/api/exit-preview" className={styles.link}>Click here to exit preview mode.</Link>
      </p>
    </div>
  );
};

export default PreviewBanner;
