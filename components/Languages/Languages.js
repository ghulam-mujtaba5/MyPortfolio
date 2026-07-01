import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import commonStyles from "./LanguagesCommon.module.css";
import lightStyles from "./LanguagesLight.module.css";
import darkStyles from "./LanguagesDark.module.css";

const CATEGORIES = [
  {
    id: "web",
    label: "Web & Markup",
    accent: "#4573df",
    languages: [
      { name: "JavaScript", src: "/javascript-language-icon.svg", level: "Primary" },
      { name: "HTML", src: "/html-language-icon.svg", level: "Primary" },
      { name: "CSS", src: "/css-language-icon.svg", level: "Proficient" },
    ],
  },
  {
    id: "ai",
    label: "AI & Data Science",
    accent: "#38bdf8",
    languages: [
      { name: "Python", src: "/python-language-icon.svg", level: "Primary" },
      { name: "R", src: "/r-language-icon.svg", level: "Familiar" },
    ],
  },
  {
    id: "systems",
    label: "Systems & OOP",
    accent: "#a78bfa",
    languages: [
      { name: "Java", src: "/java.png", level: "Proficient" },
      { name: "C++", src: "/cpp-language-icon.png", level: "Proficient" },
      { name: "C", src: "/c-language-icon.svg", level: "Familiar" },
    ],
  },
];

const LEVEL_STYLES = {
  Primary: {
    light: { color: "#4573df", background: "rgba(69,115,223,0.1)", borderColor: "rgba(69,115,223,0.22)" },
    dark:  { color: "#7eb3ff", background: "rgba(126,179,255,0.12)", borderColor: "rgba(126,179,255,0.22)" },
  },
  Proficient: {
    light: { color: "#16a34a", background: "rgba(22,163,74,0.1)", borderColor: "rgba(22,163,74,0.22)" },
    dark:  { color: "#4ade80", background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.2)" },
  },
  Familiar: {
    light: { color: "#64748b", background: "rgba(100,116,139,0.1)", borderColor: "rgba(100,116,139,0.25)" },
    dark:  { color: "#94a3b8", background: "rgba(148,163,184,0.1)", borderColor: "rgba(148,163,184,0.22)" },
  },
};

// Staggered animation delays per card, computed once at module load
const CARD_DELAYS = {};
let _di = 0;
CATEGORIES.forEach((cat) => {
  cat.languages.forEach((lang) => {
    CARD_DELAYS[`${cat.id}-${lang.name}`] = `${0.18 + _di++ * 0.07}s`;
  });
});

const Frame = () => {
  const { theme } = useTheme();
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    const node = sectionRef.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${commonStyles.section} ${themeStyles.section}`}
      aria-labelledby="languages-title"
    >
      <h2 id="languages-title" className={commonStyles.sectionTitle}>
        Languages
      </h2>

      <div className={commonStyles.categoriesGrid}>
        {CATEGORIES.map((cat, catIdx) => (
          <div
            key={cat.id}
            className={`${commonStyles.categoryBlock} ${themeStyles.categoryBlock} ${hasAnimated ? commonStyles.blockVisible : ""}`}
            style={{ animationDelay: `${catIdx * 0.1}s` }}
          >
            <div className={commonStyles.categoryLabel}>
              <span
                className={commonStyles.categoryDot}
                style={{ background: cat.accent }}
              />
              {cat.label}
            </div>

            <div className={commonStyles.langList}>
              {cat.languages.map((lang) => {
                const badgeStyle = LEVEL_STYLES[lang.level][theme] || LEVEL_STYLES[lang.level].light;
                return (
                  <div
                    key={lang.name}
                    className={`${commonStyles.langCard} ${themeStyles.langCard} ${hasAnimated ? commonStyles.cardVisible : ""}`}
                    style={{ animationDelay: CARD_DELAYS[`${cat.id}-${lang.name}`] }}
                  >
                    <div className={commonStyles.iconWrap}>
                      <Image
                        src={lang.src}
                        alt={`${lang.name} icon`}
                        width={30}
                        height={30}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <span className={commonStyles.langName}>{lang.name}</span>
                    <span
                      className={commonStyles.levelBadge}
                      style={badgeStyle}
                    >
                      {lang.level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Frame;
