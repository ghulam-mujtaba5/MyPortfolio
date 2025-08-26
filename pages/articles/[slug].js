import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";

import NavBarDesktop from "../../components/NavBar_Desktop/nav-bar";
import NavBarMobile from "../../components/NavBar_Mobile/NavBar-mobile";
import Footer from "../../components/Footer/Footer";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import dbConnect from "../../lib/mongoose";
import Article from "../../models/Article";
import DailyStat from "../../models/DailyStat";
import PreviewBanner from "../../components/Admin/PreviewBanner/PreviewBanner";
import baseStyles from "../../components/Articles/ArticleDetailPage.module.css";
import lightStyles from "../../components/Articles/ArticleDetailPage.light.module.css";
import darkStyles from "../../components/Articles/ArticleDetailPage.dark.module.css";

export default function ArticleDetailPage({ article, preview }) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);
  const t = theme === "dark" ? darkStyles : lightStyles;
  const articleUrl = `https://ghulammujtaba.com/articles/${article?.slug}`;

  // Ensure all image URLs are absolute for OG/Twitter and JSON-LD
  const makeAbsolute = (url) => {
    if (!url) return undefined;
    try {
      // If already absolute, this will succeed
      const u = new URL(url, "https://ghulammujtaba.com");
      return u.toString();
    } catch (_) {
      return undefined;
    }
  };

  const sections = [
    { label: "Home", route: "/#home-section" },
    { label: "About", route: "/#about-section" },
    { label: "Resume", route: "/resume" },
    { label: "Projects", route: "/projects" },
    { label: "Articles", route: "/articles" },
    { label: "Contact", route: "/#contact-section" },
  ];

  // Reading progress calculation
  useEffect(() => {
    function onScroll() {
      const el = articleRef.current;
      if (!el || typeof window === "undefined") return;
      const total = el.offsetTop + el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(window.scrollY, 0), total);
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(pct);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Prism syntax highlighting for public article content
  useEffect(() => {
    if (typeof window === "undefined" || !articleRef.current) return;

    const loadPrism = async () => {
      // Check if Prism is already available
      if (window.Prism && window.Prism.highlightAllUnder) {
        window.Prism.highlightAllUnder(articleRef.current);
        return;
      }

      // Inject theme CSS if not present
      const cssId = "prism-theme-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href =
          theme === "dark"
            ? "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css"
            : // ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
              "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css";
        document.head.appendChild(link);
      }

      // Load Prism core and autoloader
      try {
        await import("prismjs");
        await import("prismjs/plugins/autoloader/prism-autoloader");
        if (window.Prism) {
          window.Prism.plugins.autoloader.languages_path =
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/";
          window.Prism.highlightAllUnder(articleRef.current);
        }
      } catch (error) {
        console.error("Failed to load Prism syntax highlighter", error);
      }
    };

    loadPrism();
  }, [article, theme]);

  if (!article) {
    return <div>Article not found.</div>;
  }

  return (
    <>
      {/* Reading progress */}
      <div className={baseStyles.progressWrap}>
        <div
          className={`${baseStyles.progressBar} ${t.progressBar || ""}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <Head>
        <title>
          {article.metaTitle || `${article.title} | Ghulam Mujtaba`}
        </title>
        <meta
          name="description"
          content={article.metaDescription || article.excerpt}
        />
        {preview && <meta name="robots" content="noindex,follow" />}
        <link
          rel="canonical"
          href={`https://ghulammujtaba.com/articles/${article.slug}`}
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content={article.metaTitle || article.title}
        />
        <meta
          property="og:description"
          content={article.metaDescription || article.excerpt}
        />
        <meta
          property="og:image"
          content={makeAbsolute(article.ogImage || article.coverImage)}
        />
        <meta
          property="og:url"
          content={`https://ghulammujtaba.com/articles/${article.slug}`}
        />
        {((article && (article.createdAt || article.publishAt)) || article?.updatedAt) && (
          <>
            {article && (article.createdAt || article.publishAt) && (
              <meta
                property="article:published_time"
                content={new Date(article.createdAt || article.publishAt).toISOString()}
              />
            )}
            {article?.updatedAt && (
              <meta
                property="article:modified_time"
                content={new Date(article.updatedAt).toISOString()}
              />
            )}
          </>
        )}

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content={article.metaTitle || article.title}
        />
        <meta
          property="twitter:description"
          content={article.metaDescription || article.excerpt}
        />
        <meta
          property="twitter:image"
          content={makeAbsolute(article.ogImage || article.coverImage)}
        />
        <meta
          property="twitter:url"
          content={`https://ghulammujtaba.com/articles/${article.slug}`}
        />

        {/* JSON-LD: Article schema for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.metaTitle || article.title,
              description: article.metaDescription || article.excerpt,
              image: [makeAbsolute(article.ogImage || article.coverImage)].filter(
                Boolean
              ),
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://ghulammujtaba.com/articles/${article.slug}`,
              },
              author: {
                "@type": "Person",
                name: "Ghulam Mujtaba",
                url: "https://ghulammujtaba.com",
              },
              publisher: {
                "@type": "Organization",
                name: "Ghulam Mujtaba",
                logo: {
                  "@type": "ImageObject",
                  url: "https://ghulammujtaba.com/og-image.png",
                },
              },
              datePublished: article.createdAt || article.publishAt,
              dateModified: article.updatedAt,
              keywords: Array.isArray(article.tags)
                ? article.tags.join(", ")
                : undefined,
              timeRequired: typeof article.readingTime === "number"
                ? `PT${article.readingTime}M`
                : undefined,
              wordCount: typeof article.readingTime === "number"
                ? Math.round(article.readingTime * 200)
                : undefined,
            }),
          }}
        />
        {/* JSON-LD: Breadcrumbs */}
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
                {
                  "@type": "ListItem",
                  position: 3,
                  name: article.title,
                  item: `https://ghulammujtaba.com/articles/${article.slug}`,
                },
              ],
            }),
          }}
        />
      </Head>
      <div
        style={{
          backgroundColor: theme === "dark" ? "#1d2127" : "#ffffff",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <header>
          <NavBarDesktop />
          <NavBarMobile sections={sections} />
        </header>

        <main className={baseStyles.page}>
          {preview && <PreviewBanner />}
          {/* Hero cover */}
          <section className={baseStyles.hero}>
            {article.coverImage && (
              <div className={baseStyles.coverWrap}>
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  priority
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            <h1 className={`${baseStyles.title} ${t.title || ""}`}>{article.title}</h1>
            <div className={`${baseStyles.meta} ${t.meta || ""}`}>
              {article.updatedAt && (
                <time dateTime={new Date(article.updatedAt).toISOString()}>
                  Updated: {new Date(article.updatedAt).toLocaleDateString()}
                </time>
              )}
              {article.readingTime && (
                <span>• {article.readingTime} min read</span>
              )}
            </div>
            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className={baseStyles.tags}>
                {article.tags.map((tTag) => (
                  <span key={tTag} className={`${baseStyles.tag} ${t.tag || ""}`}>
                    #{tTag}
                  </span>
                ))}
              </div>
            )}
            {Array.isArray(article.highlights) &&
              article.highlights.length > 0 && (
                <div className={baseStyles.highlights} aria-label="Highlights">
                  {article.highlights.map((q, i) => (
                    <figure key={i} className={`${baseStyles.highlightCard} ${t.highlightCard || ""}`}>
                      <blockquote>“{q}”</blockquote>
                    </figure>
                  ))}
                </div>
              )}
            <div className={baseStyles.shareBar} style={{ position: "relative", display: "inline-block" }}>
              <button
                className={`${baseStyles.shareBtn} ${t.shareBtn || ""}`}
                aria-label="Share this article"
                aria-haspopup="menu"
                aria-expanded={shareOpen ? "true" : "false"}
                title="Share"
                onClick={async () => {
                  try {
                    if (typeof navigator !== "undefined" && navigator.share) {
                      await navigator.share({
                        title: article.metaTitle || article.title,
                        text: article.excerpt || article.title,
                        url: articleUrl,
                      });
                      return;
                    }
                  } catch (_) {}
                  setShareOpen((v) => !v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShareOpen((v) => !v);
                  }
                  if (e.key === "Escape") setShareOpen(false);
                }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, padding: 0, borderRadius: 9999 }}
              >
                {/* Modern share icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M15 4h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 14L20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 14v5a1 1 0 0 1-1 1h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {shareOpen && (
                <div
                  role="menu"
                  aria-label="Share options"
                  style={{
                    position: "absolute",
                    top: 52,
                    right: 0,
                    background: theme === "dark" ? "#2a2f36" : "#fff",
                    color: theme === "dark" ? "#e5e7eb" : "#111827",
                    border: theme === "dark" ? "1px solid #3b4250" : "1px solid #e5e7eb",
                    borderRadius: 10,
                    boxShadow: theme === "dark" ? "0 10px 30px rgba(0,0,0,.5)" : "0 10px 30px rgba(0,0,0,.1)",
                    padding: 8,
                    minWidth: 220,
                    zIndex: 10,
                  }}
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      handleCopy(articleUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                      setShareOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: "transparent",
                      border: 0,
                      color: "inherit",
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
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.metaTitle || article.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: "inherit" }}
                  >
                    Share on X (Twitter)
                  </a>
                  <a
                    role="menuitem"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: "inherit" }}
                  >
                    Share on LinkedIn
                  </a>
                  <a
                    role="menuitem"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: "inherit" }}
                  >
                    Share on Facebook
                  </a>
                  <a
                    role="menuitem"
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent((article.metaTitle || article.title) + " " + articleUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: "inherit" }}
                  >
                    Share on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </section>

          <article ref={articleRef} className={`${baseStyles.article} ${t.article || ""}`}>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}

// Helpers inside module scope (after component)
function handleCopy(text) {
  try {
    typeof navigator !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.writeText(text);
  } catch (e) {}
}

async function handleShare(article) {
  const shareData = {
    title: article.metaTitle || article.title,
    text: article.excerpt || article.title,
    url: `https://ghulammujtaba.com/articles/${article.slug}`,
  };
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(shareData);
    } else {
      handleCopy(shareData.url);
    }
  } catch (_) {}
}

export async function getServerSideProps(context) {
  const { params, preview = false, previewData } = context;
  await dbConnect();

  let article;

  if (preview && previewData?.id) {
    article = await Article.findById(previewData.id).lean();
  } else {
    article = await Article.findOne({
      slug: params.slug,
      published: true,
    }).lean();
  }

  if (!article) {
    return { notFound: true };
  }

  // Track view only for published, non-preview pages
  if (!preview) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // normalize to UTC date-only for unique-per-day
    try {
      await DailyStat.updateOne(
        { date: today },
        { $inc: { articleViews: 1 } },
        { upsert: true },
      );
    } catch (e) {
      // Do not block rendering if analytics write fails
      console.error("DailyStat update failed", e?.message || e);
    }
  }

  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
      preview,
    },
  };
}
