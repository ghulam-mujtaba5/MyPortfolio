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
  const articleRef = useRef(null);
  const t = theme === "dark" ? darkStyles : lightStyles;

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
          content={article.ogImage || article.coverImage}
        />
        <meta
          property="og:url"
          content={`https://ghulammujtaba.com/articles/${article.slug}`}
        />

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
          content={article.ogImage || article.coverImage}
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
            <div className={baseStyles.shareBar}>
              <button
                className={`${baseStyles.shareBtn} ${t.shareBtn || ""}`}
                onClick={() => handleShare(article)}
              >
                Share
              </button>
              <button
                className={`${baseStyles.shareBtn} ${t.shareBtn || ""}`}
                onClick={() => handleCopy(window.location.href)}
              >
                Copy link
              </button>
              <a
                className={`${baseStyles.shareBtn} ${t.shareBtn || ""}`}
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://ghulammujtaba.com/articles/${article.slug}`)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter/X
              </a>
              <a
                className={`${baseStyles.shareBtn} ${t.shareBtn || ""}`}
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://ghulammujtaba.com/articles/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
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
