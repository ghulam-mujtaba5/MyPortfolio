// pages/admin/search.js
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import Tooltip from "../../components/Admin/Tooltip/Tooltip";
import Highlight from "../../components/Highlight/Highlight";
import Icon from "../../components/Admin/Icon/Icon";
import { useTheme } from "../../context/ThemeContext";
import commonStyles from "./articles/articles.common.module.css";
import lightStyles from "./articles/articles.light.module.css";
import darkStyles from "./articles/articles.dark.module.css";
import utilities from "../../styles/utilities.module.css";

export default function AdminSearchPage() {
  const { theme } = useTheme();
  const frameStyles = theme === "dark" ? darkStyles : lightStyles;
  const router = useRouter();
  const [q, setQ] = useState(router.query.q || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ariaMsg, setAriaMsg] = useState("");
  const inputRef = useRef(null);
  const resultRefs = useRef([]);
  const resultsListId = "admin-search-results";
  const optionId = (idx) => `admin-search-option-${idx}`;

  // Global shortcut: Ctrl/Cmd + K focuses the search field
  useEffect(() => {
    const onGlobalKey = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const queryQ = String(router.query.q || "");
    setQ(queryQ);
    if (queryQ) doSearch(queryQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.q]);

  // Debounced live search when typing (non-destructive: URL updates still via submit)
  useEffect(() => {
    const trimmed = String(q).trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      doSearch(trimmed);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const doSearch = async (query) => {
    const trimmed = String(query).trim();
    if (!trimmed) {
      setResults([]);
      setAriaMsg("Enter a query to search");
      return;
    }
    setLoading(true);
    setError("");
    setAriaMsg(`Searching for "${trimmed}"`);
    try {
      const res = await fetch(
        `/api/admin/search?q=${encodeURIComponent(trimmed)}&limit=20`,
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to search");
      const list = Array.isArray(data.data) ? data.data : [];
      setResults(list);
      setAriaMsg(
        `${list.length} result${list.length !== 1 ? "s" : ""} for "${trimmed}"`,
      );
    } catch (e) {
      setError(e.message || "Search failed");
      setAriaMsg("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    router.push(`/admin/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e) => {
    if (!["ArrowDown", "ArrowUp", "Enter", "Escape", "Home", "End", "PageDown", "PageUp"].includes(e.key)) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min((results.length || 0) - 1, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(-1, prev - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      if (results.length > 0) setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      if (results.length > 0) setActiveIndex(results.length - 1);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev < 0 ? 0 : prev + 5;
        return Math.min((results.length || 0) - 1, next);
      });
    } else if (e.key === "PageUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev < 0 ? -1 : prev - 5;
        return Math.max(-1, next);
      });
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        router.push(
          `/admin/articles/preview/${encodeURIComponent(results[activeIndex].slug)}`,
        );
      }
    } else if (e.key === "Escape") {
      // Clear active selection and announce
      setActiveIndex(-1);
      setAriaMsg("Selection cleared");
    }
  };

  // Announce active result changes for screen readers
  useEffect(() => {
    if (activeIndex >= 0 && results[activeIndex]) {
      const item = results[activeIndex];
      setAriaMsg(`Selected ${activeIndex + 1} of ${results.length}: ${item.title}`);
      // Ensure active item is visible
      const el = resultRefs.current[activeIndex];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex, results]);

  return (
    <AdminLayout title="Admin Search">
      <div className={commonStyles.visuallyHidden} aria-live="polite" role="status">
        {ariaMsg}
      </div>
      <div className={commonStyles.header}>
        <h1>Global Search</h1>
      </div>
      <form onSubmit={onSubmit} className={commonStyles.searchForm}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          ref={inputRef}
          placeholder="Search articles by title, tag, category..."
          className={`${commonStyles.searchInput} ${commonStyles.searchInputMax}`}
          aria-label="Search query"
          aria-controls={resultsListId}
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={results.length > 0}
          aria-owns={resultsListId}
        />
        {q ? (
          <button
            type="button"
            className={`${utilities.btn} ${utilities.btnIcon}`}
            onClick={() => {
              setQ("");
              setResults([]);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            title="Clear"
          >
            Clear
          </button>
        ) : null}
        <Tooltip content="Search">
          <button
            type="submit"
            className={`${utilities.btn} ${utilities.btnIcon} ${utilities.btnPrimary}`}
            title="Search"
            aria-label="Search"
          >
            Search
          </button>
        </Tooltip>
      </form>

      {loading && (
        <p className={`${commonStyles.mtSm} ${frameStyles.statusText}`} aria-live="polite">
          Searching…
        </p>
      )}
      {error && (
        <p className={`${commonStyles.mtSm} ${frameStyles.statusError}`}>{error}</p>
      )}

      <div className={commonStyles.mtMd} aria-busy={loading}>
        {results.length === 0 && !loading && q && <p>No results.</p>}
        {results.length > 0 && (
          <div>
            <div className={commonStyles.resultsMeta}>
              {results.length} result{results.length !== 1 ? "s" : ""}
            </div>
            <ul
              className={commonStyles.resultsList}
              id={resultsListId}
              role="listbox"
              aria-label="Search results"
              aria-busy={loading}
            >
              {results.map((r, idx) => {
                const isScheduled =
                  r.published &&
                  r.publishAt &&
                  new Date(r.publishAt) > new Date();
                const status = r.published
                  ? isScheduled
                    ? "Scheduled"
                    : "Published"
                  : "Draft";
                const active = idx === activeIndex;
                return (
                  <li
                    key={r._id}
                    id={optionId(idx)}
                    role="option"
                    aria-selected={active}
                    ref={(el) => (resultRefs.current[idx] = el)}
                    className={`${commonStyles.resultRow} ${active ? commonStyles.resultActive : ""}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() =>
                      router.push(
                        `/admin/articles/preview/${encodeURIComponent(r.slug)}`,
                      )
                    }
                  >
                    <div className={commonStyles.resultTitle}>
                      <Highlight text={r.title} highlight={q} />
                    </div>
                    <div className={commonStyles.resultMeta}>
                      <span
                        className={`${commonStyles.resultChip} ${status === "Draft" ? commonStyles.chipGray : status === "Scheduled" ? commonStyles.chipAmber : commonStyles.chipGreen}`}
                      >
                        {status}
                      </span>
                      <span className={commonStyles.resultDate}>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className={commonStyles.resultActions}>
                      <Tooltip content="Preview">
                        <Link
                          href={`/admin/articles/preview/${encodeURIComponent(r.slug)}`}
                          className={`${utilities.btn} ${utilities.btnIcon}`}
                          title="Preview"
                          aria-label="Preview"
                        >
                          <Icon name="eye" aria-hidden="true" />
                          <span className={commonStyles.visuallyHidden}>Preview</span>
                        </Link>
                      </Tooltip>
                      <Tooltip content="Open in list">
                        <Link
                          href={`/admin/articles?search=${encodeURIComponent(r.title)}`}
                          className={`${utilities.btn} ${utilities.btnIcon}`}
                          title="Open in list"
                          aria-label="Open in list"
                        >
                          <Icon name="open" aria-hidden="true" />
                          <span className={commonStyles.visuallyHidden}>Open in list</span>
                        </Link>
                      </Tooltip>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
