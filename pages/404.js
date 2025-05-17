import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import styles from './404.module.css';

export default function Custom404() {
  const { theme } = useTheme();

  return (
    <div className={styles.wrapper} data-theme={theme}>
      <motion.div
        className={styles.logoContainer}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Image
          src={theme === 'dark' ? '/gmVectorDark.svg' : '/gmVectorDark.svg'}
          alt="Logo"
          width={80}
          height={80}
          className={styles.logo}
          priority
        />
      </motion.div>
      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      >
        404 - Page Not Found
      </motion.h1>
      <motion.p
        className={styles.description}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
      >
        Oops! The page you are looking for doesn’t exist or has been moved.<br />
        Let’s get you back to something awesome.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
      >
        <Link href="/" legacyBehavior>
          <a className={styles.homeLink} aria-label="Go back home">
            <span className={styles.homeBtnBg} />
            <span className={styles.homeBtnText}>Go Back Home</span>
          </a>
        </Link>
      </motion.div>
    </div>
  );
}
