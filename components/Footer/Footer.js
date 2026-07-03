import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";
import commonStyles from "./FooterCommon.module.css"; // Import common styles
import lightStyles from "./FooterLight.module.css"; // Import light mode styles
import darkStyles from "./FooterDark.module.css"; // Import dark mode styles

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Insights", href: "/insights" },
  { label: "Resume", href: "/resume" },
];

const Footer = ({
  copyrightText = `© ${new Date().getFullYear()} Ghulam Mujtaba. All rights reserved.`,
  linkedinUrl = "https://www.linkedin.com/in/ghulamujtabaofficial",
  instagramUrl = "https://www.instagram.com/ghulamujtabaofficial/",
  githubUrl = "https://github.com/ghulam-mujtaba5",
  email = "hello@ghulammujtaba.com",
}) => {
  const { theme } = useTheme();

  const themeStyles = useMemo(
    () => (theme === "dark" ? darkStyles : lightStyles),
    [theme],
  );

  const monogramSrc =
    theme === "dark"
      ? "/personal-gm-monogram-on-dark.png"
      : "/personal-gm-monogram-on-light.png";

  const socialIcon = (name) =>
    theme === "dark" ? `/${name}-icon-on-dark.svg` : `/${name}-icon-on-light.svg`;

  return (
    <footer className={`${commonStyles.footer} ${themeStyles.footer}`}>
      {/* full-bleed background sits behind the centered frame */}
      <div
        className={`${commonStyles.footerBackground} ${themeStyles.footerBackground}`}
      />
      <div className={commonStyles.footerFrame}>
        <div className={commonStyles.footerTop}>
          <div className={commonStyles.brandCol}>
            <Link
              href="/"
              className={commonStyles.brandMark}
              aria-label="Ghulam Mujtaba — go to homepage"
            >
              <Image
                src={monogramSrc}
                alt=""
                width={32}
                height={32}
                className={commonStyles.brandIcon}
              />
              <span className={commonStyles.brandName}>Ghulam Mujtaba</span>
            </Link>
            <p className={commonStyles.brandTagline}>
              Full Stack Developer, Data Scientist &amp; AI Specialist — building{" "}
              <a
                href="https://www.megicode.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Megicode
              </a>{" "}
              and{" "}
              <a
                href="https://www.campusaxis.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                CampusAxis
              </a>
              .
            </p>
          </div>

          <nav className={commonStyles.linkCol} aria-label="Explore">
            <span className={commonStyles.colHeading}>Explore</span>
            <ul className={commonStyles.linkList}>
              {EXPLORE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={commonStyles.linkCol}>
            <span className={commonStyles.colHeading}>Connect</span>
            <ul className={commonStyles.linkList}>
              <li>
                <a
                  href={`mailto:${email}`}
                  className={commonStyles.iconLink}
                >
                  <Image
                    src={socialIcon("email")}
                    alt="Email"
                    width={19}
                    height={19}
                  />
                  Email
                </a>
              </li>
              <li>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={commonStyles.iconLink}
                >
                  <Image
                    src={socialIcon("linkedin")}
                    alt="LinkedIn"
                    width={19}
                    height={19}
                  />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={commonStyles.iconLink}
                >
                  <Image
                    src={socialIcon("github")}
                    alt="GitHub"
                    width={19}
                    height={19}
                  />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={commonStyles.iconLink}
                >
                  <Image
                    src={socialIcon("instagram")}
                    alt="Instagram"
                    width={19}
                    height={19}
                  />
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={commonStyles.footerBottom}>
          <p className={commonStyles.copyrightLabel}>{copyrightText}</p>
          <div className={commonStyles.bottomRight}>
            <Link href="/privacy-policy" className={commonStyles.bottomLink}>
              Privacy Policy
            </Link>
            <span className={commonStyles.dot} aria-hidden="true">
              •
            </span>
            <span className={commonStyles.madeIn}>Lahore, Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
