import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import SEO from '../../components/SEO';
import NavBarDesktop from '../../components/NavBar_Desktop/nav-bar';
import NavBarMobile from '../../components/NavBar_Mobile/NavBar-mobile';
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ArticleCard from '../../components/Articles/ArticleCard';
import cardBase from '../../components/Articles/ArticleCard.module.css';
import { useTheme } from '../../context/ThemeContext';

export default function ArticlesPage() {
  const { theme } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const router = useRouter();
  const page = useMemo(() => Number(router.query.page || 1), [router.query.page]);
  const limit = useMemo(() => Number(router.query.limit || 9), [router.query.limit]);
  const search = useMemo(() => String(router.query.search || ''), [router.query.search]);

  useEffect(() => {
    async function load() {
      try {
        const qs = new URLSearchParams({ page: String(page), limit: String(limit), search });
        const res = await fetch(`/api/articles?${qs.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load articles');
        setArticles(data.articles || data.items || []);
        if (data.pagination) setPagination(data.pagination);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, limit, search]);

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
          {/* Controls */}
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
            <input
              type="text"
              placeholder="Search articles..."
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value;
                  router.push({ pathname: '/articles', query: { ...router.query, search: val, page: 1 } });
                }
              }}
              style={{ flex:1, maxWidth: 420, padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8 }}
            />
          </div>
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

          {/* Pagination */}
          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16 }}>
              <button
                onClick={() => router.push({ pathname: '/articles', query: { ...router.query, page: Math.max(1, page - 1) } })}
                disabled={page <= 1}
                style={{ padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:8, opacity: page<=1 ? .5 : 1 }}
              >
                Previous
              </button>
              <span>Page {pagination.page || page} of {pagination.totalPages}</span>
              <button
                onClick={() => router.push({ pathname: '/articles', query: { ...router.query, page: Math.min((pagination.totalPages||page+1), page + 1) } })}
                disabled={page >= (pagination.totalPages || page)}
                style={{ padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:8, opacity: page>=(pagination.totalPages||page) ? .5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
