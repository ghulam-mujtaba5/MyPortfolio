import React, { useEffect, useState, useMemo, useCallback } from "react";
import SEO, {
  collectionPageSchema,
  breadcrumbSchema,
} from "../../components/SEO";
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
import dbConnect from "../../lib/dbConnect";
import Article from "../../models/Article";
import ScrollReveal from "../../components/AnimatedUI/ScrollReveal";

export default function ArticlesPage({
  initialArticles = [],
  initialPagination = { page: 1, totalPages: 1, total: 0, limit: 9 },
  initialQuery = {
    search: "",
    tag: "",
    sort: "relevance",
    limit: 9,
    page: 1,
    category: "All",
  },
}) {
  const { theme } = useTheme();
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(initialPagination);
  const [mounted, setMounted] = useState(false);

  // Sync state with SSR props on mount and when props change
  // This fixes hydration issues where initialArticles aren't captured on first render
  useEffect(() => {
    setMounted(true);
    // Always sync with SSR data when it changes
    if (initialArticles && initialArticles.length > 0) {
      setArticles(initialArticles);
    }
    if (initialPagination) {
      setPagination(initialPagination);
    }
  }, [initialArticles, initialPagination]);

  // Client-side fallback: if SSR returned no articles, fetch from API
  useEffect(() => {
    if (!mounted) return;
    // Only fetch if SSR provided nothing (likely SSR error/timeout)
    if (initialArticles && initialArticles.length > 0) return;
    if (articles.length > 0) return;

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(limit));

    fetch(`/api/articles?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => {
        if (cancelled) return;
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
        if (data.pagination) {
          setPagination(data.pagination);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Client-side article fetch failed:", err);
          setError("Failed to load articles. Please try refreshing the page.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const router = useRouter();
  const page = useMemo(
    () => Number(router.query.page || initialQuery.page || 1),
    [router.query.page, initialQuery.page],
  );
  const limit = useMemo(
    () => Number(router.query.limit || initialQuery.limit || 9),
    [router.query.limit, initialQuery.limit],
  );
  const search = useMemo(
    () => String(router.query.search ?? initialQuery.search ?? ""),
    [router.query.search, initialQuery.search],
  );
  const tag = useMemo(
    () => String(router.query.tag ?? initialQuery.tag ?? ""),
    [router.query.tag, initialQuery.tag],
  );
  const sort = useMemo(
    () => String(router.query.sort || initialQuery.sort || "relevance"),
    [router.query.sort, initialQuery.sort],
  );

  // Local UI state for search input with debounce
  const [q, setQ] = useState(search);
  useEffect(() => setQ(search), [search]);
  useEffect(() => {
    const id = setTimeout(() => {
      // push only if value actually changed to avoid loops
      if (q !== search) {
        const newQuery = { ...router.query };
        if (q) newQuery.search = q;
        else delete newQuery.search;
        newQuery.page = 1;
        router.push({ pathname: "/articles", query: newQuery });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [q]);

  // Normalize and map raw category strings to one of our 5 display buckets
  const mapToBucket = useCallback((label) => {
    const normalized = String(label || "").toLowerCase();
    if (normalized.includes("academic") || normalized.includes("learning"))
      return "Academics & Learning";
    if (normalized.includes("project") || normalized.includes("career"))
      return "Projects & Career";
    if (normalized.includes("engineer") || normalized.includes("development"))
      return "Engineering & Development";
    if (normalized.includes("tech") || normalized.includes("trend"))
      return "Tech Insights & Trends";
    return "Others";
  }, []);

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

  // Compute initial category using router query (if present) or SSR-provided initialQuery
  const computeInitialCategory = () => {
    const raw = String(
      router.query?.category || initialQuery.category || "All",
    ).trim();
    if (raw === "All" || CATEGORY_FILTERS.includes(raw)) return raw;
    if (raw) return mapToBucket(raw);
    return "All";
  };

  const [selectedCategory, setSelectedCategory] = useState(() =>
    computeInitialCategory(),
  );

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "All") return articles;
    return (articles || []).filter((a) => {
      const cats = Array.isArray(a?.categories) ? a.categories : [];
      const buckets = cats.map(mapToBucket);
      return buckets.includes(selectedCategory);
    });
  }, [articles, selectedCategory]);

  // Keep selectedCategory in sync with URL changes (SSR navigations & client navigation)
  useEffect(() => {
    // Wait for router to be ready (prevents a hydration race)
    if (!router.isReady) return;

    const raw = String(
      router.query?.category || initialQuery.category || "All",
    ).trim();
    const target =
      raw === "All" || CATEGORY_FILTERS.includes(raw)
        ? raw
        : raw
          ? mapToBucket(raw)
          : "All";

    if (selectedCategory !== target) {
      setSelectedCategory(target);
    }
  }, [
    router.isReady,
    router.query?.category,
    initialQuery.category,
    CATEGORY_FILTERS,
    selectedCategory,
    mapToBucket,
    router,
  ]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    const newQuery = { ...router.query };
    if (cat && cat !== "All") newQuery.category = cat;
    else delete newQuery.category;
    // Reset to page 1 when changing filters
    newQuery.page = 1;
    router.push({ pathname: "/articles", query: newQuery });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const newQuery = { ...router.query, sort: val, page: 1 };
    router.push({ pathname: "/articles", query: newQuery });
  };
  // Data comes from SSR. Client transitions trigger full SSR navigations above.

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
        title="Articles & Blog | Ghulam Mujtaba — Software, Data Science & AI Insights"
        description="Read articles by Ghulam Mujtaba on software engineering, data science, machine learning, AI, and modern web development. Tips, tutorials, and insights."
        url="https://ghulammujtaba.com/articles"
        canonical="https://ghulammujtaba.com/articles"
        image="https://ghulammujtaba.com/og-image.png"
        imageWidth={1200}
        imageHeight={630}
        imageAlt="Articles by Ghulam Mujtaba"
        author="Ghulam Mujtaba"
        keywords="Articles, Blog, Ghulam Mujtaba, Software, Data Science, AI, Machine Learning, Web Development"
        jsonLd={[
          collectionPageSchema({
            name: "Articles by Ghulam Mujtaba",
            url: "https://ghulammujtaba.com/articles",
            description: "Articles and blog posts by Ghulam Mujtaba on software engineering, data science, machine learning, and AI.",
            items: (articles || []).slice(0, 10).map((a) => ({
              name: a.title,
              url: `https://ghulammujtaba.com/articles/${a.slug}`,
              description: a.excerpt || "",
              image: a.coverImage || "",
            })),
          }),
          breadcrumbSchema([
            { name: "Home", url: "https://ghulammujtaba.com/" },
            { name: "Articles", url: "https://ghulammujtaba.com/articles" },
          ]),
        ]}
      />

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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
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
            <div
              className={listCss.controls}
              role="region"
              aria-label="Articles controls"
            >
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

          {/* Show loading skeleton on initial mount before hydration completes */}
          {!mounted && initialArticles.length === 0 && (
            <div className={listCss.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  className={listCss.skeletonCard}
                  key={`init-skeleton-${i}`}
                >
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

          {!loading && !error && mounted && articles.length === 0 && (
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
              {filteredArticles.map((a, index) => (
                <ScrollReveal
                  key={a._id}
                  animation="fadeInUp"
                  delay={index * 50}
                  width="100%"
                >
                  <ArticleCard article={a} />
                </ScrollReveal>
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
        .fade-in-up .article-tag-btn {
          animation-delay: inherit;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: none;
          }
        }
        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          justify-content: center;
          margin: 1.2rem 0 0.6rem 0;
        }
        @media (max-width: 600px) {
          .article-tags {
            gap: 0.4rem;
            margin: 0.9rem 0 0.4rem 0;
          }
        }
        .article-tag-btn {
          background: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 20px;
          padding: 0.5rem 1.1rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition:
            all 0.2s,
            box-shadow 0.3s;
          box-shadow: 0 2px 8px 0 rgba(60, 60, 100, 0.06);
        }
        @media (max-width: 600px) {
          .article-tag-btn {
            font-size: 0.93rem;
            padding: 0.38rem 0.7rem;
            margin-bottom: 0.2rem;
          }
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

export async function getServerSideProps({ query }) {
  try {
    await dbConnect();

    const {
      limit = "9",
      page = "1",
      q = "",
      search = "",
      tag = "",
      category = "",
      sort = "relevance",
    } = query || {};

    const pageSize = Math.min(parseInt(limit, 10) || 9, 100);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const effectiveSearch = String(search || q || "").trim();
    const skip = (pageNum - 1) * pageSize;

    const now = new Date();
    const baseFilter = {
      published: true,
      $or: [{ publishAt: null }, { publishAt: { $lte: now } }],
    };
    if (tag) {
      baseFilter.tags = tag;
    }
    if (category) {
      const cat = String(category);
      const bucket = cat.toLowerCase();
      const makeRegexes = (parts) => parts.map((p) => new RegExp(p, "i"));
      if (bucket !== "all" && bucket !== "others") {
        let regexes = [];
        if (bucket.includes("academic") || bucket.includes("learning")) {
          regexes = makeRegexes(["academic", "learning"]);
        } else if (bucket.includes("project") || bucket.includes("career")) {
          regexes = makeRegexes(["project", "career"]);
        } else if (
          bucket.includes("engineer") ||
          bucket.includes("development")
        ) {
          regexes = makeRegexes(["engineer", "development"]);
        } else if (bucket.includes("tech") || bucket.includes("trend")) {
          regexes = makeRegexes(["tech", "trend"]);
        } else {
          regexes = [
            new RegExp(cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          ];
        }
        if (regexes.length > 0) {
          baseFilter.categories = { $in: regexes };
        }
      }
    }

    const useText = !!effectiveSearch;
    const filter = useText
      ? { ...baseFilter, $text: { $search: effectiveSearch } }
      : baseFilter;

    const projection = {
      title: 1,
      slug: 1,
      excerpt: 1,
      tags: 1,
      categories: 1,
      createdAt: 1,
      coverImage: 1,
      coverImageFit: 1,
      views: 1,
      featuredOnHome: 1,
      ...(useText ? { score: { $meta: "textScore" } } : {}),
    };

    let sortOrder;
    switch (sort) {
      case "views":
        sortOrder = { views: -1, createdAt: -1 };
        break;
      case "newest":
        sortOrder = { createdAt: -1 };
        break;
      case "oldest":
        sortOrder = { createdAt: 1 };
        break;
      case "relevance":
      default:
        sortOrder = useText
          ? { score: { $meta: "textScore" }, createdAt: -1 }
          : { createdAt: -1 };
        break;
    }

    const [items, total] = await Promise.all([
      Article.find(filter)
        .select(projection)
        .sort(sortOrder)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const serialized = (items || []).map((a) => ({
      ...a,
      _id: a._id?.toString?.() || a._id,
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    }));

    return {
      props: {
        initialArticles: serialized,
        initialPagination: {
          page: pageNum,
          totalPages,
          total,
          limit: pageSize,
        },
        initialQuery: {
          search: effectiveSearch,
          tag: String(tag || ""),
          sort: String(sort || "relevance"),
          limit: pageSize,
          page: pageNum,
          category: String(category || "All"),
        },
      },
    };
  } catch (e) {
    console.error("[Articles SSR] getServerSideProps failed:", e?.message || e);
    return {
      props: {
        initialArticles: [],
        initialPagination: { page: 1, totalPages: 1, total: 0, limit: 9 },
        initialQuery: {
          search: "",
          tag: "",
          sort: "relevance",
          limit: 9,
          page: 1,
          category: "All",
        },
      },
    };
  }
}
