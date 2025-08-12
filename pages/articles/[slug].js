import React from 'react';
import Head from 'next/head';
import SEO from '../../components/SEO';
import NavBarDesktop from '../../components/NavBar_Desktop/nav-bar';
import NavBarMobile from '../../components/NavBar_Mobile/NavBar-mobile';
import Footer from '../../components/Footer/Footer';
import { useTheme } from '../../context/ThemeContext';
import dbConnect from '../../lib/mongoose';
import Article from '../../models/Article';
import DailyStat from '../../models/DailyStat';
import PreviewBanner from '../../components/Admin/PreviewBanner/PreviewBanner';

export default function ArticleDetailPage({ article, preview }) {
  const { theme } = useTheme();

  const sections = [
    { label: 'Home', route: '/#home-section' },
    { label: 'About', route: '/#about-section' },
    { label: 'Resume', route: '/resume' },
    { label: 'Projects', route: '/projects' },
    { label: 'Articles', route: '/articles' },
    { label: 'Contact', route: '/#contact-section' }
  ];

  if (!article) {
    return <div>Article not found.</div>;
  }

  const title = `${article.title} | Articles`;
  const desc = article.excerpt || 'An article by Ghulam Mujtaba';

  return (
    <>
      <SEO
        title={title}
        description={desc}
        url={`https://ghulammujtaba.com/articles/${article.slug || ''}`}
        canonical={`https://ghulammujtaba.com/articles/${article.slug || ''}`}
        keywords="Articles, Blog, Ghulam Mujtaba, Software, Data Science, AI"
      />
      <div style={{ backgroundColor: theme === 'dark' ? '#1d2127' : '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
        <header>
          <NavBarDesktop />
          <NavBarMobile sections={sections} />
        </header>

        <main style={{ maxWidth: 840, margin: '0 auto', padding: '2rem 1rem' }}>
          {preview && <PreviewBanner />}
          <article>
            <h1 style={{ marginBottom: '0.5rem' }}>{article.title}</h1>
            {article.updatedAt && (
              <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Updated: {new Date(article.updatedAt).toLocaleDateString()}
              </div>
            )}
            <div style={{ lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { params, preview = false, previewData } = context;
  await dbConnect();

  let article;

  if (preview && previewData?.id) {
    article = await Article.findById(previewData.id).lean();
  } else {
    article = await Article.findOne({ slug: params.slug, published: true }).lean();
  }

  if (!article) {
    return { notFound: true };
  }

  // Track view only for published, non-preview pages
  if (!preview) {
    const today = new Date().toISOString().split('T')[0];
    await DailyStat.updateOne(
      { date: today, type: 'article', contentId: article._id },
      { $inc: { views: 1 } },
      { upsert: true }
    );
  }

  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
      preview,
    },
  };
}
