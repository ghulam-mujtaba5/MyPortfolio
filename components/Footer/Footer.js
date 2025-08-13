
import React, { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext';
import commonStyles from './FooterCommon.module.css'; // Import common styles
import lightStyles from './FooterLight.module.css'; // Import light mode styles
import darkStyles from './FooterDark.module.css'; // Import dark mode styles

const Footer = ({
  copyrightText = `Copyright ${new Date().getFullYear()} Ghulam Mujtaba Official`,
  linkedinUrl = "https://www.linkedin.com/in/ghulamujtabaofficial",
  instagramUrl = "https://www.instagram.com/ghulamujtabaofficial/",
  githubUrl = "https://github.com/ghulam-mujtaba5"
}) => {
  const { theme } = useTheme();

  const themeStyles = useMemo(() => (theme === 'dark' ? darkStyles : lightStyles), [theme]);

  const onLinkedinIconClick = useCallback(() => {
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  }, [linkedinUrl]);

  const onInstagramIconClick = useCallback(() => {
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
  }, [instagramUrl]);

  const onGithubIconClick = useCallback(() => {
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  }, [githubUrl]);

  return (
    <footer className={`${commonStyles.footer} ${themeStyles.footer}`}>
      <div className={commonStyles.footerFrame}>
        <div className={`${commonStyles.footerBackground} ${themeStyles.footerBackground}`} />
        <Image
          className={commonStyles.copyrightIcon}
          alt="Copyright Icon"
          src={theme === 'dark' ? "/CopyrightDark.svg" : "/copyright-icon.svg"}
          width={24}
          height={24}
          loading="lazy"
        />
        <p className={commonStyles.copyrightLabel}>
          {copyrightText}
        </p>
        <Image
          className={commonStyles.linkedinIcon}
          alt="LinkedIn"
          src={theme === 'dark' ? "/LinkedinDark.svg" : "/linkedin-icon.svg"}
          width={24}
          height={24}
          loading="lazy"
          onClick={onLinkedinIconClick}
          role="button"
          aria-label="LinkedIn"
          style={{ cursor: 'pointer' }}
        />
        <Image
          className={commonStyles.instagramIcon}
          alt="Instagram"
          src={theme === 'dark' ? "/InstagramDark.svg" : "/Instagram-icon.svg"}
          width={24}
          height={24}
          loading="lazy"
          onClick={onInstagramIconClick}
          role="button"
          aria-label="Instagram"
          style={{ cursor: 'pointer' }}
        />
        <Image
          className={commonStyles.githubIcon}
          alt="GitHub"
          src={theme === 'dark' ? "/GithubDark.svg" : "/github_icon.svg"}
          width={24}
          height={24}
          loading="lazy"
          onClick={onGithubIconClick}
          role="button"
          aria-label="GitHub"
          style={{ cursor: 'pointer' }}
        />
      </div>
    </footer>
  );
};

export default Footer;
