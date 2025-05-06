
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Theme context
import commonStyles from './BadgeCommon.module.css'; // Common styles
import lightStyles from './BadgeLight.module.css';   // Light theme styles
import darkStyles from './BadgeDark.module.css';     // Dark theme styles

const BadgeScroll = ({
  showCertificationBadge = true,
  showAdditionalCertificationBadge = true
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Trigger animation once
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);
  const badgeData = [
    {
      src: '/Badges/meta-front-end-developer-certificate.png',
      alt: 'Meta Front-End Developer Certificate Badge',
      link: 'https://www.credly.com/badges/93faaef5-98e6-4bac-b859-86078fa46048/public_url',
      description: 'Meta Front-End Developer Certificate via Credly.'
    },
    {
      src: '/Badges/google-advanced-data-analytics-certificate.png',
      alt: 'Google Advanced Data Analytics Certificate Badge',
      link: 'https://www.credly.com/badges/84029f3d-2865-44f4-87fb-9a9117d5f665/public_url',
      description: 'Google Advanced Data Analytics Certificate via Credly.'
    },
    {
      src: '/Badges/google-ai-essentials.png',
      alt: 'Google AI Essentials Badge',
      link: 'https://www.credly.com/badges/4fd67c5c-8d16-47b2-a4a4-c503b82ae42c/public_url',
      description: 'Google AI Essentials Certificate via Credly.'
    },
    {
      src: '/Badges/google-cybersecurity-professional-certificate-v2.png',
      alt: 'Google Cybersecurity Professional Certificate Badge',
      link: 'https://www.credly.com/badges/2814337b-8dd5-4215-8717-102a438cef5c/public_url',
      description: 'Google Cybersecurity Professional Certificate v2 via Credly.'
    },
    {
      src: '/Badges/google-data-analytics-professional-certificate.2.png',
      alt: 'Google Data Analytics Professional Certificate Badge',
      link: 'https://www.credly.com/badges/541285d6-1075-47ba-94df-c497ecd15253/public_url',
      description: 'Google Data Analytics Professional Certificate via Credly.'
    },
    {
      src: '/Badges/google-project-management-professional-certificate-.1.png',
      alt: 'Google Project Management Professional Certificate Badge',
      link: 'https://www.credly.com/badges/80aa4757-d448-4408-9aea-8fce8c271bac/public_url',
      description: 'Google Project Management Professional Certificate via Credly.'
    },
    {
      src: '/Badges/google-ux-design-professional-certificate.2.png',
      alt: 'Google UX Design Professional Certificate Badge',
      link: 'https://www.credly.com/earner/earned/share/9bd08c36-473a-43a4-bd93-77352b3205c5',
      description: 'Google UX Design Professional Certificate via Credly.'
    },
  
    {
      src: '/Badges/microsoft-office-specialist-word-associate-office-2019.png',
      alt: 'Microsoft Office Specialist Word Associate Office 2019 Badge',
      link: 'https://www.credly.com/badges/72f19101-a7c0-4371-bb8b-431d105ed3bb/public_url',
      description: 'Microsoft Office Specialist Word Associate Office 2019 Certificate via Credly.'
    },
    {
      src: '/Badges/meta-android-developer-certificate.png', // Added the new badge
      alt: 'Meta Android Developer Certificate Badge',
      link: 'https://www.credly.com/badges/5eb82da6-f411-4aea-8c6f-30c96710026f/public_url',
      description: 'Meta Android Developer Certificate via Credly.'
    }
  ];
  

  const themeStyle = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <section
      ref={containerRef}
      className={`${commonStyles.frameContainer} ${themeStyle.frameContainer}`}
      aria-labelledby="badge-title"
    >
      <h2 id="badge-title" className={commonStyles.title}>Certifications</h2>
      <div className={`${commonStyles.badgeContainer} ${isVisible ? commonStyles.animate : ''}`}>
        <div className={commonStyles.badgeWrapper}>
          {badgeData.concat(badgeData).map((badge, index) => ( // Duplicating the badgeData array
            <div key={index} className={commonStyles.badge}>
              <a
                href={badge.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${badge.alt}`}
              >
                <img
                  src={badge.src}
                  alt={badge.alt}
                  title={badge.description}
                  className={commonStyles.badgeImage}
                  loading="lazy"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BadgeScroll;
