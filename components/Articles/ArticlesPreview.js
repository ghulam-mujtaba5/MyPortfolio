import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useScrollTrigger } from "../../hooks/useScrollAnimation";
import ArticleCard from "./ArticleCard";
import commonStyles from "./ArticlesPreviewCommon.module.css";
import lightStyles from "./ArticlesPreviewLight.module.css";
import darkStyles from "./ArticlesPreviewDark.module.css";

const ArticlesPreview = ({ articles = [] }) => {
  const { theme } = useTheme();
  const [clientArticles, setClientArticles] = useState(articles);
  const { ref: containerRef, hasEntered } = useScrollTrigger({ threshold: 0.15 });

  useEffect(() => {
    if (!articles || articles.length === 0) {
      fetch("/api/articles?featured=true&limit=3")
        .then((res) => res.json())
        .then((json) => {
          if (json && Array.isArray(json.articles)) {
            if (json.articles.length > 0) {
              setClientArticles(json.articles);
            } else {
              // Fallback to latest published
              fetch("/api/articles?limit=3")
                .then((r) => r.json())
                .then((j) => {
                  if (j && Array.isArray(j.articles)) setClientArticles(j.articles);
                })
                .catch(() => setClientArticles([]));
            }
          }
        })
        .catch(() => setClientArticles([]));
    }
  }, [articles]);

  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const themeClass = theme === "dark" ? darkStyles.darkTheme : lightStyles.lightTheme;

  return (
    <section 
      ref={containerRef}
      className={`${commonStyles.section} ${themeClass}`}
      style={{
        animation: hasEntered ? 'fadeInUp 0.6s ease-out' : 'none',
        opacity: hasEntered ? 1 : 0.7,
      }}
    >
      <div className={commonStyles.headerRow}>
        <h2 className={`${commonStyles.title} ${themeStyles.title}`}>Articles</h2>
      </div>
      <div className={commonStyles.grid}>
        {(!clientArticles || clientArticles.length === 0) && (
          <div style={{ textAlign: "center", width: "100%", color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
            No articles to show yet.
          </div>
        )}
        {clientArticles && clientArticles.length > 0 &&
          clientArticles.map((article, index) => (
            <div
              key={article._id || article.slug || article.title}
              className={commonStyles.projectCard}
              style={{
                animation: hasEntered ? `fadeInUp 0.6s ease-out ${index * 50}ms both` : 'none',
                willChange: 'transform, opacity',
                transition: 'all var(--duration-normal) var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <ArticleCard article={article} />
            </div>
          ))}
      </div>
      <div style={{ 
        width: "100%", 
        display: "flex", 
        justifyContent: "center", 
        marginTop: "2.5rem",
        animation: hasEntered ? 'fadeInUp 0.6s ease-out 300ms both' : 'none',
      }}>
        <button
          className={`${commonStyles.viewAll} ${themeStyles.viewAll}`}
          type="button"
          onClick={() => window.open("/articles", "_blank", "noopener,noreferrer")}
        >
          View All
        </button>
      </div>
    </section>
  );
};

export default ArticlesPreview;
