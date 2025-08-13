import React, { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("auto"); // 'auto' | 'light' | 'dark'
  const [theme, setTheme] = useState("light"); // effective theme

  const prefersDark = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  };

  // init from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("themeMode");
      if (
        savedMode === "light" ||
        savedMode === "dark" ||
        savedMode === "auto"
      ) {
        setMode(savedMode);
      }
    } catch {}
  }, []);

  // apply effective theme based on mode
  useEffect(() => {
    const effective =
      mode === "auto" ? (prefersDark() ? "dark" : "light") : mode;
    setTheme(effective);
    try {
      localStorage.setItem("themeMode", mode);
      document.documentElement.setAttribute("data-theme", effective);
    } catch {}
  }, [mode]);

  // listen to system changes only in auto mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "auto") {
        const effective = mq.matches ? "dark" : "light";
        setTheme(effective);
        document.documentElement.setAttribute("data-theme", effective);
      }
    };
    mq.addEventListener
      ? mq.addEventListener("change", handler)
      : mq.addListener(handler);
    return () => {
      mq.removeEventListener
        ? mq.removeEventListener("change", handler)
        : mq.removeListener(handler);
    };
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setThemeMode = (nextMode) => {
    if (nextMode === "light" || nextMode === "dark" || nextMode === "auto") {
      setMode(nextMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
