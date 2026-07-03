import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MAIN_SECTIONS } from "../../constants/navigation";

import { useTheme } from "../../context/ThemeContext";
import dbConnect from "../../lib/dbConnect";
import Article from "../../models/Article";
import PreviewBanner from "../../components/Admin/PreviewBanner/PreviewBanner";
import ArticleDetail from "../../components/Articles/ArticleDetail";
import SEO, {
  articleSchema,
  breadcrumbSchema,
  speakableSchema,
} from "../../components/SEO";

const NavBarDesktop = dynamic(
  () => import("../../components/NavBar_Desktop/nav-bar"),
  { ssr: false }
);
const NavBarMobile = dynamic(
  () => import("../../components/NavBar_Mobile/NavBar-mobile"),
  { ssr: false }
);
const Footer = dynamic(() => import("../../components/Footer/Footer"), {
  ssr: false,
});

export default function InsightDetailPage({ article, relatedArticles = [], preview }) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  const makeAbsolute = (url) => {
    if (!url) return undefined;
    try {
      const u = new URL(url, "https://ghulammujtaba.com");
      return u.toString();
    } catch (_) {
      return undefined;
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (article?.slug && !preview) {
      fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: article.slug, type: "article" }),
      }).catch(() => {});
    }
  }, [article?.slug, preview]);

  const sections = MAIN_SECTIONS;

  if (!article) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: theme === "dark" ? "#1d2127" : "#ffffff", color: theme === "dark" ? "#f3f4f6" : "#1d2127" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Insight not found</h1>
        <p style={{ marginBottom: "1.5rem" }}>The insight you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <a href="/insights" style={{ color: "#4573df", textDecoration: "underline" }}>Browse all insights</a>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: theme === "dark"
        ? "linear-gradient(180deg, #1d2127 0%, #272c34 48%, #1d2127 100%)"
        : "linear-gradient(180deg, #ffffff 0%, #f8f9fd 48%, #ffffff 100%)",
      margin: 0,
      padding: 0,
    }}>
      <SEO
        title={article.metaTitle || `${article.title} | Ghulam Mujtaba`}
        description={(article.metaDescription || article.excerpt || "").substring(0, 160)}
        type="article"
        url={`https://ghulammujtaba.com/insights/${article.slug}`}
        canonical={`https://ghulammujtaba.com/insights/${article.slug}`}
        image={makeAbsolute(article.ogImage || article.coverImage)}
        imageWidth={1200}
        imageHeight={630}
        imageAlt={article.metaTitle || article.title}
        author="Ghulam Mujtaba"
        robots={preview ? "noindex,follow" : "index,follow"}
        noindex={!!preview}
        publishedTime={article.createdAt || article.publishAt}
        modifiedTime={article.updatedAt}
        articleSection={Array.isArray(article.categories) ? article.categories[0] : undefined}
        articleTags={article.tags}
        jsonLd={[
          articleSchema({
            headline: article.metaTitle || article.title,
            description: (article.metaDescription || article.excerpt || "").substring(0, 160),
            image: makeAbsolute(article.ogImage || article.coverImage),
            url: `https://ghulammujtaba.com/insights/${article.slug}`,
            datePublished: article.createdAt || article.publishAt,
            dateModified: article.updatedAt,
            keywords: article.tags,
            readingTime: article.readingTime,
          }),
          breadcrumbSchema([
            { name: "Home", url: "https://ghulammujtaba.com/" },
            { name: "Insights", url: "https://ghulammujtaba.com/insights" },
            { name: article.title, url: `https://ghulammujtaba.com/insights/${article.slug}` },
          ]),
          speakableSchema({
            url: `https://ghulammujtaba.com/insights/${article.slug}`,
            cssSelectors: [".article-title", ".article-excerpt"],
          }),
        ]}
      />

      {isMobile ? <NavBarMobile sections={sections} /> : <NavBarDesktop />}

      <main>
        {preview && <PreviewBanner />}
        <ArticleDetail article={article} relatedArticles={relatedArticles} />
      </main>

      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { params, preview = false, previewData } = context;

  try {
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

    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      published: true,
      $or: [
        { tags: { $in: article.tags || [] } },
        { categories: { $in: article.categories || [] } },
      ],
    })
      .limit(3)
      .select("title slug coverImage excerpt description readingTime tags")
      .lean();

    return {
      props: {
        article: JSON.parse(JSON.stringify(article)),
        relatedArticles: JSON.parse(JSON.stringify(relatedArticles)),
        preview: preview || false,
      },
    };
  } catch (e) {
    console.error("[Insight SSR] getServerSideProps failed:", e?.message || e);
    return { notFound: true };
  }
}
