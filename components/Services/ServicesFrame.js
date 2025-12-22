import React, { useRef, useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useScrollTrigger } from "../../hooks/useScrollAnimation";
import commonStyles from "./ServicesFrameCommon.module.css";
import lightStyles from "./ServicesFrame.module.css";
import darkStyles from "./ServicesFrameDark.module.css";

const ServicesFrame = () => {
  const { theme } = useTheme();
  const frameStyles = theme === "dark" ? darkStyles : lightStyles;
  const [visible, setVisible] = useState([]);
  const { ref: sectionRef, hasEntered: sectionEntered } = useScrollTrigger({ threshold: 0.1 });

  const skillCardRefs = useRef([]);

  const skillsData = [
    {
      title: "UI & UX Designing",
      titleicon: "Ui&Ux-icon.svg",
      skills: [
        {
          name: "Desktop Application",
          icon: "Desktop-App-icon.svg",
          darkIcon: "Desktop App Dark.svg",
        },
        { name: "Web Application", icon: "web app icon.svg" },
        {
          name: "Mobile App",
          icon: "mobile app icon.svg",
          darkIcon: "Mobile App Dark.svg",
        },
      ],
      cardClass: frameStyles.uiuxCard,
    },
    {
      title: "Development",
      titleicon: "devlopment-icon.svg",
      skills: [
        {
          name: "Desktop Application",
          icon: "Desktop-App-icon.svg",
          darkIcon: "Desktop App Dark.svg",
        },
        { name: "Web Application", icon: "web app icon.svg" },
        {
          name: "Mobile App",
          icon: "mobile app icon.svg",
          darkIcon: "Mobile App Dark.svg",
        },
      ],
      cardClass: frameStyles.developmentCard,
    },
    {
      title: "Data Science & AI",
      titleicon: "ds&ai-icon.svg",
      skills: [
        { name: "Data Scraping", icon: "data scrapping icon.svg" },
        { name: "Data Visualization", icon: "data visualization icon.svg" },
        { name: "Big Data Analytics", icon: "Big Data Analytics.svg" },
        { name: "AI Solution Development", icon: "Ai icon.svg" },
      ],
      cardClass: frameStyles.dataScienceCard,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const cardsVisible = skillCardRefs.current.map((ref) => {
        if (ref) {
          const { top, bottom } = ref.getBoundingClientRect();
          return bottom >= 0 && top <= window.innerHeight;
        }
        return false;
      });
      setVisible(cardsVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Trigger scroll check on component mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${commonStyles.skillFrame} ${frameStyles.skillFrame}`}
      aria-labelledby="Soft Built Services"
      style={{
        animation: sectionEntered ? 'fadeInUp 0.6s ease-out' : 'none',
        opacity: sectionEntered ? 1 : 0.7,
      }}
    >
      <h2
        id="Soft Built Services"
        className={`${commonStyles.skillsTitle} ${frameStyles.skillsTitle}`}
      >
        Our Services
      </h2>
      {skillsData.map((category, index) => (
        <article
          className={`${commonStyles.skillCard} ${frameStyles.skillCard} ${category.cardClass} ${visible[index] ? commonStyles.animateIn : ""}`}
          key={index}
          ref={(el) => (skillCardRefs.current[index] = el)}
          aria-labelledby={`${category.title.replace(/ /g, "-")}-title`}
          style={{
            animation: sectionEntered ? `fadeInUp 0.6s ease-out ${index * 100}ms both` : 'none',
            transition: 'all var(--duration-normal) var(--ease-out)',
            willChange: 'transform, opacity',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <header className={`${commonStyles.header} ${frameStyles.header}`}>
            <img
              className={`${commonStyles.categoryIcon} ${frameStyles.categoryIcon}`}
              alt={`${category.title} icon`}
              src={category.titleicon}
            />
            <h3
              id={`${category.title.replace(/ /g, "-")}-title`}
              className={`${commonStyles.title} ${frameStyles.title}`}
            >
              {category.title}
            </h3>
          </header>
          {category.skills.map((skill, skillIndex) => (
            <div
              key={skillIndex}
              className={`${commonStyles.skillRow} ${frameStyles.skillRow}`}
              style={{
                animation: sectionEntered ? `fadeInUp 0.6s ease-out ${(index * 100) + (skillIndex * 30)}ms both` : 'none',
              }}
            >
              <img
                className={`${commonStyles.icon} ${frameStyles.icon}`}
                alt={`${skill.name} icon`}
                src={
                  theme === "dark" && skill.darkIcon
                    ? skill.darkIcon
                    : skill.icon
                }
              />
              <div
                className={`${commonStyles.skillNameContainer} ${frameStyles.skillNameContainer}`}
              >
                <div
                  className={`${commonStyles.skillName} ${frameStyles.skillName}`}
                >
                  {skill.name}
                </div>
              </div>
            </div>
          ))}
        </article>
      ))}
    </section>
  );
};

export default ServicesFrame;
