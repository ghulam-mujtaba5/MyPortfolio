import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggleIcon from "../Icon/gmicon";
import { formatDateConsistent, formatDateISO } from "../../utils/dateUtils";
import baseStyles from "./ArticleDetailBaseCommon.module.css";
import lightStyles from "./ArticleDetail.light.module.css";
import darkStyles from "./ArticleDetail.dark.module.css";

const ArticleDetail = ({ article, relatedArticles = [] }) => {
  const { theme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareAnim, setShareAnim] = useState(false);
  const contentRef = useRef(null);
  const shareRef = useRef(null);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply body background for consistency
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    if (theme === "dark") {
      body.style.background = 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)';
      html.style.background = 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)';
      body.style.minHeight = '100vh';
      html.style.minHeight = '100vh';
    } else {
      body.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)';
      html.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)';
      body.style.minHeight = '100vh';
      html.style.minHeight = '100vh';
    }

    return () => {
      body.style.background = '';
      html.style.background = '';
      body.style.minHeight = '';
      html.style.minHeight = '';
    };
  }, [theme]);

  // Share functionality helpers
  const openShare = () => {
    setShareOpen(true);
    requestAnimationFrame(() => setShareAnim(true));
  };

  const closeShare = () => {
    setShareAnim(false);
    setTimeout(() => setShareOpen(false), 150);
  };

  const handleCopy = (text) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  // Click outside to close share popup
  useEffect(() => {
    function onDocClick(e) {
      if (!shareOpen) return;
      const node = shareRef.current;
      if (node && !node.contains(e.target)) {
        closeShare();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [shareOpen]);

  // Prism syntax highlighting
  useEffect(() => {
    if (typeof window === "undefined" || !contentRef.current) return;

    const loadPrism = async () => {
      if (window.Prism && window.Prism.highlightAllUnder) {
        window.Prism.highlightAllUnder(contentRef.current);
        return;
      }

      const cssId = "prism-theme-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = theme === "dark"
          ? "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css"
          : "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css";
        document.head.appendChild(link);
      }

      try {
        await import("prismjs");
        await import("prismjs/plugins/autoloader/prism-autoloader");
        if (window.Prism) {
          window.Prism.plugins.autoloader.languages_path =
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/";
          window.Prism.highlightAllUnder(contentRef.current);
        }
      } catch (error) {
        console.error("Failed to load Prism syntax highlighter", error);
      }
    };

    loadPrism();
  }, [article, theme]);

  if (!article) {
    return (
      <div className={`${baseStyles.container} ${theme === "dark" ? darkStyles.container : lightStyles.container}`}>
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          color: theme === "dark" ? "#e5e7eb" : "#374151"
        }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Article Not Found</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const { title, content, coverImage, tags, excerpt, readingTime, updatedAt, createdAt, publishAt } = article;
  const articleUrl = `https://ghulammujtaba.com/articles/${article.slug}`;

  // Combine styles based on theme
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const styles = { ...baseStyles, ...themeStyles };

  return (
    <div className={`${baseStyles.container} ${themeStyles.container || ""} ${theme === "dark" ? baseStyles.dark : baseStyles.light}`}>
      {/* GM Icon */}
      <div className={`${baseStyles.gmIcon} ${themeStyles.gmIcon || ""} ${theme === "light" ? "light" : "dark"}`}>
        <ThemeToggleIcon />
      </div>

      {/* Scroll Progress Indicator */}
      <div 
        className={`${baseStyles.scrollProgress} ${themeStyles.scrollProgress || ""}`}
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={scrollProgress}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Reading progress"
      />

      {/* Breadcrumb Navigation */}
      <nav className={`${baseStyles.breadcrumb} ${themeStyles.breadcrumb || ""}`} aria-label="Breadcrumb">
        <Link href="/" className={baseStyles.breadcrumbLink}>
          Home
        </Link>
        <span className={baseStyles.breadcrumbSeparator} aria-hidden="true">›</span>
        <Link href="/articles" className={baseStyles.breadcrumbLink}>
          Articles
        </Link>
        <span className={baseStyles.breadcrumbSeparator} aria-hidden="true">›</span>
        <span className={baseStyles.breadcrumbCurrent} aria-current="page">
          {title}
        </span>
      </nav>

      {/* Article Title */}
      <h1 className={`${baseStyles.title} ${themeStyles.title || ""}`}>
        {title}
        <div className={`${baseStyles.titleUnderline} ${themeStyles.titleUnderline || ""}`} />
      </h1>

      {/* Article Cover Image */}
      {coverImage && (
        <div className={`${baseStyles.imageContainer} ${themeStyles.imageContainer || ""}`}>
          <Image
            src={coverImage}
            alt={title}
            width={900}
            height={450}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 900px, 900px"
            style={{ 
              objectFit: article?.coverImageFit || "cover",
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '450px'
            }}
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7XTvhRakHcMm3+hPM4cBDBj5SJ2H+pD7bFaRKTXuMhNB1O8Dq3wA8QRnKLi5TlwT5WbUZrJeCPmvdVuKldJVEHPMCgw4wnTrA7cY1x5Vt7U2kJQqGDVGnGv4u5h7PF5vhT46wJwNBJLQCuNq8AV/9k="
          />
        </div>
      )}

      {/* Reading Info & Meta */}
      <div className={`${baseStyles.readingInfo} ${themeStyles.readingInfo || ""}`}>
        {(updatedAt || createdAt || publishAt) && (
          <div className={baseStyles.lastUpdated}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <time dateTime={formatDateISO(updatedAt || createdAt || publishAt)}>
              {updatedAt ? 'Updated' : 'Published'}: {formatDateConsistent(updatedAt || createdAt || publishAt)}
            </time>
          </div>
        )}
        {readingTime && (
          <div className={baseStyles.readingTime}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 6.253v6l3.75 3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{readingTime} min read</span>
          </div>
        )}
      </div>

      {/* Meta Information */}
      <div className={`${baseStyles.meta} ${themeStyles.meta || ""}`}>
        {Array.isArray(tags) && tags.length > 0 && (
          <div 
            className={`${baseStyles.tags} ${themeStyles.tags || ""}`}
            role="list"
            aria-label="Article tags"
          >
            {tags.map((tag, index) => (
              <span 
                key={`${tag}-${index}`} 
                className={`${baseStyles.tag} ${themeStyles.tag || ""}`}
                role="listitem"
                tabIndex="0"
                aria-label={`Tag: ${tag}`}
              >
                <span>#{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Share Button - Inline beside tags */}
        <div className={baseStyles.shareButtonInline} ref={shareRef}>
          <button
            className={`${baseStyles.shareButtonMeta} ${themeStyles.shareButtonMeta || ""}`}
            aria-label="Share this article"
            aria-haspopup="menu"
            aria-expanded={shareOpen ? "true" : "false"}
            title="Share"
            onClick={async () => {
              try {
                if (typeof navigator !== "undefined" && navigator.share) {
                  await navigator.share({
                    title: article.metaTitle || title,
                    text: excerpt || title,
                    url: articleUrl,
                  });
                  return;
                }
              } catch (_) {}
              if (!shareOpen) openShare(); else closeShare();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8.6 13.5l6.8 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.4 6.5L8.6 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Share</span>
          </button>
          
          {shareOpen && (
            <div
              role="menu"
              aria-label="Share options"
              className={`${baseStyles.sharePopup} ${themeStyles.sharePopup || ""}`}
              style={{
                opacity: shareAnim ? 1 : 0,
                transform: shareAnim ? "scale(1) translateY(0px)" : "scale(0.98) translateY(-4px)",
              }}
            >
              <button
                role="menuitem"
                className={baseStyles.shareOption}
                onClick={() => {
                  handleCopy(articleUrl);
                  closeShare();
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {copied ? "Copied!" : "Copy link"}
              </button>
              <a
                role="menuitem"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.metaTitle || title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={baseStyles.shareOption}
              >
                Share on X (Twitter)
              </a>
              <a
                role="menuitem"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={baseStyles.shareOption}
              >
                Share on LinkedIn
              </a>
              <a
                role="menuitem"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={baseStyles.shareOption}
              >
                Share on Facebook
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Article Excerpt/Summary */}
      {excerpt && (
        <div className={`${baseStyles.excerpt} ${themeStyles.excerpt || ""}`}>
          <p>{excerpt}</p>
        </div>
      )}

      {/* Article Content */}
      {content && (
        <article 
          ref={contentRef}
          className={`${baseStyles.content} ${themeStyles.content || ""}`}
          dangerouslySetInnerHTML={{ __html: content }}
          role="article"
          aria-label="Article content"
        />
      )}

      {/* Related Articles */}
      {Array.isArray(relatedArticles) && relatedArticles.length > 0 && (
        <section className={`${baseStyles.relatedSection} ${themeStyles.relatedSection || ""}`}>
          <h2 className={`${baseStyles.relatedTitle} ${themeStyles.relatedTitle || ""}`}>
            Related Articles
          </h2>
          <div className={`${baseStyles.relatedGrid} ${themeStyles.relatedGrid || ""}`}>
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.slug}
                href={`/articles/${relatedArticle.slug}`}
                className={`${baseStyles.relatedCard} ${themeStyles.relatedCard || ""}`}
              >
                {relatedArticle.coverImage && (
                  <div className={baseStyles.relatedImage}>
                    <Image
                      src={relatedArticle.coverImage}
                      alt={relatedArticle.title}
                      width={300}
                      height={160}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  </div>
                )}
                <div className={baseStyles.relatedContent}>
                  <h3 className={baseStyles.relatedCardTitle}>{relatedArticle.title}</h3>
                  <p className={baseStyles.relatedCardDesc}>
                    {relatedArticle.excerpt || relatedArticle.description}
                  </p>
                  {relatedArticle.readingTime && (
                    <span className={baseStyles.relatedCardMeta}>
                      {relatedArticle.readingTime} min read
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to Articles */}
      <div className={`${baseStyles.backToArticles} ${themeStyles.backToArticles || ""}`}>
        <Link 
          href="/articles" 
          className={`${baseStyles.backLink} ${themeStyles.backLink || ""}`}
        >
          ← Back to All Articles
        </Link>
      </div>
    </div>
  );
};

export default ArticleDetail;