// import React, { useEffect, useState } from "react";
// import Head from "next/head";
// import dynamic from "next/dynamic";

// import { useTheme } from "../../context/ThemeContext";
// import dbConnect from "../../lib/mongoose";
// import Article from "../../models/Article";
// import DailyStat from "../../models/DailyStat";
// import PreviewBanner from "../../components/Admin/PreviewBanner/PreviewBanner";
// import ArticleDetail from "../../components/Articles/ArticleDetail";

// const NavBarDesktop = dynamic(
//   () => import("../../components/NavBar_Desktop/nav-bar"),
//   { ssr: false }
// );
// const NavBarMobile = dynamic(
//   () => import("../../components/NavBar_Mobile/NavBar-mobile"),
//   { ssr: false }
// );
// const Footer = dynamic(() => import("../../components/Footer/Footer"), {
//   ssr: false,
// });

// export default function ArticleDetailPage({ article, relatedArticles = [], preview }) {
//   const { theme } = useTheme();
//   const [isMobile, setIsMobile] = useState(false);

//   // Ensure absolute URLs for OG/Twitter and JSON-LD
//   const makeAbsolute = (url) => {
//     if (!url) return undefined;
//     try {
//       const u = new URL(url, "https://ghulammujtaba.com");
//       return u.toString();
//     } catch (_) {
//       return undefined;
//     }
//   };

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const sections = [
//     { label: "Home", route: "/#home-section" },
//     { label: "About", route: "/#about-section" },
//     { label: "Resume", route: "/resume" },
//     { label: "Projects", route: "/projects" },
//     { label: "Articles", route: "/articles" },
//     { label: "Contact", route: "/#contact-section" },
//   ];

//   if (!article) {
//     return <div>Article not found.</div>;
//   }

//   return (
//     <div style={{ 
//       minHeight: '100vh', 
//       width: '100%',
//       background: theme === 'dark' 
//         ? 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)' 
//         : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)',
//       margin: 0,
//       padding: 0
//     }}>
//       <Head>
//         <title>
//           {article.metaTitle || `${article.title} | Ghulam Mujtaba`}
//         </title>
//         <meta
//           name="description"
//           content={article.metaDescription || article.excerpt}
//         />
//         {preview && <meta name="robots" content="noindex,follow" />}
//         <link
//           rel="canonical"
//           href={`https://ghulammujtaba.com/articles/${article.slug}`}
//         />

//         {/* Open Graph / Facebook */}
//         <meta property="og:type" content="article" />
//         <meta
//           property="og:title"
//           content={article.metaTitle || article.title}
//         />
//         <meta
//           property="og:description"
//           content={article.metaDescription || article.excerpt}
//         />
//         <meta
//           property="og:image"
//           content={makeAbsolute(article.ogImage || article.coverImage)}
//         />
//         <meta
//           property="og:url"
//           content={`https://ghulammujtaba.com/articles/${article.slug}`}
//         />
//         {((article && (article.createdAt || article.publishAt)) || article?.updatedAt) && (
//           <>
//             {article && (article.createdAt || article.publishAt) && (
//               <meta
//                 property="article:published_time"
//                 content={new Date(article.createdAt || article.publishAt).toISOString()}
//               />
//             )}
//             {article?.updatedAt && (
//               <meta
//                 property="article:modified_time"
//                 content={new Date(article.updatedAt).toISOString()}
//               />
//             )}
//           </>
//         )}

//         {/* Twitter */}
//         <meta property="twitter:card" content="summary_large_image" />
//         <meta
//           property="twitter:title"
//           content={article.metaTitle || article.title}
//         />
//         <meta
//           property="twitter:description"
//           content={article.metaDescription || article.excerpt}
//         />
//         <meta
//           property="twitter:image"
//           content={makeAbsolute(article.ogImage || article.coverImage)}
//         />
//         <meta
//           property="twitter:url"
//           content={`https://ghulammujtaba.com/articles/${article.slug}`}
//         />

//         {/* JSON-LD: Article schema for rich results */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "Article",
//               headline: article.metaTitle || article.title,
//               description: article.metaDescription || article.excerpt,
//               image: [makeAbsolute(article.ogImage || article.coverImage)].filter(
//                 Boolean
//               ),
//               mainEntityOfPage: {
//                 "@type": "WebPage",
//                 "@id": `https://ghulammujtaba.com/articles/${article.slug}`,
//               },
//               author: {
//                 "@type": "Person",
//                 name: "Ghulam Mujtaba",
//                 url: "https://ghulammujtaba.com",
//               },
//               publisher: {
//                 "@type": "Organization",
//                 name: "Ghulam Mujtaba",
//                 logo: {
//                   "@type": "ImageObject",
//                   url: "https://ghulammujtaba.com/og-image.png",
//                 },
//               },
//               datePublished: article.createdAt || article.publishAt,
//               dateModified: article.updatedAt,
//               keywords: Array.isArray(article.tags)
//                 ? article.tags.join(", ")
//                 : undefined,
//               timeRequired: typeof article.readingTime === "number"
//                 ? `PT${article.readingTime}M`
//                 : undefined,
//               wordCount: typeof article.readingTime === "number"
//                 ? Math.round(article.readingTime * 200)
//                 : undefined,
//             }),
//           }}
//         />
//         {/* JSON-LD: Breadcrumbs */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "BreadcrumbList",
//               itemListElement: [
//                 {
//                   "@type": "ListItem",
//                   position: 1,
//                   name: "Home",
//                   item: "https://ghulammujtaba.com/",
//                 },
//                 {
//                   "@type": "ListItem",
//                   position: 2,
//                   name: "Articles",
//                   item: "https://ghulammujtaba.com/articles",
//                 },
//                 {
//                   "@type": "ListItem",
//                   position: 3,
//                   name: article.title,
//                   item: `https://ghulammujtaba.com/articles/${article.slug}`,
//                 },
//               ],
//             }),
//           }}
//         />
//       </Head>

//       {isMobile ? <NavBarMobile sections={sections} /> : <NavBarDesktop />}

//       <main>
//         {preview && <PreviewBanner />}
//         <ArticleDetail article={article} relatedArticles={relatedArticles} />
//       </main>

//       <Footer />
//     </div>
//   );
// }

// export async function getServerSideProps(context) {
//   const { params, preview = false, previewData } = context;
//   await dbConnect();

//   let article;

//   if (preview && previewData?.id) {
//     article = await Article.findById(previewData.id).lean();
//   } else {
//     article = await Article.findOne({
//       slug: params.slug,
//       published: true,
//     }).lean();
//   }

//   if (!article) {
//     return { notFound: true };
//   }

//   // Fetch related articles (same tags or similar content, excluding current article)
//   const relatedArticles = await Article.find({
//     _id: { $ne: article._id },
//     published: true,
//     $or: [
//       { tags: { $in: article.tags || [] } },
//       { category: article.category }
//     ]
//   })
//   .limit(3)
//   .select('title slug coverImage excerpt description readingTime tags')
//   .lean();

//   // Track view only for published, non-preview pages
//   if (!preview) {
//     const today = new Date();
//     today.setUTCHours(0, 0, 0, 0); // normalize to UTC date-only for unique-per-day
//     try {
//       await DailyStat.updateOne(
//         { date: today },
//         { $inc: { articleViews: 1 } },
//         { upsert: true },
//       );
//     } catch (e) {
//       // Do not block rendering if analytics write fails
//       console.error("DailyStat update failed", e?.message || e);
//     }
//   }

//   return {
//     props: {
//       article: JSON.parse(JSON.stringify(article)),
//       relatedArticles: JSON.parse(JSON.stringify(relatedArticles)),
//       preview,
//     },
//   };
// }