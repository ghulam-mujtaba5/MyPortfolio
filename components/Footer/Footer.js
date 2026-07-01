import React, { useMemo } from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import commonStyles from "./FooterCommon.module.css"; // Import common styles
import lightStyles from "./FooterLight.module.css"; // Import light mode styles
import darkStyles from "./FooterDark.module.css"; // Import dark mode styles

const Footer = ({
  copyrightText = `Copyright ${new Date().getFullYear()} Ghulam Mujtaba Official`,
  linkedinUrl = "https://www.linkedin.com/in/ghulamujtabaofficial",
  instagramUrl = "https://www.instagram.com/ghulamujtabaofficial/",
  githubUrl = "https://github.com/ghulam-mujtaba5",
}) => {
  const { theme } = useTheme();

  const themeStyles = useMemo(
    () => (theme === "dark" ? darkStyles : lightStyles),
    [theme],
  );

  return (
    <footer className={`${commonStyles.footer} ${themeStyles.footer}`}>
      {/* full-bleed background sits behind the centered frame */}
      <div
        className={`${commonStyles.footerBackground} ${themeStyles.footerBackground}`}
      />
      <div className={commonStyles.footerFrame}>
        <Image
          className={commonStyles.copyrightIcon}
          alt="Copyright Icon"
          src={theme === "dark" ? "/CopyrightDark.svg" : "/copyright-icon.svg"}
          width={24}
          height={24}
          loading="lazy"
        />
        <p className={commonStyles.copyrightLabel}>{copyrightText}</p>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={`${commonStyles.socialLink} ${commonStyles.linkedinPos}`}>
          <Image
            className={commonStyles.linkedinIcon}
            style={{ width: 'auto', height: 'auto' }}
            alt=""
            src={
              theme === "dark"
                ? "/linkedin-icon-on-dark.svg"
                : "/linkedin-icon-on-light.svg"
            }
            width={24}
            height={24}
            loading="lazy"
          />
        </a>
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`${commonStyles.socialLink} ${commonStyles.instagramPos}`}>
          <Image
            className={commonStyles.instagramIcon}
            style={{ width: 'auto', height: 'auto' }}
            alt=""
            src={
              theme === "dark"
                ? "/instagram-icon-on-dark.svg"
                : "/instagram-icon-on-light.svg"
            }
            width={24}
            height={24}
            loading="lazy"
          />
        </a>
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={`${commonStyles.socialLink} ${commonStyles.githubPos}`}>
          <Image
            className={commonStyles.githubIcon}
            style={{ width: 'auto', height: 'auto' }}
            alt=""
            src={
              theme === "dark"
                ? "/github-icon-on-dark.svg"
                : "/github-icon-on-light.svg"
            }
            width={24}
            height={24}
            loading="lazy"
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
