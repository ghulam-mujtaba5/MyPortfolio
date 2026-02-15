import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { useTheme } from "../../context/ThemeContext";
import dbConnect from "../../lib/mongoose";
import Article from "../../models/Article";
import DailyStat from "../../models/DailyStat";
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

export default function ArticleDetailPage({ article, relatedArticles = [], preview }) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Ensure absolute URLs for OG/Twitter and JSON-LD
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sections = [
    { label: "Home", route: "/#home-section" },
    { label: "About", route: "/#about-section" },
    { label: "Resume", route: "/resume" },
    { label: "Projects", route: "/projects" },
    { label: "Articles", route: "/articles" },
    { label: "Contact", route: "/#contact-section" },
  ];

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: theme === 'dark' ? '#1d2127' : '#ffffff', color: theme === 'dark' ? '#f3f4f6' : '#1d2127' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Article not found</h1>
        <p style={{ marginBottom: '1.5rem' }}>The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <a href="/articles" style={{ color: '#4573df', textDecoration: 'underline' }}>Browse all articles</a>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)' 
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)',
      margin: 0,
      padding: 0
    }}>
      <SEO
        title={article.metaTitle || `${article.title} | Ghulam Mujtaba`}
        description={article.metaDescription || article.excerpt}
        type="article"
        url={`https://ghulammujtaba.com/articles/${article.slug}`}
        canonical={`https://ghulammujtaba.com/articles/${article.slug}`}
        image={makeAbsolute(article.ogImage || article.coverImage)}
        imageWidth={1200}
        imageHeight={630}
        imageAlt={article.metaTitle || article.title}
        author="Ghulam Mujtaba"
        robots={preview ? "noindex,follow" : "index,follow"}
        noindex={!!preview}
        publishedTime={article.createdAt || article.publishAt}
        modifiedTime={article.updatedAt}
        articleSection={article.category}
        articleTags={article.tags}
        jsonLd={[
          articleSchema({
            headline: article.metaTitle || article.title,
            description: article.metaDescription || article.excerpt,
            image: makeAbsolute(article.ogImage || article.coverImage),
            url: `https://ghulammujtaba.com/articles/${article.slug}`,
            datePublished: article.createdAt || article.publishAt,
            dateModified: article.updatedAt,
            keywords: article.tags,
            readingTime: article.readingTime,
          }),
          breadcrumbSchema([
            { name: "Home", url: "https://ghulammujtaba.com/" },
            { name: "Articles", url: "https://ghulammujtaba.com/articles" },
            { name: article.title, url: `https://ghulammujtaba.com/articles/${article.slug}` },
          ]),
          speakableSchema({
            url: `https://ghulammujtaba.com/articles/${article.slug}`,
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

  // Fetch related articles (same tags or similar content, excluding current article)
  const relatedArticles = await Article.find({
    _id: { $ne: article._id },
    published: true,
    $or: [
      { tags: { $in: article.tags || [] } },
      { category: article.category }
    ]
  })
  .limit(3)
  .select('title slug coverImage excerpt description readingTime tags')
  .lean();

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
      relatedArticles: JSON.parse(JSON.stringify(relatedArticles)),
      preview,
    },
  };
}