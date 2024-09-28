
// import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
// import { useTheme } from '../../context/ThemeContext';
// import { useRouter } from 'next/router';
// import Image from 'next/image';
// import styles from './gmicon.module.css';

// const ThemeToggleIcon = () => {
//   const { theme } = useTheme();
//   const router = useRouter();
//   const [isInView, setIsInView] = useState(false);
//   const iconRef = useRef(null);

//   const handleIconClick = useCallback(() => {
//     router.push("/softbuilt");
//   }, [router]);

//   const iconClass = useMemo(() => {
//     return `${styles['theme-toggle-icon']} ${isInView ? styles.animate : ''} ${theme === 'light' ? styles.light : styles.dark}`;
//   }, [theme, isInView, styles]);

//   const iconSrc = useMemo(() => {
//     return theme === 'light' ? "/gmVector.svg" : "/gmVectorDark.svg";
//   }, [theme]);

//   const checkInView = () => {
//     if (iconRef.current) {
//       const rect = iconRef.current.getBoundingClientRect();
//       const windowHeight = window.innerHeight || document.documentElement.clientHeight;
//       const isVisible = (rect.top <= windowHeight) && (rect.bottom >= 0);
//       if (isVisible) {
//         setIsInView(true);
//         // Reset animation by toggling the class
//         setTimeout(() => setIsInView(false), 1000); // Match duration of the animation
//       }
//     }
//   };

//   useEffect(() => {
//     // Initial check
//     checkInView();

//     // Add scroll event listener
//     window.addEventListener('scroll', checkInView);

//     // Cleanup listener on unmount
//     return () => {
//       window.removeEventListener('scroll', checkInView);
//     };
//   }, []);

//   return (
//     <div
//       className={iconClass}
//       onClick={handleIconClick}
//       role="button"
//       aria-label="Toggle Theme and Navigate to SoftBuilt"
//       tabIndex={0}
//       onKeyDown={(e) => {
//         if (e.key === 'Enter' || e.key === ' ') {
//           handleIconClick();
//         }
//       }}
//       ref={iconRef}
//     >
//       <Image src={iconSrc} alt="Theme Icon" width={32} height={32} />
//     </div>
//   );
// };

// export default ThemeToggleIcon;
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Image from 'next/image';
import styles from './gmicon.module.css';

const ThemeToggleIcon = () => {
  const { theme } = useTheme();
  const [isInView, setIsInView] = useState(false);
  const iconRef = useRef(null);

  const handleIconClick = useCallback(() => {
    window.location.href = 'https://softbuilt.ghulammujtaba.com'; // Change to your subdomain
  }, []);

  const iconClass = useMemo(() => {
    return `${styles['theme-toggle-icon']} ${isInView ? styles.animate : ''} ${theme === 'light' ? styles.light : styles.dark}`;
  }, [theme, isInView, styles]);

  const iconSrc = useMemo(() => {
    return theme === 'light' ? "/gmVector.svg" : "/gmVectorDark.svg";
  }, [theme]);

  const checkInView = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const isVisible = (rect.top <= windowHeight) && (rect.bottom >= 0);
      if (isVisible) {
        setIsInView(true);
        // Reset animation by toggling the class
        setTimeout(() => setIsInView(false), 1000); // Match duration of the animation
      }
    }
  };

  useEffect(() => {
    // Initial check
    checkInView();

    // Add scroll event listener
    window.addEventListener('scroll', checkInView);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('scroll', checkInView);
    };
  }, []);

  return (
    <div
      className={iconClass}
      onClick={handleIconClick}
      role="button"
      aria-label="Toggle Theme and Navigate to SoftBuilt"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleIconClick();
        }
      }}
      ref={iconRef}
    >
      <Image src={iconSrc} alt="Theme Icon" width={32} height={32} />
    </div>
  );
};

export default ThemeToggleIcon;
