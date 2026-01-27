import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useScrollTrigger } from "../../hooks/useScrollAnimation";
import ArticleCard from "./ArticleCard";
import commonStyles from "./ArticlesPreviewCommon.module.css";
import lightStyles from "./ArticlesPreviewLight.module.css";
import darkStyles from "./ArticlesPreviewDark.module.css";

const ArticlesPreview = ({ articles = [] }) => {
  const { theme } = useTheme();
  const [clientArticles, setClientArticles] = useState(articles);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { ref: containerRef, hasEntered } = useScrollTrigger({
    threshold: 0.15,
  });

  // Determine if we have initial data from SSR
  const hasInitialData = articles && articles.length > 0;

  const fetchArticles = useCallback(async () => {
    if (hasAttemptedFetch) return;

    setIsLoading(true);
    setHasAttemptedFetch(true);

    try {
      const res = await fetch("/api/articles?featured=true&limit=3");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      if (json && Array.isArray(json.articles) && json.articles.length > 0) {
        setClientArticles(json.articles);
      } else {
        // Fallback to latest published if no featured articles
        const fallbackRes = await fetch("/api/articles?limit=3");
        if (fallbackRes.ok) {
          const fallbackJson = await fallbackRes.json();
          if (fallbackJson && Array.isArray(fallbackJson.articles)) {
            setClientArticles(fallbackJson.articles);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      // Keep existing articles or empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [hasAttemptedFetch]);

  useEffect(() => {
    // Only fetch client-side if no SSR data was provided
    if (!hasInitialData && !hasAttemptedFetch) {
      fetchArticles();
    }
  }, [hasInitialData, hasAttemptedFetch, fetchArticles]);

  // Sync with SSR data if it changes
  useEffect(() => {
    if (hasInitialData) {
      setClientArticles(articles);
    }
  }, [articles, hasInitialData]);

  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const themeClass =
    theme === "dark" ? darkStyles.darkTheme : lightStyles.lightTheme;

  const displayArticles = clientArticles;
  const showEmptyState =
    !isLoading && (!displayArticles || displayArticles.length === 0);
  const showLoading =
    isLoading && (!displayArticles || displayArticles.length === 0);

  return (
    <section
      ref={containerRef}
      className={`${commonStyles.section} ${themeClass}`}
      style={{
        animation: hasEntered ? "fadeInUp 0.6s ease-out" : "none",
        opacity: hasEntered ? 1 : 0.7,
      }}
    >
      <div className={commonStyles.headerRow}>
        <h2 className={`${commonStyles.title} ${themeStyles.title}`}>
          Articles
        </h2>
      </div>
      <div className={commonStyles.grid}>
        {/* Loading State */}
        {showLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={`skeleton-${i}`}
                className={commonStyles.projectCard}
                style={{
                  minHeight: 320,
                  background:
                    theme === "dark"
                      ? "linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%)"
                      : "linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.8) 100%)",
                  borderRadius: 16,
                  animation: "pulse 2s ease-in-out infinite",
                }}
              >
                <div
                  style={{
                    height: 180,
                    background:
                      theme === "dark"
                        ? "rgba(55, 65, 81, 0.5)"
                        : "rgba(229, 231, 235, 0.8)",
                    borderRadius: "16px 16px 0 0",
                  }}
                />
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      height: 20,
                      width: "80%",
                      background:
                        theme === "dark"
                          ? "rgba(55, 65, 81, 0.5)"
                          : "rgba(229, 231, 235, 0.8)",
                      borderRadius: 4,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 14,
                      width: "60%",
                      background:
                        theme === "dark"
                          ? "rgba(55, 65, 81, 0.5)"
                          : "rgba(229, 231, 235, 0.8)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <div
            style={{
              textAlign: "center",
              width: "100%",
              color: theme === "dark" ? "#9ca3af" : "#6b7280",
              padding: "40px 20px",
            }}
          >
            No articles to show yet.
          </div>
        )}

        {/* Articles Grid */}
        {!showLoading &&
          displayArticles &&
          displayArticles.length > 0 &&
          displayArticles.map((article, index) => (
            <div
              key={article._id || article.slug || `article-${index}`}
              className={commonStyles.projectCard}
              style={{
                animation: hasEntered
                  ? `fadeInUp 0.6s ease-out ${index * 50}ms both`
                  : "none",
                willChange: "transform, opacity",
                transition:
                  "all var(--duration-normal, 0.3s) var(--ease-out, ease-out)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <ArticleCard article={article} />
            </div>
          ))}
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: "2.5rem",
          animation: hasEntered ? "fadeInUp 0.6s ease-out 300ms both" : "none",
        }}
      >
        <button
          className={`${commonStyles.viewAll} ${themeStyles.viewAll}`}
          type="button"
          onClick={() =>
            window.open("/articles", "_blank", "noopener,noreferrer")
          }
        >
          View All
        </button>
      </div>
    </section>
  );
};

export default ArticlesPreview;
