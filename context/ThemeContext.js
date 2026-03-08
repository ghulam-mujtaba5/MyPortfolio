import React, { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize from DOM attribute set by _document.js inline script to avoid hydration flash
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("themeMode");
        if (saved === "light" || saved === "dark" || saved === "auto") return saved;
      } catch {}
    }
    return "auto";
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      // Read what the _document.js script already applied
      const domTheme = document.documentElement.getAttribute("data-theme");
      if (domTheme === "dark" || domTheme === "light") return domTheme;
    }
    return "light";
  });

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
