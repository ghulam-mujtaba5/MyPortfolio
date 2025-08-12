import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import SEO from '../../components/SEO';
import NavBarDesktop from '../../components/NavBar_Desktop/nav-bar';
import NavBarMobile from '../../components/NavBar_Mobile/NavBar-mobile';
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';
import ArticleCard from '../../components/Articles/ArticleCard';
import cardBase from '../../components/Articles/ArticleCard.module.css';
import { useTheme } from '../../context/ThemeContext';

export default function ArticlesPage() {
  const { theme } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/articles');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load articles');
        setArticles(data.articles || data.items || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sections = [
    { label: 'Home', route: '/#home-section' },
    { label: 'About', route: '/#about-section' },
    { label: 'Resume', route: '/resume' },
    { label: 'Projects', route: '/projects' },
    { label: 'Articles', route: '/articles' },
    { label: 'Contact', route: '/#contact-section' }
  ];

  return (
    <>
      <SEO
        title="Articles | Ghulam Mujtaba"
        description="Articles by Ghulam Mujtaba on software, data science, and AI."
        url="https://ghulammujtaba.com/articles"
        canonical="https://ghulammujtaba.com/articles"
        keywords="Articles, Blog, Ghulam Mujtaba, Software, Data Science, AI"
      />

      <div style={{ backgroundColor: theme === 'dark' ? '#1d2127' : '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
        <header>
          <NavBarDesktop />
          <NavBarMobile sections={sections} />
        </header>

        <main style={{ maxWidth: 1160, margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ marginBottom: '1.25rem' }}>Articles</h1>
          {loading && <p>Loading articles…</p>}
          {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}
          {!loading && !error && articles.length === 0 && (
            <div className={cardBase.empty}>No articles yet. Check back soon.</div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className={cardBase.grid}>
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
