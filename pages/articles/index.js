import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import SEO from "../../components/SEO";
import NavBarDesktop from "../../components/NavBar_Desktop/nav-bar";
import NavBarMobile from "../../components/NavBar_Mobile/NavBar-mobile";
import Footer from "../../components/Footer/Footer";

import { useRouter } from "next/router";
import ArticleCard from "../../components/Articles/ArticleCard";
import listCss from "../../components/Articles/ArticlesListPage.module.css";
import { useTheme } from "../../context/ThemeContext";
import lightCss from "../../components/Articles/ArticlesListPage.light.module.css";
import darkCss from "../../components/Articles/ArticlesListPage.dark.module.css";
import Spinner from "../../components/Spinner/Spinner";

export default function ArticlesPage() {
  const { theme } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const router = useRouter();
  const page = useMemo(
    () => Number(router.query.page || 1),
    [router.query.page],
  );
  const limit = useMemo(
    () => Number(router.query.limit || 9),
    [router.query.limit],
  );
  const search = useMemo(
    () => String(router.query.search || ""),
    [router.query.search],
  );
  const tag = useMemo(() => String(router.query.tag || ""), [router.query.tag]);
  const sort = useMemo(
    () => String(router.query.sort || "relevance"),
    [router.query.sort],
  );

  // Local UI state for search input with debounce
  const [q, setQ] = useState(search);
  useEffect(() => setQ(search), [search]);
  useEffect(() => {
    const id = setTimeout(() => {
      // push only if value actually changed to avoid loops
      if (q !== search) {
        const newQuery = { ...router.query };
        if (q) newQuery.search = q; else delete newQuery.search;
        newQuery.page = 1;
        router.push({ pathname: "/articles", query: newQuery }, undefined, { shallow: true });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [q]);

  // Category filters UI (mirrors Projects page tag filter)
  const CATEGORY_FILTERS = useMemo(
    () => [
      "All",
      "Academics & Learning",
      "Projects & Career",
      "Engineering & Development",
      "Tech Insights & Trends",
      "Others",
    ],
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Normalize and map raw category strings to one of our 5 display buckets
  const mapToBucket = (label) => {
    const normalized = String(label || "").toLowerCase();
    if (normalized.includes("academic") || normalized.includes("learning")) return "Academics & Learning";
    if (normalized.includes("project") || normalized.includes("career")) return "Projects & Career";
    if (normalized.includes("engineer") || normalized.includes("development")) return "Engineering & Development";
    if (normalized.includes("tech") || normalized.includes("trend")) return "Tech Insights & Trends";
    return "Others";
  };

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "All") return articles;
    return (articles || []).filter((a) => {
      const cats = Array.isArray(a?.categories) ? a.categories : [];
      const buckets = cats.map(mapToBucket);
      return buckets.includes(selectedCategory);
    });
  }, [articles, selectedCategory]);

  // Initialize from URL on first load and when URL changes
  useEffect(() => {
    const raw = String(router.query.category || "").trim();
    if (!raw) return; // keep default "All"
    const b = mapToBucket(raw);
    if (b !== selectedCategory) setSelectedCategory(b);
  }, [router.query.category]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    const newQuery = { ...router.query };
    if (cat && cat !== "All") newQuery.category = cat;
    else delete newQuery.category;
    // Reset to page 1 when changing filters
    newQuery.page = 1;
    router.push({ pathname: "/articles", query: newQuery }, undefined, { shallow: true });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const newQuery = { ...router.query, sort: val, page: 1 };
    router.push({ pathname: "/articles", query: newQuery }, undefined, { shallow: true });
  };

  useEffect(() => {
    async function load() {
      try {
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search,
          tag,
          // pass category to API except for "All"
          ...(selectedCategory && selectedCategory !== "All"
            ? { category: selectedCategory }
            : {}),
          sort,
        });
        const res = await fetch(`/api/articles?${qs.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load articles");
        setArticles(data.articles || data.items || []);
        if (data.pagination) setPagination(data.pagination);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, limit, search, tag, sort, selectedCategory]);

  const sections = [
    { label: "Home", route: "/#home-section" },
    { label: "About", route: "/#about-section" },
    { label: "Resume", route: "/resume" },
    { label: "Projects", route: "/projects" },
    { label: "Articles", route: "/articles" },
    { label: "Contact", route: "/#contact-section" },
  ];

  return (
    <>
      <SEO
        title="Articles | Ghulam Mujtaba"
        description="Articles by Ghulam Mujtaba on software, data science, and AI."
        url="https://ghulammujtaba.com/articles"
        canonical="https://ghulammujtaba.com/articles"
        keywords="Articles, Blog, Ghulam Mujtaba, Software, Data Science, AI"
      />
      <Head>
        {/* JSON-LD: Breadcrumbs for Articles list */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://ghulammujtaba.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Articles",
                  item: "https://ghulammujtaba.com/articles",
                },
              ],
            }),
          }}
        />
      </Head>

      <div
        className={`articles-page-bg ${theme}`}
        style={{
          backgroundColor: theme === "dark" ? "#1d2127" : "#ffffff",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <header>
          <div className="hide-on-mobile">
            <NavBarDesktop />
          </div>
          <div className="show-on-mobile">
            <NavBarMobile sections={sections} />
          </div>
        </header>

        <main
          style={{ maxWidth: 1160, margin: "0 auto", padding: "0 1rem 2rem" }}
        >
          {/* Hero */}
          <section className={listCss.hero}>
            <h1
              className={`${listCss.heroTitle} ${
                theme === "dark" ? darkCss.heroTitle : lightCss.heroTitle
              }`}
            >
              Articles
            </h1>
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <Spinner size="sm" label="Loading articles" />
                <span className="sr-only">Loading articles…</span>
              </div>
            )}
            <p
              className={`${listCss.heroSubtitle} ${
                theme === "dark" ? darkCss.heroSubtitle : lightCss.heroSubtitle
              }`}
            >
              Insights on software, data science, and AI.
            </p>

            {/* Controls: Search + Sort */}
            <div className={listCss.controls} role="region" aria-label="Articles controls">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search articles"
                className={`${listCss.searchInput} ${theme === "dark" ? darkCss.searchInput : lightCss.searchInput}`}
              />
              <select
                aria-label="Sort articles"
                value={sort}
                onChange={handleSortChange}
                className={`${listCss.searchInput} ${theme === "dark" ? darkCss.searchInput : lightCss.searchInput}`}
                style={{ maxWidth: 220 }}
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
            </div>
          </section>

          {/* Content grid */}
          {loading && (
            <div className={listCss.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div className={listCss.skeletonCard} key={i}>
                  <div className={listCss.skelImage} />
                  <div className={listCss.skelContent}>
                    <div className={`${listCss.skelLine} ${listCss.medium}`} />
                    <div className={`${listCss.skelLine} ${listCss.medium}`} />
                    <div className={`${listCss.skelLine} ${listCss.short}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p style={{ color: "#ef4444" }}>Error: {error}</p>}

          {/* Category filter bar */}
          {!loading && !error && (
            <div className="article-tags fade-in-up">
              {CATEGORY_FILTERS.map((cat, i) => (
                <button
                  key={cat}
                  className={`article-tag-btn${selectedCategory === cat ? " active" : ""}`}
                  onClick={() => handleSelectCategory(cat)}
                  aria-pressed={selectedCategory === cat}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className={listCss.empty}>
              {(() => {
                if (search && tag) {
                  return `No articles found for "${search}" with the tag "${tag}".`;
                }
                if (search) {
                  return `No articles found for "${search}". Try a different search.`;
                }
                if (tag) {
                  return `No articles found with the tag "${tag}".`;
                }
                return "No articles yet. Check back soon.";
              })()}
            </div>
          )}

          {!loading && !error && filteredArticles.length > 0 && (
            <div className={listCss.grid}>
              {filteredArticles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <div className={listCss.pagination}>
              <button
                onClick={() =>
                  router.push({
                    pathname: "/articles",
                    query: { ...router.query, page: Math.max(1, page - 1) },
                  })
                }
                disabled={page <= 1}
                className={`${listCss.pageBtn} ${
                  theme === "dark" ? darkCss.pageBtn : lightCss.pageBtn
                }`}
              >
                Previous
              </button>
              <span
                className={`${listCss.pageInfo} ${
                  theme === "dark" ? darkCss.pageInfo : lightCss.pageInfo
                }`}
              >
                Page {pagination.page || page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  router.push({
                    pathname: "/articles",
                    query: {
                      ...router.query,
                      page: Math.min(
                        pagination.totalPages || page + 1,
                        page + 1,
                      ),
                    },
                  })
                }
                disabled={page >= (pagination.totalPages || page)}
                className={`${listCss.pageBtn} ${
                  theme === "dark" ? darkCss.pageBtn : lightCss.pageBtn
                }`}
              >
                Next
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>
      <style jsx>{`
        .articles-page-bg.dark .article-tag-btn {
          background: #23272f;
          color: #eee;
          border-color: #23272f;
        }
        .articles-page-bg.dark .article-tag-btn.active,
        .articles-page-bg.dark .article-tag-btn:hover {
          background: #fff;
          color: #22223b;
          border-color: #fff;
        }
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.7s cubic-bezier(0.39, 0.575, 0.565, 1) forwards;
        }
        .fade-in-up .article-tag-btn {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.5s cubic-bezier(0.39, 0.575, 0.565, 1) forwards;
        }
        .fade-in-up .article-tag-btn { animation-delay: inherit; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: none; }
        }
        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          justify-content: center;
          margin: 1.2rem 0 0.6rem 0;
        }
        @media (max-width: 600px) {
          .article-tags { gap: 0.4rem; margin: 0.9rem 0 0.4rem 0; }
        }
        .article-tag-btn {
          background: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 20px;
          padding: 0.5rem 1.1rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s, box-shadow 0.3s;
          box-shadow: 0 2px 8px 0 rgba(60, 60, 100, 0.06);
        }
        @media (max-width: 600px) {
          .article-tag-btn { font-size: 0.93rem; padding: 0.38rem 0.7rem; margin-bottom: 0.2rem; }
        }
        .article-tag-btn.active,
        .article-tag-btn:hover {
          background: #22223b;
          color: #fff;
          border-color: #22223b;
          box-shadow: 0 4px 16px 0 rgba(34, 34, 59, 0.18);
          transform: translateY(-2px) scale(1.05);
        }
      `}</style>
    </>
  );
}
