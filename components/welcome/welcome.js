import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion, useAnimation } from "framer-motion";
import commonStyles from "./welcomeCommon.module.css"; // Common CSS
import lightStyles from "./welcomeLight.module.css"; // Light mode CSS
import darkStyles from "./welcomeDark.module.css"; // Dark mode CSS

const Introduction = () => {
  const { theme } = useTheme(); // Destructure theme from context

  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const controls = useAnimation();

  const helloTextToDisplay = "Hello, I’m ";
  const nameTextToDisplay = "GHULAM MUJTABA";
  const descriptionTextToDisplay =
    "Software Engineer with a keen interest in developing innovative solutions through the integration of emerging technologies.";

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setInView(rect.top < window.innerHeight && rect.bottom >= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on initial load

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut", delay: 0.3 },
      });
    }
  }, [inView, controls]);

  return (
    <section
      className={`${commonStyles.container} ${theme === "dark" ? darkStyles.container : lightStyles.container}`}
      aria-label="Introduction"
    >
      <div
        ref={ref}
        className={`${commonStyles.textContainer} ${theme === "dark" ? darkStyles.textContainer : lightStyles.textContainer}`}
      >
        <motion.h1
          className={`${commonStyles.text} ${theme === "dark" ? darkStyles.text : lightStyles.text}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{
            scale: 1.05,
            color: "#4573df",
            transition: { duration: 0.3 },
          }}
        >
          {helloTextToDisplay}
          <br />
          <motion.span
            className={`${commonStyles.ghulamMujtaba} ${theme === "dark" ? darkStyles.ghulamMujtaba : lightStyles.ghulamMujtaba}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.3,
            }}
            whileHover={{
              scale: 1.1,
              color: "#4573df",
              transition: { duration: 0.3 },
            }}
          >
            {nameTextToDisplay}
          </motion.span>
        </motion.h1>
        <motion.p
          className={`${commonStyles.paragraph} ${theme === "dark" ? darkStyles.paragraph : lightStyles.paragraph}`}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.5,
          }}
        >
          {descriptionTextToDisplay}
        </motion.p>
      </div>
    </section>
  );
};

export default Introduction;
