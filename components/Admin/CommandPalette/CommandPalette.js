import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { useTheme } from "../../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./CommandPalette.premium.module.css";

// Icons for command palette items
const PaletteIcons = {
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  dashboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  article: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  project: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  media: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  user: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  analytics: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  theme: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>,
  plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17v5"/><path d="M9 3l6 6"/><path d="M6 6l6 6"/></svg>,
  logs: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  resume: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  play: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  command: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>,
  arrow: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

// Storage key for recent searches
const RECENT_SEARCHES_KEY = 'admin:recentSearches:v1';
const MAX_RECENT = 5;

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const router = useRouter();
  const { setThemeMode, toggleTheme } = useTheme();
  const isCommandMode = query.startsWith(">");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const prevFocusRef = useRef(null);
  const resultsRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch {}
    }
  }, []);

  // Save search to recent
  const saveToRecent = useCallback((searchItem) => {
    if (!searchItem || !searchItem.title) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item._id !== searchItem._id);
      const newRecent = [{ ...searchItem, searchedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
      } catch {}
      return newRecent;
    });
  }, []);

  // Allow other components (e.g., AdminLayout top bar) to open/close the palette.
  useEffect(() => {
    const onToggle = (e) => {
      const detail = (e && e.detail) || {};
      const shouldOpen = typeof detail.open === "boolean" ? detail.open : true;
      if (typeof detail.query === "string") {
        setQuery(detail.query);
      }
      setIsOpen(shouldOpen);
    };
    window.addEventListener("admin:cmdk", onToggle);
    return () => window.removeEventListener("admin:cmdk", onToggle);
  }, []);

  // Command categories for better organization
  const commandCategories = useMemo(() => ({
    navigation: { label: 'Navigation', icon: PaletteIcons.dashboard },
    create: { label: 'Create', icon: PaletteIcons.plus },
    theme: { label: 'Appearance', icon: PaletteIcons.theme },
    tools: { label: 'Tools', icon: PaletteIcons.settings },
  }), []);

  const commands = useMemo(() => {
    const runScheduler = async () => {
      try {
        const res = await fetch("/api/admin/scheduler/publish", {
          method: "POST",
        });
        const data = await res.json();
        if (data.success) {
          // Use notification system instead of alert
          window.dispatchEvent(new CustomEvent('admin:notification', {
            detail: { type: 'success', message: `Published ${data.publishedCount} scheduled project(s).` }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('admin:notification', {
            detail: { type: 'error', message: "Scheduler failed: " + (data.message || "Unknown error") }
          }));
        }
      } catch (e) {
        window.dispatchEvent(new CustomEvent('admin:notification', {
          detail: { type: 'error', message: "Scheduler error. Check console." }
        }));
        console.error(e);
      }
    };
    return [
      // Navigation commands
      {
        id: "go-dashboard",
        label: "Go to Dashboard",
        description: "View overview and stats",
        icon: PaletteIcons.dashboard,
        category: "navigation",
        keywords: ["home", "main", "overview"],
        action: () => router.push("/admin/dashboard"),
      },
      {
        id: "go-articles",
        label: "Go to Articles",
        description: "Manage blog articles",
        icon: PaletteIcons.article,
        category: "navigation",
        keywords: ["blog", "posts", "content"],
        action: () => router.push("/admin/articles"),
      },
      {
        id: "go-projects",
        label: "Go to Projects",
        description: "Manage portfolio projects",
        icon: PaletteIcons.project,
        category: "navigation",
        keywords: ["portfolio", "work"],
        action: () => router.push("/admin/projects"),
      },
      {
        id: "go-media",
        label: "Go to Media",
        description: "Media library and uploads",
        icon: PaletteIcons.media,
        category: "navigation",
        keywords: ["images", "files", "upload"],
        action: () => router.push("/admin/media"),
      },
      {
        id: "go-resume",
        label: "Go to Resume",
        description: "Edit resume/CV",
        icon: PaletteIcons.resume,
        category: "navigation",
        keywords: ["cv", "experience"],
        action: () => router.push("/admin/resume"),
      },
      {
        id: "go-search",
        label: "Go to Search",
        description: "Advanced search page",
        icon: PaletteIcons.search,
        category: "navigation",
        action: () => router.push("/admin/search"),
      },
      {
        id: "go-pins",
        label: "Go to Pins",
        description: "Manage pinned items",
        icon: PaletteIcons.pin,
        category: "navigation",
        action: () => router.push("/admin/pins"),
      },
      {
        id: "go-users",
        label: "Go to Users",
        description: "User management",
        icon: PaletteIcons.user,
        category: "navigation",
        action: () => router.push("/admin/users"),
      },
      {
        id: "go-analytics",
        label: "Go to Analytics",
        description: "View analytics and trends",
        icon: PaletteIcons.analytics,
        category: "navigation",
        keywords: ["stats", "metrics"],
        action: () => router.push("/admin/analytics"),
      },
      {
        id: "go-audit-logs",
        label: "Go to Audit Logs",
        description: "View system activity logs",
        icon: PaletteIcons.logs,
        category: "navigation",
        keywords: ["history", "activity"],
        action: () => router.push("/admin/audit-logs"),
      },
      // Create commands
      {
        id: "new-article",
        label: "New Article",
        description: "Create a new blog article",
        icon: PaletteIcons.plus,
        category: "create",
        keywords: ["create", "add", "blog", "post"],
        action: () => router.push("/admin/articles/new"),
      },
      {
        id: "new-project",
        label: "New Project",
        description: "Create a new portfolio project",
        icon: PaletteIcons.plus,
        category: "create",
        keywords: ["create", "add", "portfolio"],
        action: () => router.push("/admin/projects/new"),
      },
      // Theme commands
      {
        id: "theme-toggle",
        label: "Toggle Theme",
        description: "Switch between light and dark mode",
        icon: PaletteIcons.theme,
        category: "theme",
        keywords: ["dark", "light", "mode", "appearance"],
        action: () => toggleTheme && toggleTheme(),
      },
      {
        id: "theme-light",
        label: "Switch to Light Mode",
        description: "Use light color scheme",
        icon: PaletteIcons.theme,
        category: "theme",
        keywords: ["bright", "day"],
        action: () => setThemeMode("light"),
      },
      {
        id: "theme-dark",
        label: "Switch to Dark Mode",
        description: "Use dark color scheme",
        icon: PaletteIcons.theme,
        category: "theme",
        keywords: ["night"],
        action: () => setThemeMode("dark"),
      },
      {
        id: "theme-auto",
        label: "Use System Theme",
        description: "Follow system preference",
        icon: PaletteIcons.theme,
        category: "theme",
        keywords: ["automatic", "system"],
        action: () => setThemeMode("auto"),
      },
      // Tools
      {
        id: "run-scheduler",
        label: "Run Scheduler",
        description: "Publish scheduled projects now",
        icon: PaletteIcons.play,
        category: "tools",
        keywords: ["publish", "schedule"],
        action: runScheduler,
      },
    ];
  }, [router, setThemeMode, toggleTheme]);

  const handleNavigation = useCallback(
    (item) => {
      // Save to recent searches
      saveToRecent(item);
      
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
    },
    [router, saveToRecent],
  );

  const handleCommand = (cmd) => {
    try {
      cmd.action && cmd.action();
    } finally {
      setIsOpen(false);
    }
  };

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  }, []);

  // Get icon for result type
  const getResultIcon = useCallback((item) => {
    if (item.__kind === 'command') {
      return item.icon || PaletteIcons.command;
    }
    switch (item.type) {
      case 'Article': return PaletteIcons.article;
      case 'Project': return PaletteIcons.project;
      case 'User': return PaletteIcons.user;
      default: return PaletteIcons.search;
    }
  }, []);

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
          setActiveIndex((prev) => {
            const newIndex = (prev + 1) % results.length;
            // Scroll active item into view
            setTimeout(() => {
              const activeEl = resultsRef.current?.querySelector(`[data-index="${newIndex}"]`);
              activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 0);
            return newIndex;
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((prev) => {
            const newIndex = (prev - 1 + results.length) % results.length;
            setTimeout(() => {
              const activeEl = resultsRef.current?.querySelector(`[data-index="${newIndex}"]`);
              activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 0);
            return newIndex;
          });
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
        } else if (e.key === "Tab") {
          // Allow cycling through category filters
          e.preventDefault();
          const categories = Object.keys(commandCategories);
          if (selectedCategory === null) {
            setSelectedCategory(categories[0]);
          } else {
            const currentIndex = categories.indexOf(selectedCategory);
            if (e.shiftKey) {
              setSelectedCategory(currentIndex === 0 ? null : categories[currentIndex - 1]);
            } else {
              setSelectedCategory(currentIndex === categories.length - 1 ? null : categories[currentIndex + 1]);
            }
          }
        }
      }
    },
    [isOpen, results, activeIndex, handleNavigation, commandCategories, selectedCategory],
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
      setSelectedCategory(null);
      setIsSearching(false);
      // restore focus back to previously focused element when closing
      try {
        const el = prevFocusRef.current;
        if (el && typeof el.focus === "function") el.focus();
      } catch {}
    }
  }, [isOpen]);

  // Manage initial focus and focus trapping when open
  useEffect(() => {
    if (isOpen) {
      // remember previously focused element
      try {
        prevFocusRef.current = document.activeElement;
      } catch {}
      // focus input
      try {
        setTimeout(() => {
          if (inputRef.current && typeof inputRef.current.focus === "function") {
            inputRef.current.focus();
          }
        }, 0);
      } catch {}
      // focus trap within container
      const onKeyDown = (e) => {
        if (e.key !== "Tab") return;
        const root = containerRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [isOpen]);

  useEffect(() => {
    // Command mode: filter local commands
    if (isCommandMode) {
      const q = query.slice(1).toLowerCase();
      let filtered = commands.filter((c) => {
        const matchLabel = c.label.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q);
        const matchKeywords = c.keywords?.some(k => k.toLowerCase().includes(q));
        return matchLabel || matchDesc || matchKeywords;
      });
      
      // Filter by category if selected
      if (selectedCategory) {
        filtered = filtered.filter(c => c.category === selectedCategory);
      }
      
      const mappedResults = filtered.map((c) => ({
        __kind: "command",
        _id: c.id,
        title: c.label,
        description: c.description,
        type: "Command",
        category: c.category,
        icon: c.icon,
        action: c.action,
      }));
      setResults(mappedResults);
      setActiveIndex(mappedResults.length ? 0 : -1);
      return;
    }

    // Search mode
    if (query.length < 2) {
      // Show recent searches when query is empty
      if (query.length === 0 && recentSearches.length > 0) {
        const recentResults = recentSearches.map(item => ({
          ...item,
          __kind: 'recent',
        }));
        setResults(recentResults);
        setActiveIndex(recentResults.length ? 0 : -1);
      } else {
        setResults([]);
        setActiveIndex(-1);
      }
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query)}`,
        );
        if (res.ok) {
          const data = await res.json();
          // Handle both { data: [...] } and direct array responses
          const items = data.data || data;
          const mappedResults = Array.isArray(items) ? items.map(item => ({
            ...item,
            type: item.type || 'Article',
            title: item.title || item.name,
          })) : [];
          setResults(mappedResults);
          setActiveIndex(mappedResults.length ? 0 : -1);
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => fetchResults(), 250);
    return () => clearTimeout(debounce);
  }, [query, isCommandMode, commands, recentSearches, selectedCategory]);

  if (!isOpen) return null;

  // Group results by category for commands
  const groupedResults = useMemo(() => {
    if (!isCommandMode) return null;
    const groups = {};
    results.forEach(item => {
      const cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [results, isCommandMode]);

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        onClick={() => setIsOpen(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="command-palette-title"
          aria-describedby="command-palette-help"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="command-palette-title" className="sr-only">Command Palette</h2>
          
          {/* Search Input */}
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              {isSearching ? (
                <motion.span
                  className={styles.spinner}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <PaletteIcons.search />
              )}
            </span>
            <input
              type="text"
              placeholder={
                isCommandMode
                  ? "Type a command..."
                  : "Search articles, projects, or type > for commands..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.input}
              ref={inputRef}
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button 
                className={styles.clearButton}
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Filters (for command mode) */}
          {isCommandMode && (
            <div className={styles.categoryFilters}>
              <button
                className={`${styles.categoryButton} ${selectedCategory === null ? styles.categoryActive : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {Object.entries(commandCategories).map(([key, { label, icon: Icon }]) => (
                <button
                  key={key}
                  className={`${styles.categoryButton} ${selectedCategory === key ? styles.categoryActive : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Results List */}
          <div className={styles.resultsContainer} ref={resultsRef}>
            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && !isCommandMode && (
              <div className={styles.resultSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>
                    <PaletteIcons.clock />
                    Recent Searches
                  </span>
                  <button 
                    className={styles.clearRecentButton}
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </button>
                </div>
                <ul className={styles.resultsList}>
                  {results.map((item, index) => {
                    const Icon = getResultIcon(item);
                    return (
                      <li
                        key={item._id}
                        data-index={index}
                        className={`${styles.resultItem} ${index === activeIndex ? styles.activeItem : ''}`}
                        onClick={() => handleNavigation(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <span className={styles.resultIcon}>
                          <Icon />
                        </span>
                        <div className={styles.resultContent}>
                          <span className={styles.resultTitle}>{item.title || item.name}</span>
                          {item.type && (
                            <span className={styles.resultMeta}>{item.type}</span>
                          )}
                        </div>
                        <span className={styles.resultAction}>
                          <PaletteIcons.arrow />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Search Results */}
            {query.length >= 2 && !isCommandMode && results.length > 0 && (
              <div className={styles.resultSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>
                    <PaletteIcons.search />
                    Search Results
                  </span>
                  <span className={styles.resultCount}>{results.length} found</span>
                </div>
                <ul className={styles.resultsList}>
                  {results.map((item, index) => {
                    const Icon = getResultIcon(item);
                    return (
                      <li
                        key={item._id}
                        data-index={index}
                        className={`${styles.resultItem} ${index === activeIndex ? styles.activeItem : ''}`}
                        onClick={() => handleNavigation(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <span className={styles.resultIcon}>
                          <Icon />
                        </span>
                        <div className={styles.resultContent}>
                          <span className={styles.resultTitle}>{item.title || item.name}</span>
                          <span className={styles.resultMeta}>
                            {item.type}
                            {item.published === false && <span className={styles.draftBadge}>Draft</span>}
                          </span>
                        </div>
                        <span className={styles.resultAction}>
                          <PaletteIcons.arrow />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Command Results (Grouped) */}
            {isCommandMode && groupedResults && Object.entries(groupedResults).map(([category, items]) => {
              const CategoryIcon = commandCategories[category]?.icon;
              return (
              <div key={category} className={styles.resultSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>
                    {CategoryIcon && <CategoryIcon />}
                    {commandCategories[category]?.label || category}
                  </span>
                </div>
                <ul className={styles.resultsList}>
                  {items.map((item) => {
                    const globalIndex = results.findIndex(r => r._id === item._id);
                    const Icon = item.icon || PaletteIcons.command;
                    return (
                      <li
                        key={item._id}
                        data-index={globalIndex}
                        className={`${styles.resultItem} ${globalIndex === activeIndex ? styles.activeItem : ''}`}
                        onClick={() => handleCommand(item)}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                      >
                        <span className={styles.resultIcon}>
                          <Icon />
                        </span>
                        <div className={styles.resultContent}>
                          <span className={styles.resultTitle}>{item.title}</span>
                          {item.description && (
                            <span className={styles.resultDescription}>{item.description}</span>
                          )}
                        </div>
                        <span className={styles.resultAction}>
                          <PaletteIcons.arrow />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              );
            })}

            {/* Empty State */}
            {query.length >= 2 && results.length === 0 && !isSearching && (
              <div className={styles.emptyState}>
                <PaletteIcons.search />
                <p>No results found for "{query}"</p>
                <span>Try searching for something else or type &gt; for commands</span>
              </div>
            )}

            {/* Quick Commands (when no query) */}
            {query.length === 0 && !isCommandMode && recentSearches.length === 0 && (
              <div className={styles.resultSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>
                    <PaletteIcons.command />
                    Quick Actions
                  </span>
                </div>
                <ul className={styles.resultsList}>
                  {commands.filter(c => c.category === 'create').map((cmd, index) => (
                    <li
                      key={cmd.id}
                      data-index={index}
                      className={`${styles.resultItem} ${index === activeIndex ? styles.activeItem : ''}`}
                      onClick={() => { cmd.action(); setIsOpen(false); }}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span className={styles.resultIcon}>
                        <cmd.icon />
                      </span>
                      <div className={styles.resultContent}>
                        <span className={styles.resultTitle}>{cmd.label}</span>
                        <span className={styles.resultDescription}>{cmd.description}</span>
                      </div>
                      <span className={styles.resultAction}>
                        <PaletteIcons.arrow />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer with tips */}
          <div id="command-palette-help" className={styles.tipsRow}>
            <div className={styles.tipGroup}>
              <span className={styles.tipItem}>
                <kbd>↑</kbd><kbd>↓</kbd> Navigate
              </span>
              <span className={styles.tipItem}>
                <kbd>↵</kbd> Select
              </span>
              <span className={styles.tipItem}>
                <kbd>esc</kbd> Close
              </span>
            </div>
            <div className={styles.tipGroup}>
              <span className={styles.tipHint}>Type <kbd>&gt;</kbd> for commands</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
