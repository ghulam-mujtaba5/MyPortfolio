import React, { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize to static defaults for SSR/Hydration matching
  const [mode, setMode] = useState("auto");
  const [theme, setTheme] = useState("light");

  // Sync state with DOM on mount to avoid hydration flash 418 errors
  useEffect(() => {
    try {
      const saved = localStorage.getItem("themeMode");
      if (saved === "light" || saved === "dark" || saved === "auto") setMode(saved);
    } catch {}
    const domTheme = document.documentElement.getAttribute("data-theme");
    if (domTheme === "dark" || domTheme === "light") setTheme(domTheme);
  }, []);

  const prefersDark = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  };

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

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  // Allow components to render in isolation (tests/storybook) without crashing.
  // In the real app, `ThemeProvider` is mounted in `pages/_app.js`.
  if (ctx) return ctx;
  return {
    theme: "light",
    mode: "auto",
    toggleTheme: () => {},
    setThemeMode: () => {},
  };
};
