// pages/admin/search.js
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import Tooltip from '../../components/Admin/Tooltip/Tooltip';
import Highlight from '../../components/Highlight/Highlight';
import styles from './articles/articles.module.css';

export default function AdminSearchPage() {
  const router = useRouter();
  const [q, setQ] = useState(router.query.q || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ariaMsg, setAriaMsg] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;
    const queryQ = String(router.query.q || '');
    setQ(queryQ);
    if (queryQ) doSearch(queryQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.q]);

  const doSearch = async (query) => {
    const trimmed = String(query).trim();
    if (!trimmed) { setResults([]); setAriaMsg('Enter a query to search'); return; }
    setLoading(true);
    setError('');
    setAriaMsg(`Searching for "${trimmed}"`);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}&limit=20`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to search');
      const list = Array.isArray(data.data) ? data.data : [];
      setResults(list);
      setAriaMsg(`${list.length} result${list.length !== 1 ? 's' : ''} for "${trimmed}"`);
    } catch (e) {
      setError(e.message || 'Search failed');
      setAriaMsg('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    router.push(`/admin/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min((results.length || 0) - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(-1, prev - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        router.push(`/admin/articles/preview/${encodeURIComponent(results[activeIndex].slug)}`);
      }
    }
  };

  return (
    <AdminLayout title="Admin Search">
      <div className={styles.visuallyHidden} aria-live="polite" role="status">{ariaMsg}</div>
      <div className={styles.header}>
        <h1>Global Search</h1>
      </div>
      <form onSubmit={onSubmit} style={{display:'flex', gap:8, alignItems:'center'}}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          ref={inputRef}
          placeholder="Search articles by title, tag, category..."
          className={styles.searchInput}
          style={{maxWidth:480}}
          aria-label="Search query"
        />
        <Tooltip content="Search">
          <button type="submit" className={`${styles.iconButton} ${styles.iconButtonPrimary}`} title="Search" aria-label="Search">Search</button>
        </Tooltip>
      </form>

      {loading && <p style={{marginTop:12}} aria-live="polite">Searching…</p>}
      {error && <p style={{marginTop:12, color:'crimson'}}>{error}</p>}

      <div style={{marginTop:16}} aria-busy={loading}>
        {results.length === 0 && !loading && q && (
          <p>No results.</p>
        )}
        {results.length > 0 && (
          <div>
            <div className={styles.resultsMeta}>{results.length} result{results.length !== 1 ? 's' : ''}</div>
            <ul className={styles.resultsList} role="listbox" aria-label="Search results" aria-busy={loading}>
              {results.map((r, idx) => {
                const isScheduled = r.published && r.publishAt && new Date(r.publishAt) > new Date();
                const status = r.published ? (isScheduled ? 'Scheduled' : 'Published') : 'Draft';
                const active = idx === activeIndex;
                return (
                  <li
                    key={r._id}
                    role="option"
                    aria-selected={active}
                    className={`${styles.resultRow} ${active ? styles.resultActive : ''}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => router.push(`/admin/articles/preview/${encodeURIComponent(r.slug)}`)}
                  >
                    <div className={styles.resultTitle}>
                      <Highlight text={r.title} highlight={q} />
                    </div>
                    <div className={styles.resultMeta}>
                      <span className={`${styles.resultChip} ${status === 'Draft' ? styles.chipGray : status === 'Scheduled' ? styles.chipAmber : styles.chipGreen}`}>{status}</span>
                      <span className={styles.resultDate}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className={styles.resultActions}>
                      <Tooltip content="Preview">
                        <Link href={`/admin/articles/preview/${encodeURIComponent(r.slug)}`} className={`${styles.iconButton}`} title="Preview" aria-label="Preview">Preview</Link>
                      </Tooltip>
                      <Tooltip content="Open in list">
                        <Link href={`/admin/articles?search=${encodeURIComponent(r.title)}`} className={`${styles.iconButton}`} title="Open in list" aria-label="Open in list">Open</Link>
                      </Tooltip>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
