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

  useEffect(() => {
    async function load() {
      try {
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search,
          tag,
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
  }, [page, limit, search, tag, sort]);

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

      <div
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

          {!loading && !error && articles.length > 0 && (
            <div className={listCss.grid}>
              {articles.map((a) => (
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
    </>
  );
}
