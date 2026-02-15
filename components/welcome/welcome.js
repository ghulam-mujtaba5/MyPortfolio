import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion, useAnimation } from "framer-motion";
import commonStyles from "./welcomeCommon.module.css"; // Common CSS
import lightStyles from "./welcomeLight.module.css"; // Light mode CSS
import darkStyles from "./welcomeDark.module.css"; // Dark mode CSS

const Introduction = () => {
  const { theme } = useTheme(); // Destructure theme from context
  const [helloText, setHelloText] = useState("");
  const [nameText, setNameText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
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
        scale: 1,
        transition: { duration: 1, ease: "easeOut" },
      });
    }
  }, [inView, controls]);

  useEffect(() => {
    let isMounted = true;
    const animateText = async () => {
      try {
        // Animate hello text
        for (let i = 0; i <= helloTextToDisplay.length; i++) {
          if (!isMounted) return;
          setHelloText(helloTextToDisplay.slice(0, i));
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
        await new Promise((resolve) => setTimeout(resolve, 400));
        for (let i = 0; i <= nameTextToDisplay.length; i++) {
          if (!isMounted) return;
          setNameText(nameTextToDisplay.slice(0, i));
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (isMounted) {
          controls.start({
            opacity: 1,
            y: 0,
            transition: { duration: 2, ease: "easeOut" },
          });
          setDescriptionText(descriptionTextToDisplay);
        }
      } catch (error) {
        // Animation error — non-critical, silently handled
      }
    };
    animateText();
    return () => {
      isMounted = false;
    };
  }, [controls]);

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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{
            scale: 1.05,
            color: "#4573df",
            transition: { duration: 0.3 },
          }} // Adjust hover effect
        >
          {helloText}
          <br />
          <motion.span
            className={`${commonStyles.ghulamMujtaba} ${theme === "dark" ? darkStyles.ghulamMujtaba : lightStyles.ghulamMujtaba}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 2,
              ease: "easeOut",
              delay: (helloText.length * 40) / 1000 + 0.5,
            }}
            whileHover={{
              scale: 1.1,
              color: "#4573df",
              transition: { duration: 0.3 },
            }} // Adjust hover effect
          >
            {nameText}
          </motion.span>
        </motion.h1>
        <motion.p
          className={`${commonStyles.paragraph} ${theme === "dark" ? darkStyles.paragraph : lightStyles.paragraph}`}
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          transition={{
            duration: 2,
            ease: "easeOut",
            delay:
              (helloText.length * 40 + 500 + nameText.length * 40) / 1000 + 1,
          }}
        >
          {descriptionText}
        </motion.p>
      </div>
    </section>
  );
};

export default Introduction;
