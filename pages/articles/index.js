import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import SEO from '../../components/SEO';
import NavBarDesktop from '../../components/NavBar_Desktop/nav-bar';
import NavBarMobile from '../../components/NavBar_Mobile/NavBar-mobile';
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ArticleCard from '../../components/Articles/ArticleCard';
import listCss from '../../components/Articles/ArticlesListPage.module.css';
import { useTheme } from '../../context/ThemeContext';

export default function ArticlesPage() {
  const { theme } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [topTags, setTopTags] = useState([]);
  const router = useRouter();
  const page = useMemo(() => Number(router.query.page || 1), [router.query.page]);
  const limit = useMemo(() => Number(router.query.limit || 9), [router.query.limit]);
  const search = useMemo(() => String(router.query.search || ''), [router.query.search]);
  const tag = useMemo(() => String(router.query.tag || ''), [router.query.tag]);
  const sort = useMemo(() => String(router.query.sort || 'relevance'), [router.query.sort]);
  const [searchTerm, setSearchTerm] = useState(search);
  const [activeTag, setActiveTag] = useState(tag);
  const [sortOrder, setSortOrder] = useState(sort);

  useEffect(() => {
    async function load() {
      try {
        const qs = new URLSearchParams({ page: String(page), limit: String(limit), search, tag, sort });
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
  }, [page, limit, search, tag, sort]);

  // Keep controlled input in sync with URL when it changes externally
  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  // Debounced search routing
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchTerm !== search) {
        router.push({ pathname: '/articles', query: { ...router.query, search: searchTerm, page: 1 } });
      }
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Fetch top tags
  useEffect(() => {
    async function fetchTopTags() {
      try {
        const res = await fetch('/api/articles/toptags');
        const data = await res.json();
        if (data.success) {
          setTopTags(data.data);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchTopTags();
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
          <div className="hide-on-mobile">
            <NavBarDesktop />
          </div>
          <div className="show-on-mobile">
            <NavBarMobile sections={sections} />
          </div>
        </header>

        <main style={{ maxWidth: 1160, margin: '0 auto', padding: '0 1rem 2rem' }}>
          {/* Hero */}
          <section className={listCss.hero}>
            <h1 className={listCss.heroTitle}>Articles</h1>
            <p className={listCss.heroSubtitle}>Insights on software, data science, and AI.</p>
            {/* Controls */}
            <div className={listCss.controls}>
              <input
                type="text"
                placeholder="Search articles..."
                className={listCss.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className={listCss.filters}>
                <div className={listCss.tags}>
                  <span className={listCss.filterLabel}>Tags:</span>
                  {topTags.map(t => (
                    <button key={t} className={`${listCss.tagChip} ${tag === t ? listCss.activeTag : ''}`} onClick={() => router.push({ pathname: '/articles', query: { ...router.query, tag: tag === t ? '' : t, page: 1 }})}>{t}</button>
                  ))}
                </div>
                <div className={listCss.sort}>
                  <span className={listCss.filterLabel}>Sort by:</span>
                  <select className={listCss.sortSelect} value={sort} onChange={e => router.push({ pathname: '/articles', query: { ...router.query, sort: e.target.value, page: 1 }})}>
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="views">Most Views</option>
                  </select>
                </div>
                {(Boolean(search) || Boolean(tag)) && (
                  <button
                    type="button"
                    className={listCss.clearBtn}
                    onClick={() => router.push({ pathname: '/articles', query: { page: 1, limit } })}
                    title="Clear filters"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className={listCss.resultMeta}>
                {loading ? 'Searching…' : `${pagination.total || 0} result${(pagination.total||0)===1?'':'s'}`}
              </div>
            </div>
          </section>

          {/* Content grid */}
          {loading && (
            <div className={listCss.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div className={listCss.skeletonCard} key={i}>
                  <div className={listCss.skelImage} />
                  <div className={listCss.skelContent}>
                    <div className={`${listCss.skelLine} ${listCss.medium}`} />
                    <div className={`${listCss.skelLine} ${listCss.medium}`} />
                    <div className={`${listCss.skelLine} ${listCss.short}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}

          {!loading && !error && articles.length === 0 && (
            <div className={listCss.empty}>
              {(() => {
                if (search && tag) {
                  return `No articles found for "${search}" with the tag "${tag}".`;
                }
                if (search) {
                  return `No articles found for "${search}". Try a different search.`;
                }
                if (tag) {
                  return `No articles found with the tag "${tag}".`;
                }
                return 'No articles yet. Check back soon.';
              })()}
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className={listCss.grid}>
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} highlight={search} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <div className={listCss.pagination}>
              <button
                onClick={() => router.push({ pathname: '/articles', query: { ...router.query, page: Math.max(1, page - 1) } })}
                disabled={page <= 1}
                className={listCss.pageBtn}
              >
                Previous
              </button>
              <span className={listCss.pageInfo}>Page {pagination.page || page} of {pagination.totalPages}</span>
              <button
                onClick={() => router.push({ pathname: '/articles', query: { ...router.query, page: Math.min((pagination.totalPages||page+1), page + 1) } })}
                disabled={page >= (pagination.totalPages || page)}
                className={listCss.pageBtn}
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
