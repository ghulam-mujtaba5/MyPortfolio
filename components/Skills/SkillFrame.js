import React, { useRef, useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import HoverLottie from "./HoverLottie";
import commonStyles from "./SkillFrameCommon.module.css";
import lightStyles from "./SkillFrame.module.css";
import darkStyles from "./SkillFrameDark.module.css";

// Skills curated for Ghulam's profile: Full Stack + AI + Mobile founder
// Only primary, differentiating tools are shown — not every dependency
const SKILL_CATEGORIES = [
  {
    id: "fullstack",
    label: "Full Stack",
    accent: "#4573df",
    lottie: "/lottie/web-coding.json",
    skills: [
      { name: "React",       light: "/skills/react.svg",       dark: "/skills/react.svg"       },
      { name: "Next.js",     light: "/skills/nextjs.svg",      dark: "/skills/nextjs-dark.svg" },
      { name: "Node.js",     light: "/skills/nodejs.svg",      dark: "/skills/nodejs.svg"      },
      { name: "TypeScript",  light: "/skills/typescript.svg",  dark: "/skills/typescript.svg"  },
      { name: "Spring Boot", light: "/skills/springboot.svg",  dark: "/skills/springboot.svg"  },
    ],
  },
  {
    id: "mobile",
    label: "Mobile & Design",
    accent: "#10b981",
    lottie: "/lottie/mobile-app.json",
    skills: [
      { name: "Flutter",      light: "/skills/flutter.svg",      dark: "/skills/flutter-dark.svg" },
      { name: "React Native", light: "/skills/react.svg",        dark: "/skills/react.svg"        },
      { name: "Figma",        light: "/skills/figma.svg",        dark: "/skills/figma.svg"        },
      { name: "Framer Motion",light: "/skills/framer.svg",       dark: "/skills/framer.svg"       },
    ],
  },
  {
    id: "ai",
    label: "AI & Machine Learning",
    accent: "#f59e0b",
    lottie: "/lottie/ai-brain.json",
    skills: [
      { name: "TensorFlow",   light: "/skills/tensorflow.svg",   dark: "/skills/tensorflow.svg"   },
      { name: "PyTorch",      light: "/skills/pytorch.svg",      dark: "/skills/pytorch.svg"      },
      { name: "Scikit-learn", light: "/skills/scikitlearn.svg",  dark: "/skills/scikitlearn.svg"  },
      { name: "OpenCV",       light: "/skills/opencv.svg",       dark: "/skills/opencv.svg"       },
    ],
  },
  {
    id: "tools",
    label: "Tools & Cloud",
    accent: "#a78bfa",
    lottie: "/lottie/cloud-devops.json",
    skills: [
      { name: "Docker",   light: "/skills/docker.svg",   dark: "/skills/docker.svg"   },
      { name: "AWS",      light: "/skills/aws.svg",      dark: "/skills/aws.svg"      },
      { name: "GraphQL",  light: "/skills/graphql.svg",  dark: "/skills/graphql.svg"  },
      { name: "Git",      light: "/skills/git.svg",      dark: "/skills/git.svg"      },
    ],
  },
];

const SkillFrame = () => {
  const { theme } = useTheme();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeCard, setActiveCard] = useState("");
  const frameRef = useRef(null);
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    const node = frameRef.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className={`${commonStyles.skillFrame} ${themeStyles.skillFrame}`}
    >
      <h2 className={`${commonStyles.skillsTitle} ${themeStyles.skillsTitle}`}>
        Skills
      </h2>

      <div className={commonStyles.categoriesList}>
        {SKILL_CATEGORIES.map((cat, catIdx) => (
          <div
            key={cat.id}
            className={`${commonStyles.categoryRow} ${hasAnimated ? commonStyles.rowVisible : ""}`}
            style={{ animationDelay: `${catIdx * 0.12}s` }}
          >
            {/* Left label */}
            <div className={`${commonStyles.rowLabel} ${themeStyles.rowLabel}`}>
              <span className={commonStyles.labelText}>{cat.label}</span>
            </div>

            {/* Divider */}
            <div
              className={`${commonStyles.rowDivider} ${themeStyles.rowDivider}`}
              style={{ background: `linear-gradient(90deg, ${cat.accent}44, transparent)` }}
            />

            {/* Skill cards */}
            <div className={commonStyles.skillCards}>
              {cat.skills.map((skill, skillIdx) => (
                <div
                  key={skill.name}
                  className={`${commonStyles.skillCard} ${themeStyles.skillCard} ${hasAnimated ? commonStyles.cardVisible : ""}`}
                  style={{
                    "--skill-accent": cat.accent,
                    animationDelay: `${catIdx * 0.12 + 0.15 + skillIdx * 0.07}s`,
                  }}
                  tabIndex={0}
                  onMouseEnter={() => setActiveCard(`${cat.id}-${skill.name}`)}
                  onMouseLeave={() => setActiveCard("")}
                  onPointerEnter={() => setActiveCard(`${cat.id}-${skill.name}`)}
                  onPointerLeave={() => setActiveCard("")}
                  onFocus={() => setActiveCard(`${cat.id}-${skill.name}`)}
                  onBlur={() => setActiveCard("")}
                  onClick={() => setActiveCard(`${cat.id}-${skill.name}`)}
                >
                  <HoverLottie
                    src={cat.lottie}
                    active={activeCard === `${cat.id}-${skill.name}`}
                    className={commonStyles.skillLottie}
                  />
                  <span className={commonStyles.skillGlow} aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theme === "dark" ? skill.dark : skill.light}
                    alt={`${skill.name} icon`}
                    className={commonStyles.skillIcon}
                    loading="lazy"
                  />
                  <span className={`${commonStyles.skillName} ${themeStyles.skillName}`}>
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillFrame;
