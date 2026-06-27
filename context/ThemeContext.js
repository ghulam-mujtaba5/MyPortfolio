import React, { useState, useEffect, useRef, createContext, useContext } from "react";

const ThemeContext = createContext();

function getEffectiveTheme(resolvedMode) {
  return resolvedMode === "auto"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : resolvedMode;
}

function applyTheme(effective) {
  document.documentElement.setAttribute("data-theme", effective);
  document.documentElement.style.colorScheme = effective;
}

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("auto");
  const [theme, setTheme] = useState("light");
  // Tracks whether the initial mount effect has already run so the
  // mode-change effect doesn't fire a second time on the same mount.
  const isMounted = useRef(false);

  // Mount-only: read storage once, sync DOM + React state in one pass.
  // This must be the single source of truth for the initial theme value
  // so that the mode-change effect below (which sees stale mode="auto")
  // cannot override it on the same render cycle.
  useEffect(() => {
    let savedMode = "auto";
    try {
      const stored = localStorage.getItem("themeMode");
      if (stored === "light" || stored === "dark" || stored === "auto") {
        savedMode = stored;
      }
    } catch {}

    const effective = getEffectiveTheme(savedMode);
    applyTheme(effective);
    setMode(savedMode);
    setTheme(effective);

    try {
      localStorage.setItem("themeMode", savedMode);
    } catch {}
  }, []);

  // Mode-change effect: skip the initial mount (handled above) to avoid
  // the race where it sees mode="auto" and overwrites the correct init.
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const effective = getEffectiveTheme(mode);
    applyTheme(effective);
    setTheme(effective);
    try {
      localStorage.setItem("themeMode", mode);
    } catch {}
  }, [mode]);

  // System preference listener — only active in auto mode.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "auto") {
        const effective = mq.matches ? "dark" : "light";
        applyTheme(effective);
        setTheme(effective);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
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
  if (ctx) return ctx;
  return {
    theme: "light",
    mode: "auto",
    toggleTheme: () => {},
    setThemeMode: () => {},
  };
};
