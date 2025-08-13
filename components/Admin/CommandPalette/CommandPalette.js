import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useTheme } from "../../../context/ThemeContext";

import commonStyles from "./CommandPalette.module.css";
import lightStyles from "./CommandPalette.light.module.css";
import darkStyles from "./CommandPalette.dark.module.css";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const { theme, mode, setThemeMode, toggleTheme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const isCommandMode = query.startsWith(">");

  const commands = useMemo(() => {
    const runScheduler = async () => {
      try {
        const res = await fetch("/api/admin/scheduler/publish", {
          method: "POST",
        });
        const data = await res.json();
        if (data.success) {
          alert(`Published ${data.publishedCount} scheduled project(s).`);
        } else {
          alert("Scheduler failed: " + (data.message || "Unknown error"));
        }
      } catch (e) {
        alert("Scheduler error. Check console.");
        console.error(e);
      }
    };
    return [
      {
        id: "go-dashboard",
        label: "Go to Dashboard",
        action: () => router.push("/admin/dashboard"),
      },
      {
        id: "go-articles",
        label: "Go to Articles",
        action: () => router.push("/admin/articles"),
      },
      {
        id: "go-projects",
        label: "Go to Projects",
        action: () => router.push("/admin/projects"),
      },
      {
        id: "go-analytics",
        label: "Go to Analytics",
        action: () => router.push("/admin/analytics"),
      },
      {
        id: "new-article",
        label: "New Article",
        action: () => router.push("/admin/articles/new"),
      },
      {
        id: "new-project",
        label: "New Project",
        action: () => router.push("/admin/projects/new"),
      },
      {
        id: "theme-toggle",
        label: "Toggle Theme",
        action: () => toggleTheme && toggleTheme(),
      },
      {
        id: "theme-light",
        label: "Theme: Light",
        action: () => setThemeMode("light"),
      },
      {
        id: "theme-dark",
        label: "Theme: Dark",
        action: () => setThemeMode("dark"),
      },
      {
        id: "theme-auto",
        label: "Theme: Auto",
        action: () => setThemeMode("auto"),
      },
      {
        id: "run-scheduler",
        label: "Run Scheduler: Publish Scheduled Projects",
        action: runScheduler,
      },
    ];
  }, [router, setThemeMode, toggleTheme]);

  const handleNavigation = (item) => {
    let path = "/admin";
    switch (item.type) {
      case "Article":
        path += `/articles/edit/${item._id}`;
        break;
      case "Project":
        path += `/projects/edit/${item._id}`;
        break;
      case "User":
        path += `/users/edit/${item._id}`;
        break;
      default:
        return;
    }
    router.push(path);
    setIsOpen(false);
  };

  const handleCommand = (cmd) => {
    try {
      cmd.action && cmd.action();
    } finally {
      setIsOpen(false);
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex(
            (prev) => (prev - 1 + results.length) % results.length,
          );
        } else if (e.key === "Enter" && activeIndex >= 0) {
          e.preventDefault();
          const item = results[activeIndex];
          if (item.__kind === "command") {
            handleCommand(item);
          } else {
            handleNavigation(item);
          }
        } else if (e.key === "Escape") {
          setIsOpen(false);
        }
      }
    },
    [isOpen, results, activeIndex, handleNavigation],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    // Command mode: filter local commands
    if (isCommandMode) {
      const q = query.slice(1).toLowerCase();
      const filtered = commands
        .filter((c) => c.label.toLowerCase().includes(q))
        .map((c) => ({
          __kind: "command",
          _id: c.id,
          title: c.label,
          type: "Command",
          action: c.action,
        }));
      setResults(filtered);
      setActiveIndex(filtered.length ? 0 : -1);
      return;
    }

    // Search mode
    if (query.length < 2) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setActiveIndex(data.length ? 0 : -1);
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      }
    };

    const debounce = setTimeout(() => fetchResults(), 250);
    return () => clearTimeout(debounce);
  }, [query, isCommandMode, commands]);

  if (!isOpen) return null;

  return (
    <div
      className={`${commonStyles.overlay} ${themeStyles.overlay}`}
      onClick={() => setIsOpen(false)}
    >
      <div
        className={`${commonStyles.modal} ${themeStyles.modal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder={
            isCommandMode
              ? "Type a command (e.g., >theme dark, >new project)"
              : "Search articles, projects, users... (⌘/Ctrl+K)"
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${commonStyles.input} ${themeStyles.input}`}
          autoFocus
        />
        {results.length > 0 && (
          <ul className={commonStyles.resultsList}>
            {results.map((item, index) => (
              <li
                key={item._id}
                className={`${commonStyles.resultItem} ${index === activeIndex ? commonStyles.activeItem : ""}`}
                onClick={() =>
                  item.__kind === "command"
                    ? handleCommand(item)
                    : handleNavigation(item)
                }
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span>{item.title || item.name}</span>
                <span
                  className={`${commonStyles.resultType} ${themeStyles.resultType}`}
                >
                  {item.__kind === "command" ? "Command" : item.type}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          <span>Tip: Type &gt; to run commands</span>
          <span>Navigate: ↑/↓ • Run: Enter • Close: Esc</span>
        </div>
      </div>
    </div>
  );
}
