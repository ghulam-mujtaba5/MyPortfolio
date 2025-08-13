// pages/admin/articles/index.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import Icon from '../../../components/Admin/Icon/Icon';
import Tooltip from '../../../components/Admin/Tooltip/Tooltip';
import Modal from '../../../components/Admin/Modal/Modal';
import styles from './articles.module.css';
import SavedSearches from '../../../components/Admin/SavedSearches/SavedSearches';
import { ArticleListSkeleton } from '../../../components/Admin/Skeletons/Skeletons';

const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [topTags, setTopTags] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [bulkTagsCsv, setBulkTagsCsv] = useState('');
    const [bulkCategoriesCsv, setBulkCategoriesCsv] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [ariaMsg, setAriaMsg] = useState('');
    // Inline metadata edit state
    const [editingMetaId, setEditingMetaId] = useState(null);
    const [editTagsCsv, setEditTagsCsv] = useState('');
    const [editCategoriesCsv, setEditCategoriesCsv] = useState('');
    const [savingMeta, setSavingMeta] = useState(false);
    const [addTagInput, setAddTagInput] = useState('');
    const [addCategoryInput, setAddCategoryInput] = useState('');
    const editingContainerRef = useRef(null);
    const lastFocusRef = useRef(null);
    const errorDismissRef = useRef(null);
    const selectAllRef = useRef(null);
    const tableWrapperRef = useRef(null);
    const searchInputRef = useRef(null);
    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('Confirm action');
    const [confirmMessage, setConfirmMessage] = useState('');
    const onConfirmRef = useRef(null);
    // Name modal state for Saved Searches (replaces prompt)
    const [nameModalOpen, setNameModalOpen] = useState(false);
    const [nameModalMode, setNameModalMode] = useState('save'); // 'save' | 'rename'
    const [nameModalValue, setNameModalValue] = useState('');
    const [nameModalOriginal, setNameModalOriginal] = useState('');
    const [nameModalError, setNameModalError] = useState('');
    const nameInputRef = useRef(null);
    
    const router = useRouter();
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '', status = '', tag = '', category = '', hasCover = '' } = router.query;
    const prevPageRef = useRef(page);
    const prevLimitRef = useRef(limit);

    // Focus the name input when the modal opens
    useEffect(() => {
        if (nameModalOpen) {
            setTimeout(() => {
                try { if (nameInputRef.current && typeof nameInputRef.current.focus === 'function') nameInputRef.current.focus(); } catch {}
            }, 0);
        }
    }, [nameModalOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (savedSearchContainerRef.current && !savedSearchContainerRef.current.contains(event.target)) {
                setSavedSearchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Persist page size: apply saved value if not set, and save when changed
    useEffect(() => {
        try {
            if (!router.isReady) return;
            if (!router.query.limit) {
                const saved = localStorage.getItem('articles-page-size');
                if (saved) {
                    const params = new URLSearchParams({ ...router.query, limit: saved, page: 1 });
                    router.replace(`/admin/articles?${params.toString()}`);
                }
            }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady]);

    useEffect(() => {
        try { localStorage.setItem('articles-page-size', String(limit)); } catch {}
    }, [limit]);

    const fetchData = useCallback(async () => {
        setAriaMsg('Loading results…');
        setLoading(true);
        const query = new URLSearchParams({ page, limit, sortBy, sortOrder, search, status, tag, category, hasCover }).toString();
        try {
            const response = await fetch(`/api/admin/articles?${query}`);
            const data = await response.json();
            if (data.success) {
                setArticles(data.data);
                setPagination(data.pagination);
                // Announce results and pagination info for screen readers
                try {
                    const p = data.pagination || {};
                    const total = typeof p.total === 'number' ? p.total : (Array.isArray(data.data) ? data.data.length : 0);
                    const currentPage = p.page || page;
                    const totalPages = p.totalPages || (p.limit ? Math.max(1, Math.ceil(total / p.limit)) : undefined) || 1;
                    setAriaMsg(`${total} results. Page ${currentPage} of ${totalPages}`);
                } catch {}
            } else {
                toast.error('Failed to fetch articles.');
            }
        } catch (error) {
            toast.error('An error occurred while fetching articles.');
        }
        setLoading(false);
    }, [page, limit, sortBy, sortOrder, search, status, tag, category, hasCover]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // After page changes and content loads, move focus to the results
    useEffect(() => {
        if (!loading && prevPageRef.current !== page) {
            try { if (tableWrapperRef && tableWrapperRef.current && typeof tableWrapperRef.current.focus === 'function') tableWrapperRef.current.focus(); } catch {}
            prevPageRef.current = page;
        }
    }, [loading, page]);

    // When an error appears, focus the dismiss button for quick access
    useEffect(() => {
        if (errorMsg && errorDismissRef?.current) {
            try { setTimeout(() => errorDismissRef.current && errorDismissRef.current.focus(), 0); } catch {}
        }
    }, [errorMsg]);

    // Global keyboard shortcuts: '/' or Ctrl+K to focus search, 's' to open Save Search modal
    useEffect(() => {
        const handler = (e) => {
            try {
                const target = e.target;
                const tag = (target && target.tagName) || '';
                const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || (target && target.isContentEditable);
                if (isTyping) return;

                // Focus search with '/' or Ctrl+K
                if (e.key === '/' || (e.key && e.key.toLowerCase() === 'k' && e.ctrlKey)) {
                    e.preventDefault();
                    if (searchInputRef.current && typeof searchInputRef.current.focus === 'function') {
                        searchInputRef.current.focus();
                    }
                    return;
                }

                // Open Save modal with 's' when not already open and under limit
                if (!nameModalOpen && !confirmOpen && e.key && e.key.toLowerCase() === 's' && !e.metaKey && !e.altKey && !e.ctrlKey) {
                    e.preventDefault();
                    if (savedSearches.length >= 8) {
                        toast.error('Max 8 saved searches');
                        setAriaMsg('You have reached the maximum of 8 saved searches');
                        return;
                    }
                    try { lastFocusRef.current = document.activeElement; } catch {}
                    setNameModalMode('save');
                    setNameModalValue('');
                    setNameModalOriginal('');
                    setNameModalError('');
                    setNameModalOpen(true);
                }
            } catch {}
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [nameModalOpen, confirmOpen, savedSearches.length]);

    // After page or page size (limit) changes and loading completes, move focus to results table wrapper
    useEffect(() => {
        if (loading) return;
        const pageChanged = String(prevPageRef.current) !== String(page);
        const limitChanged = String(prevLimitRef.current) !== String(limit);
        if (pageChanged || limitChanged) {
            try {
                setTimeout(() => { if (tableWrapperRef.current && typeof tableWrapperRef.current.focus === 'function') tableWrapperRef.current.focus(); }, 0);
            } catch {}
            prevPageRef.current = page;
            prevLimitRef.current = limit;
        }
    }, [loading, page, limit]);

    // Keyboard shortcuts to focus the search input ("/" and Ctrl+K)
    const handler = useCallback((e) => {
        try {
            // Do not hijack when typing in inputs or when a dialog is open
            if (confirmOpen) return;
            const target = e.target || {};
            const tag = (target.tagName || '').toLowerCase();
            const isTyping = target.isContentEditable || ['input','textarea','select'].includes(tag);
            const ctrlK = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');
            const slash = !isTyping && e.key === '/';
            const quickNew = !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'n' || e.key === 'N');
            if (ctrlK || slash) {
                e.preventDefault();
                if (searchInputRef.current && typeof searchInputRef.current.focus === 'function') {
                    searchInputRef.current.focus();
                    try { searchInputRef.current.select && searchInputRef.current.select(); } catch {}
                    setAriaMsg('Focus moved to search');
                }
                return;
            }
            if (quickNew) {
                e.preventDefault();
                setAriaMsg('Opening new article form');
                router.push('/admin/articles/new');
                return;
            }
        } catch {}
    }, [confirmOpen, router]);

    // Attach global keydown for shortcuts
    useEffect(() => {
        try { window.addEventListener('keydown', handler, { capture: true }); } catch { try { window.addEventListener('keydown', handler); } catch {} }
        return () => { try { window.removeEventListener('keydown', handler, { capture: true }); } catch { try { window.removeEventListener('keydown', handler); } catch {} } };
    }, [handler]);

    // Keep select-all checkbox indeterminate when some rows are selected
    useEffect(() => {
        try {
            if (selectAllRef && selectAllRef.current) {
                const some = selectedArticles.length > 0 && selectedArticles.length < articles.length;
                selectAllRef.current.indeterminate = !!some;
            }
        } catch {}
    }, [selectedArticles, articles]);

    // Create a concise human-readable summary for saved search query objects
    const summarizeQuery = (q = {}) => {
        try {
            const parts = [];
            if (q.search) parts.push(`search:"${q.search}"`);
            if (q.status) parts.push(`status:${q.status}`);
            if (q.tag) parts.push(`tags:${q.tag}`);
            if (q.category) parts.push(`categories:${q.category}`);
            if (typeof q.hasCover !== 'undefined' && q.hasCover !== '') {
                const val = String(q.hasCover).toLowerCase();
                if (val === '1' || val === 'true') parts.push('hasCover:yes');
                else if (val === '0' || val === 'false') parts.push('hasCover:no');
            }
            if (q.sortBy) parts.push(`sort:${q.sortBy} ${q.sortOrder || 'desc'}`);
            return parts.join('; ') || 'no filters';
        } catch {
            return 'no filters';
        }
    };

    // Accessible confirmation dialog helpers
    const openConfirm = (title, message, onConfirm) => {
        setConfirmTitle(title || 'Confirm action');
        setConfirmMessage(message || 'Are you sure?');
        onConfirmRef.current = onConfirm;
        setConfirmOpen(true);
        setAriaMsg(`${title}. ${message}`);
    };

    const handleConfirmAccept = async () => {
        try {
            if (onConfirmRef.current) await onConfirmRef.current();
        } finally {
            setConfirmOpen(false);
        }
    };

    // Load top tags for quick filtering
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/articles/toptags');
                const data = await res.json();
                if (res.ok && data.success && Array.isArray(data.data)) {
                    setTopTags(data.data);
                }
            } catch {}
        })();
    }, []);

    // Load top categories for quick filtering
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/articles/topcategories');
                const data = await res.json();
                if (res.ok && data.success && Array.isArray(data.data)) {
                    setTopCategories(data.data);
                }
            } catch {}
        })();
    }, []);

    // Announce selection changes for screen readers
    useEffect(() => {
        try {
            const count = selectedArticles.length;
            if (typeof count === 'number') {
                if (count > 0) setAriaMsg(`${count} item${count !== 1 ? 's' : ''} selected`);
                else setAriaMsg('Selection cleared');
            }
        } catch {}
    }, [selectedArticles]);

    const handleSort = (newSortBy) => {
        const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
        router.push(`/admin/articles?${new URLSearchParams({ ...router.query, sortBy: newSortBy, sortOrder: newSortOrder, page: 1 })}`);
        const labelMap = { title: 'Title', publishAt: 'Publish At', createdAt: 'Created At', views: 'Views' };
        const humanLabel = labelMap[newSortBy] || newSortBy;
        setAriaMsg(`Sorted by ${humanLabel} ${newSortOrder === 'asc' ? 'ascending' : 'descending'}`);
        try { setTimeout(() => { if (tableWrapperRef.current && typeof tableWrapperRef.current.focus === 'function') tableWrapperRef.current.focus(); }, 0); } catch {}
    };

    const setQuickStatus = (newStatus) => {
        router.push(`/admin/articles?${new URLSearchParams({ ...router.query, status: newStatus, page: 1 })}`);
        setAriaMsg(`Status filter set to ${newStatus || 'all'}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams({ ...router.query });
        ['search','status','tag','category','hasCover','page'].forEach(k => params.delete(k));
        params.set('page', '1');
        router.push(`/admin/articles?${params.toString()}`);
        setAriaMsg('All filters cleared');
    };

    const saveCurrentSearch = () => {
        try { lastFocusRef.current = document.activeElement; } catch {}
        setNameModalMode('save');
        setNameModalValue('');
        setNameModalOriginal('');
        setNameModalError('');
        setNameModalOpen(true);
    };

    const applySavedSearch = (entry) => {
        router.push(`/admin/articles?${new URLSearchParams(entry.query)}`);
        setAriaMsg(`Applied saved search "${entry.name || 'untitled'}"`);
        try { setTimeout(() => { if (tableWrapperRef.current && typeof tableWrapperRef.current.focus === 'function') tableWrapperRef.current.focus(); }, 0); } catch {}
    };

    // Create and copy a shareable link for a saved search (admin-only consumption)
    const copySavedSearchLink = async (entry) => {
        try {
            const base = typeof window !== 'undefined' ? window.location.origin : '';
            const url = `${base}/admin/articles?${new URLSearchParams(entry.query)}`;
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied');
                setAriaMsg(`Shareable link for "${entry.name || 'untitled'}" copied to clipboard`);
            } else {
                const el = document.createElement('textarea');
                el.value = url;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                toast.success('Link copied');
                setAriaMsg('Link copied to clipboard');
            }
        } catch (e) {
            toast.error(e?.message || 'Failed to copy link');
            setAriaMsg('Failed to copy link');
        }
    };

    const removeSavedSearch = (name) => {
        const next = savedSearches.filter(s => s.name !== name);
        setSavedSearches(next);
        try { localStorage.setItem('articles-saved-searches', JSON.stringify(next)); } catch {}
        setAriaMsg(`Saved search "${name}" deleted`);
    };

    const renameSavedSearch = (name) => {
        const current = savedSearches.find(s => s.name === name);
        if (!current) return;
        try { lastFocusRef.current = document.activeElement; } catch {}
        setNameModalMode('rename');
        setNameModalValue(name);
        setNameModalOriginal(name);
        setNameModalError('');
        setNameModalOpen(true);
    };

    // Handle name modal submit for save/rename
    const handleNameModalSubmit = (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const raw = String(nameModalValue || '').trim();
        if (!raw) { setNameModalError('Name is required'); return; }
        const exists = savedSearches.some(s => s.name.toLowerCase() === raw.toLowerCase());
        if (nameModalMode === 'save') {
            if (exists) { setNameModalError('A saved search with this name already exists'); return; }
            const entry = { name: raw, query: { ...router.query } };
            const next = [entry, ...savedSearches].slice(0, 8);
            setSavedSearches(next);
            try { localStorage.setItem('articles-saved-searches', JSON.stringify(next)); } catch {}
            setAriaMsg(`Saved search "${raw}" created`);
        } else if (nameModalMode === 'rename') {
            const original = String(nameModalOriginal || '');
            if (raw.toLowerCase() !== original.toLowerCase() && exists) { setNameModalError('A saved search with this name already exists'); return; }
            const next = savedSearches.map(s => s.name === original ? { ...s, name: raw } : s);
            setSavedSearches(next);
            try { localStorage.setItem('articles-saved-searches', JSON.stringify(next)); } catch {}
            setAriaMsg(`Saved search renamed to "${raw}"`);
        }
        setNameModalOpen(false);
        try { setTimeout(() => { if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') lastFocusRef.current.focus(); }, 0); } catch {}
    };

    const closeNameModal = () => {
        setNameModalOpen(false);
        setAriaMsg('Canceled');
        try { setTimeout(() => { if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') lastFocusRef.current.focus(); }, 0); } catch {}
    };

    const startEditMeta = (article) => {
        try { lastFocusRef.current = document.activeElement; } catch {}
        setEditingMetaId(article._id);
        setEditTagsCsv((article.tags || []).join(', '));
        setEditCategoriesCsv((article.categories || []).join(', '));
    };

    const cancelEditMeta = () => {
        setEditingMetaId(null);
        setEditTagsCsv('');
        setEditCategoriesCsv('');
        setAddTagInput('');
        setAddCategoryInput('');
        // restore focus to the trigger
        try { setTimeout(() => { if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') lastFocusRef.current.focus(); }, 0); } catch {}
    };

    const showUndoToast = (message, undoFn) => {
        toast.custom((t) => (
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#111827', color:'#fff', borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
            <span>{message}</span>
            <button
              className={styles.iconButton}
              style={{background:'#10b981', color:'#fff'}}
              onClick={async () => { try { await undoFn(); toast.dismiss(t.id); toast.success('Undone'); setAriaMsg('Undo complete'); } catch (e) { toast.error(e.message || 'Undo failed'); } }}
            >Undo</button>
            <button className={styles.iconButton} onClick={() => toast.dismiss(t.id)} aria-label="Close" title="Close">✕</button>
          </div>
        ), { duration: 6000 });
    };

    const saveEditMeta = async (article) => {
        try {
            setSavingMeta(true);
            const prev = { tags: article.tags || [], categories: article.categories || [] };
            const payload = {
                tags: String(editTagsCsv || '')
                    .split(',')
                    .map(t => t.trim())
                    .filter(Boolean),
                categories: String(editCategoriesCsv || '')
                    .split(',')
                    .map(c => c.trim())
                    .filter(Boolean),
            };
            const res = await fetch(`/api/articles/${encodeURIComponent(article.slug)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to update');
            setAriaMsg(`Updated tags and categories for "${article.title}"`);
            showUndoToast('Metadata updated. Undo?', async () => {
                const undoPayload = prev;
                const r = await fetch(`/api/articles/${encodeURIComponent(article.slug)}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prev)
                });
                if (!r.ok) { const d = await r.json().catch(()=>( {})); throw new Error(d?.message || d?.error || 'Undo failed'); }
                await fetchData();
            });
            cancelEditMeta();
            fetchData();
        } catch (e) {
            const msg = e.message || 'Failed to update';
            toast.error(msg);
            setErrorMsg(msg);
        } finally {
            setSavingMeta(false);
        }
    };

    const toggleShowCover = async (article) => {
        try {
            const res = await fetch(`/api/articles/${encodeURIComponent(article.slug)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showCoverImage: !article.showCoverImage }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to update');
            toast.success(!article.showCoverImage ? 'Cover shown' : 'Cover hidden');
            setAriaMsg(!article.showCoverImage ? 'Cover image shown' : 'Cover image hidden');
            fetchData();
        } catch (e) {
            const msg = e.message || 'Failed to update cover visibility';
            toast.error(msg);
            setErrorMsg(msg);
        }
    };

    const togglePublish = async (article) => {
        const action = article.published ? 'draft' : 'publish';
        try {
            const res = await fetch('/api/articles/bulk-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleIds: [article._id], action }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to toggle');
            toast.success(article.published ? 'Moved to Draft' : 'Published');
            setAriaMsg(article.published ? 'Moved to draft' : 'Published');
            fetchData();
        } catch (e) {
            const msg = e.message || 'Failed to update';
            toast.error(msg);
            setErrorMsg(msg);
        }
    };

    const togglePin = async (article) => {
        try {
            const res = await fetch('/api/admin/pin-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: article._id, type: 'article' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to toggle pin');
            toast.success(data.data.pinned ? 'Article pinned' : 'Article unpinned');
            setAriaMsg(data.data.pinned ? 'Article pinned' : 'Article unpinned');
            fetchData();
        } catch (e) {
            toast.error(e.message || 'Failed to update pin status');
        }
    };

    const handleBulkMetadata = async (op) => {
        if (selectedArticles.length === 0) return toast.error('No articles selected.');
        const confirmVerb = {
            addTags: 'add tags to',
            removeTags: 'remove tags from',
            addCategories: 'add categories to',
            removeCategories: 'remove categories from',
        }[op] || 'update';

        openConfirm(
            'Confirm bulk metadata',
            `Are you sure you want to ${confirmVerb} ${selectedArticles.length} articles?`,
            async () => {
                try {
                    const res = await fetch('/api/articles/bulk-metadata', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            articleIds: selectedArticles,
                            tagsCsv: bulkTagsCsv,
                            categoriesCsv: bulkCategoriesCsv,
                            op,
                        }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        toast.success('Bulk metadata updated.');
                        setSelectedArticles([]);
                        setAriaMsg('Bulk metadata applied');
                        await fetchData();
                    } else {
                        toast.error(data.message || 'Failed to update');
                    }
                } catch (error) {
                    toast.error(error.message);
                }
            }
        );
    };

    const handleBulkAction = async (action) => {
        if (selectedArticles.length === 0) return toast.error('No articles selected.');

        const humanAction = action === 'publish' ? 'publish' : action === 'draft' ? 'move to draft' : action === 'delete' ? 'delete' : 'update';
        openConfirm(
            'Confirm bulk action',
            `Are you sure you want to ${humanAction} ${selectedArticles.length} articles?`,
            async () => {
                try {
                    const res = await fetch('/api/articles/bulk-action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ articleIds: selectedArticles, action }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        toast.success(data.message);
                        const successLabel = action === 'publish' ? 'Published' : action === 'draft' ? 'Moved to draft' : action === 'delete' ? 'Deleted' : 'Updated';
                        setAriaMsg(`${successLabel} ${data?.count ?? selectedArticles.length} articles`);
                        setSelectedArticles([]);
                        fetchData();
                    } else {
                        throw new Error(data.message || 'Failed to perform bulk action');
                    }
                } catch (error) {
                    toast.error(error.message);
                    setAriaMsg('Bulk action failed');
                }
            }
        );
    };

    return (
        <AdminLayout title="Manage Articles">
            <div className={styles.header}>
                <h1>Articles</h1>
                <Tooltip content="Create new article">
                  <Link href="/admin/articles/new" className={`${styles.iconButton} ${styles.iconButtonPrimary}`} title="New Article" aria-label="New Article">
                    <Icon name="plus" title="New Article" />
                  </Link>
                </Tooltip>
            </div>
            {/* Screen reader announcements */}
            <div aria-live="polite" className={styles.visuallyHidden || ''}>{ariaMsg}</div>

            {/* Filters */}
            <div className={styles.filters}>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search by title..."
                    defaultValue={search}
                    onChange={(e) => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, search: e.target.value, page: 1 })}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        if (e.currentTarget.value) {
                          e.currentTarget.value = '';
                          const params = new URLSearchParams({ ...router.query, search: '', page: 1 });
                          router.push(`/admin/articles?${params.toString()}`);
                          setAriaMsg('Search cleared');
                        }
                      }
                    }}
                    aria-label="Search by title"
                    aria-describedby="searchHelp"
                    aria-keyshortcuts="/ Control+K"
                    title="Search by title (Shortcut: / or Ctrl+K)"
                    ref={searchInputRef}
                />
                <span id="searchHelp" className={styles.visuallyHidden || ''}>Type to filter articles by title. Results update as you type. Shortcut: press "/" or Ctrl+K to focus search. Press Escape to clear search.</span>
                {String(search || '').length > 0 && (
                  <Tooltip content="Clear search">
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => { const params = new URLSearchParams({ ...router.query, search: '', page: 1 }); router.push(`/admin/articles?${params.toString()}`); setAriaMsg('Search cleared'); setTimeout(() => { try { searchInputRef.current && searchInputRef.current.focus(); } catch {} }, 0); }}
                      aria-label="Clear search"
                      title="Clear search"
                    >
                      <Icon name="x" title="Clear" />
                    </button>
                  </Tooltip>
                )}
                <select
                    value={status}
                    onChange={(e) => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, status: e.target.value, page: 1 })}`)}
                    title="Status filter"
                    aria-label="Status filter"
                >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                </select>
                <select
                    value={hasCover}
                    onChange={(e) => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, hasCover: e.target.value, page: 1 })}`)}
                    title="Has cover image"
                    aria-label="Has cover image"
                >
                    <option value="">All Covers</option>
                    <option value="true">Has Cover</option>
                    <option value="false">No Cover</option>
                </select>
                <label htmlFor="pageSize" className={styles.visuallyHidden || ''}>Page size</label>
                <select
                    id="pageSize"
                    value={String(limit)}
                    onChange={(e) => { try { localStorage.setItem('articles-page-size', e.target.value); } catch {}; router.push(`/admin/articles?${new URLSearchParams({ ...router.query, limit: e.target.value, page: 1 })}`); setAriaMsg(`Page size set to ${e.target.value}`); }}
                    title="Page size"
                    aria-label="Page size"
                    aria-describedby="pageSizeHelp"
                >
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                    <option value="100">100 / page</option>
                </select>
                <span id="pageSizeHelp" className={styles.visuallyHidden || ''}>Changes how many results are shown per page. Moves focus to results after reload.</span>
                <div className={styles.quickFilters}>
                    <Tooltip content="Filter: All">
                      <button type="button" className={`${styles.iconButton} ${styles.quickFilterIcon} ${status === '' ? styles.active : ''}`} onClick={() => setQuickStatus('')} title="All" aria-label="All">
                        <Icon name="grid" title="All" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Filter: Published">
                      <button type="button" className={`${styles.iconButton} ${styles.quickFilterIcon} ${status === 'published' ? styles.active : ''}`} onClick={() => setQuickStatus('published')} title="Published" aria-label="Published">
                        <Icon name="check" title="Published" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Filter: Scheduled">
                      <button type="button" className={`${styles.iconButton} ${styles.quickFilterIcon} ${status === 'scheduled' ? styles.active : ''}`} onClick={() => setQuickStatus('scheduled')} title="Scheduled" aria-label="Scheduled">
                        <Icon name="timer" title="Scheduled" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Filter: Drafts">
                      <button type="button" className={`${styles.iconButton} ${styles.quickFilterIcon} ${status === 'draft' ? styles.active : ''}`} onClick={() => setQuickStatus('draft')} title="Drafts" aria-label="Drafts">
                        <Icon name="draft" title="Drafts" />
                      </button>
                    </Tooltip>
                </div>
                {/* Saved Searches Dropdown */}
                <SavedSearches scope="articles" />
                {/* Top Tags quick chips */}
                {topTags.length > 0 && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {topTags.map((t) => {
                        const activeList = String(tag || '')
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean);
                        const isActive = activeList.includes(t);
                        const toggle = () => {
                          let next;
                          if (isActive) next = activeList.filter((x) => x !== t);
                          else next = [...activeList, t];
                          const csv = next.join(',');
                          router.push(`/admin/articles?${new URLSearchParams({ ...router.query, tag: csv, page: 1 })}`);
                          setAriaMsg(`Tag filters set to ${csv || 'none'}`);
                        };
                        return (
                          <Tooltip content={`Filter by #${t}`}>
                            <button
                              key={t}
                              type="button"
                              onClick={toggle}
                              className={styles.iconButton}
                              style={{
                                padding:'6px 10px',
                                borderRadius:16,
                                border: isActive ? '1px solid var(--primary)' : '1px solid #e5e7eb',
                                background: isActive ? 'var(--primary-50, #eef2ff)' : 'white',
                                color: isActive ? 'var(--primary-700, #4338ca)' : 'inherit'
                              }}
                              aria-pressed={isActive}
                              title={`Filter by #${t}`}
                            >
                              #{t}
                            </button>
                          </Tooltip>
                        );
                      })}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <label htmlFor="tagsCsv" className={styles.srOnly || ''}>Tags</label>
                      <input
                        id="tagsCsv"
                        type="text"
                        placeholder="Tags CSV (e.g., react, nextjs)"
                        defaultValue={tag}
                        onBlur={(e) => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, tag: e.target.value.trim(), page: 1 })}`)}
                        className={styles.searchInput}
                        style={{ maxWidth: 320 }}
                        aria-describedby="filterTagsHelp"
                      />
                      <span id="filterTagsHelp" className={styles.visuallyHidden || ''}>Comma separated tags, for example: react, nextjs. Press Enter or move focus to apply.</span>
                      {tag && (
                        <Tooltip content="Clear tags filter">
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, tag: '', page: 1 })}`)}
                            title="Clear tags"
                            aria-label="Clear tags"
                          >
                            Clear
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                )}
                {/* Category chips and multi-select */}
                {topCategories.length > 0 && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {topCategories.map((c) => {
                        const activeList = String(category || '')
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean);
                        const isActive = activeList.includes(c);
                        const toggle = () => {
                          let next;
                          if (isActive) next = activeList.filter((x) => x !== c);
                          else next = [...activeList, c];
                          const csv = next.join(',');
                          router.push(`/admin/articles?${new URLSearchParams({ ...router.query, category: csv, page: 1 })}`);
                          setAriaMsg(`Category filters set to ${csv || 'none'}`);
                        };
                        return (
                          <Tooltip content={`Filter by category: ${c}`}>
                            <button
                              key={c}
                              type="button"
                              onClick={toggle}
                              className={styles.iconButton}
                              style={{
                                padding:'6px 10px',
                                borderRadius:16,
                                border: isActive ? '1px solid var(--primary)' : '1px solid #e5e7eb',
                                background: isActive ? 'var(--primary-50, #eef2ff)' : 'white',
                                color: isActive ? 'var(--primary-700, #4338ca)' : 'inherit'
                              }}
                              aria-pressed={isActive}
                              title={`Filter by category: ${c}`}
                            >
                              {c}
                            </button>
                          </Tooltip>
                        );
                      })}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <label htmlFor="categoryCsv" className={styles.visuallyHidden || ''}>Categories</label>
                      <input
                        id="categoryCsv"
                        type="text"
                        placeholder="Categories CSV (e.g., AI, Web Dev)"
                        defaultValue={category}
                        onBlur={(e) => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, category: e.target.value.trim(), page: 1 })}`)}
                        className={styles.searchInput}
                        style={{ maxWidth: 360 }}
                        aria-describedby="filterCategoriesHelp"
                      />
                      <span id="filterCategoriesHelp" className={styles.visuallyHidden || ''}>Comma separated categories, for example: AI, Web Dev. Press Enter or move focus to apply.</span>
                      {category && (
                        <Tooltip content="Clear categories filter">
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, category: '', page: 1 })}`)}
                            title="Clear categories"
                            aria-label="Clear categories"
                          >
                            Clear
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Selection Bar */}
            {selectedArticles.length > 0 && (
                <div className={styles.selectionBar}>
                    <span>{selectedArticles.length} selected</span>
                    <div className={styles.bulkActions}>
                        <Tooltip content="Publish selected">
                          <button className={styles.iconButton} onClick={() => handleBulkAction('publish')} title="Publish" aria-label="Publish selected"><Icon name="check" title="Publish" /></button>
                        </Tooltip>
                        <Tooltip content="Move selected to Draft">
                          <button className={styles.iconButton} onClick={() => handleBulkAction('draft')} title="Set Draft" aria-label="Set draft for selected"><Icon name="draft" title="Set Draft" /></button>
                        </Tooltip>
                        <Tooltip content="Delete selected">
                          <button className={`${styles.iconButton}`} onClick={() => handleBulkAction('delete')} title="Delete" aria-label="Delete selected"><Icon name="trash" title="Delete" /></button>
                        </Tooltip>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <input
                          type="text"
                          placeholder="Tags CSV"
                          value={bulkTagsCsv}
                          onChange={(e) => setBulkTagsCsv(e.target.value)}
                          className={styles.searchInput}
                          style={{ maxWidth: 220 }}
                          aria-label="Bulk tags CSV"
                          aria-describedby="bulkTagsHelp"
                        />
                        <span id="bulkTagsHelp" className={styles.visuallyHidden || ''}>Comma separated tags, for example: react, nextjs</span>
                        <Tooltip content="Add tags to selected">
                          <button className={styles.iconButton} onClick={() => handleBulkMetadata('addTags')} title="Add tags to selected" aria-label="Add tags">Add Tags</button>
                        </Tooltip>
                        <Tooltip content="Remove tags from selected">
                          <button className={styles.iconButton} onClick={() => handleBulkMetadata('removeTags')} title="Remove tags from selected" aria-label="Remove tags">Remove Tags</button>
                        </Tooltip>
                        <input
                          type="text"
                          placeholder="Categories CSV"
                          value={bulkCategoriesCsv}
                          onChange={(e) => setBulkCategoriesCsv(e.target.value)}
                          className={styles.searchInput}
                          style={{ maxWidth: 240 }}
                          aria-label="Bulk categories CSV"
                          aria-describedby="bulkCategoriesHelp"
                        />
                        <span id="bulkCategoriesHelp" className={styles.visuallyHidden || ''}>Comma separated categories, for example: AI, Web Dev</span>
                        <Tooltip content="Add categories to selected">
                          <button className={styles.iconButton} onClick={() => handleBulkMetadata('addCategories')} title="Add categories to selected" aria-label="Add categories">Add Categories</button>
                        </Tooltip>
                        <Tooltip content="Remove categories from selected">
                          <button className={styles.iconButton} onClick={() => handleBulkMetadata('removeCategories')} title="Remove categories from selected" aria-label="Remove categories">Remove Categories</button>
                        </Tooltip>
                    </div>
                </div>
            )}

            {loading ? (
                <ArticleListSkeleton />
            ) : (
                <>
                    <div className={styles.visuallyHidden} aria-live="polite" aria-atomic="true" role="status">{ariaMsg}</div>
                    {errorMsg && (
                      <div role="alert" aria-live="assertive" className={styles.emptyState} style={{borderStyle:'solid', borderColor:'#fecaca', background:'#fff1f2', color:'#991b1b'}}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
                          <span>{errorMsg}</span>
                          <button ref={errorDismissRef} type="button" className={styles.iconButton} onClick={() => { setErrorMsg(''); setAriaMsg('Error dismissed'); }} aria-label="Dismiss error" title="Dismiss">✕</button>
                        </div>
                      </div>
                    )}
                    <div ref={tableWrapperRef} className={styles.tableWrapper} aria-busy={loading} tabIndex={-1} aria-label="Articles results">
                      {articles.length === 0 ? (
                        <div className={styles.emptyState}>
                          <div>No articles match the current filters.</div>
                          <div className={styles.emptyActions}>
                            <Tooltip content="Clear all filters and show all articles">
                              <button type="button" className={styles.iconButton} onClick={clearFilters} title="Clear all filters" aria-label="Clear all filters">Clear all filters</button>
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        <table className={styles.table}>
                        <caption className={styles.visuallyHidden || ''}>Use Enter or Space on column headers to sort. Use the first column checkboxes to select rows for bulk actions.</caption>
                        <thead>
                            <tr>
                                <th scope="col">
                                  <Tooltip content="Select all">
                                    <input
                                      type="checkbox"
                                      onChange={(e) => { const checked = e.target.checked; const all = articles.map(a => a._id); setSelectedArticles(checked ? all : []); setAriaMsg(checked ? `All ${articles.length} items selected` : 'Selection cleared'); }}
                                      checked={articles.length > 0 && selectedArticles.length === articles.length}
                                      ref={selectAllRef}
                                      aria-label="Select all"
                                      title="Select all"
                                    />
                                  </Tooltip>
                                </th>
                                <th scope="col">Cover</th>
                                <th
                                  className={styles.sortable}
                                  onClick={() => handleSort('title')}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('title'); } }}
                                  tabIndex={0}
                                  aria-sort={sortBy === 'title' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                                  title="Sort by Title"
                                >
                                    Title {sortBy === 'title' && (
                                      <span className={styles.sortIndicator}>
                                        <Icon name={sortOrder === 'asc' ? 'chevronUp' : 'chevronDown'} />
                                      </span>
                                    )}
                                </th>
                                <th scope="col"
                                  className={styles.sortable}
                                  onClick={() => handleSort('publishAt')}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('publishAt'); } }}
                                  tabIndex={0}
                                  aria-sort={sortBy === 'publishAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                                  title="Sort by Publish At"
                                >
                                    Publish At {sortBy === 'publishAt' && (
                                      <span className={styles.sortIndicator}>
                                        <Icon name={sortOrder === 'asc' ? 'chevronUp' : 'chevronDown'} />
                                      </span>
                                    )}
                                </th>
                                <th scope="col"
                                  className={styles.sortable}
                                  onClick={() => handleSort('createdAt')}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('createdAt'); } }}
                                  tabIndex={0}
                                  aria-sort={sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                                  title="Sort by Created At"
                                >
                                    Created At {sortBy === 'createdAt' && (
                                      <span className={styles.sortIndicator}>
                                        <Icon name={sortOrder === 'asc' ? 'chevronUp' : 'chevronDown'} />
                                      </span>
                                    )}
                                </th>
                                <th scope="col"
                                  className={styles.sortable}
                                  onClick={() => handleSort('views')}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('views'); } }}
                                  tabIndex={0}
                                  aria-sort={sortBy === 'views' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                                  title="Sort by Views"
                                >
                                    Views {sortBy === 'views' && (
                                      <span className={styles.sortIndicator}>
                                        <Icon name={sortOrder === 'asc' ? 'chevronUp' : 'chevronDown'} />
                                      </span>
                                    )}
                                </th>
                                <th scope="col">Status</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article._id} className={selectedArticles.includes(article._id) ? styles.selectedRow : ''} aria-selected={selectedArticles.includes(article._id) ? 'true' : 'false'}>
                                    <td>
                                      <Tooltip content={selectedArticles.includes(article._id) ? 'Deselect row' : 'Select row'}>
                                        <input
                                          type="checkbox"
                                          checked={selectedArticles.includes(article._id)}
                                          onChange={() => {
                                            setSelectedArticles(prev => prev.includes(article._id) ? prev.filter(id => id !== article._id) : [...prev, article._id])
                                          }}
                                          aria-label={`Select ${article.title}`}
                                          title="Select row"
                                        />
                                      </Tooltip>
                                    </td>
                                    <td>
                                      <div className={styles.coverCell}>
                                        {article.coverImage ? (
                                          <img src={article.coverImage} alt={`Cover image for ${article.title}`} className={styles.coverThumb} />
                                        ) : (
                                          <div className={styles.coverThumb} />
                                        )}
                                        <Tooltip content={article.showCoverImage ? 'Hide cover' : 'Show cover'}>
                                          <button
                                            type="button"
                                            onClick={() => toggleShowCover(article)}
                                            className={styles.iconButton}
                                            title={article.showCoverImage ? 'Hide cover' : 'Show cover'}
                                            aria-label={article.showCoverImage ? 'Hide cover' : 'Show cover'}
                                          >
                                            {article.showCoverImage ? 'Shown' : 'Hidden'}
                                          </button>
                                        </Tooltip>
                                      </div>
                                    </td>
                                    <th scope="row">{article.title}</th>
                                    <td>{article.publishAt ? new Date(article.publishAt).toLocaleString() : '-'}</td>
                                    <td>{new Date(article.createdAt).toLocaleDateString()}</td>
                                    <td>{(typeof article.views === 'number' ? article.views : 0).toLocaleString()}</td>
                                    <td>
                                      <Tooltip content={article.published ? 'Set Draft' : 'Publish'}>
                                        <button
                                          type="button"
                                          onClick={() => togglePublish(article)}
                                          className={styles.iconButton}
                                          title={article.published ? 'Set Draft' : 'Publish'}
                                          aria-label={article.published ? 'Set Draft' : 'Publish'}
                                        >
                                          {article.published ? (
                                            (() => {
                                              const isScheduled = article.publishAt && new Date(article.publishAt) > new Date();
                                              return (
                                                <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                                                  {isScheduled ? (
                                                    <>
                                                      <Icon name="timer" /> Scheduled {article.publishAt ? `(${new Date(article.publishAt).toLocaleString()})` : ''}
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Icon name="check" /> Published
                                                    </>
                                                  )}
                                                </span>
                                              );
                                            })()
                                          ) : (
                                            <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                                              <Icon name="draft" /> Draft
                                            </span>
                                          )}
                                        </button>
                                      </Tooltip>
                                    </td>
                                    <td>
                                        {editingMetaId === article._id ? (
                                          <div
                                            ref={editingContainerRef}
                                            onBlur={() => {
                                              // blur-save when focus leaves the editor entirely
                                              setTimeout(() => {
                                                const el = editingContainerRef.current;
                                                if (!el) return;
                                                if (document.activeElement && el.contains(document.activeElement)) return;
                                                if (!savingMeta) {
                                                  saveEditMeta(article);
                                                }
                                              }, 0);
                                            }}
                                            style={{display:'flex', flexDirection:'column', gap:10, minWidth:360}}
                                          >
                                            {/* Tags chips */}
                                            <div>
                                              <div className={styles.chipGroup}>
                                                {String(editTagsCsv || '')
                                                  .split(',')
                                                  .map(t => t.trim())
                                                  .filter(Boolean)
                                                  .map((t) => (
                                                    <span key={t} className={styles.chip} title={`Tag: ${t}`}>
                                                      <span className={styles.chipText}>#{t}</span>
                                                      <button type="button" className={styles.chipClose} onClick={() => setEditTagsCsv(String(editTagsCsv || '').split(',').map(x=>x.trim()).filter(Boolean).filter(x => x !== t).join(', '))} aria-label={`Remove tag ${t}`} title="Remove">
                                                        <Icon name="close" />
                                                      </button>
                                                    </span>
                                                  ))}
                                              </div>
                                              <div className={styles.chipAddRow}>
                                                <input
                                                  type="text"
                                                  value={addTagInput}
                                                  onChange={(e) => setAddTagInput(e.target.value)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.preventDefault();
                                                      const val = addTagInput.trim();
                                                      if (!val) return;
                                                      const arr = String(editTagsCsv || '').split(',').map(x=>x.trim()).filter(Boolean);
                                                      if (!arr.includes(val)) {
                                                        setEditTagsCsv([...arr, val].join(', '));
                                                      }
                                                      setAddTagInput('');
                                                    }
                                                  }}
                                                  placeholder="Add tag and press Enter"
                                                  className={styles.chipInput}
                                                  aria-label="Add tag"
                                                />
                                              </div>
                                            </div>
                                            {/* Categories chips */}
                                            <div>
                                              <div className={styles.chipGroup}>
                                                {String(editCategoriesCsv || '')
                                                  .split(',')
                                                  .map(c => c.trim())
                                                  .filter(Boolean)
                                                  .map((c) => (
                                                    <span key={c} className={styles.chip} title={`Category: ${c}`}>
                                                      <span className={styles.chipText}>{c}</span>
                                                      <button type="button" className={styles.chipClose} onClick={() => setEditCategoriesCsv(String(editCategoriesCsv || '').split(',').map(x=>x.trim()).filter(Boolean).filter(x => x !== c).join(', '))} aria-label={`Remove category ${c}`} title="Remove">
                                                        <Icon name="close" />
                                                      </button>
                                                    </span>
                                                  ))}
                                              </div>
                                              <div className={styles.chipAddRow}>
                                                <input
                                                  type="text"
                                                  value={addCategoryInput}
                                                  onChange={(e) => setAddCategoryInput(e.target.value)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                      e.preventDefault();
                                                      const val = addCategoryInput.trim();
                                                      if (!val) return;
                                                      const arr = String(editCategoriesCsv || '').split(',').map(x=>x.trim()).filter(Boolean);
                                                      if (!arr.includes(val)) {
                                                        setEditCategoriesCsv([...arr, val].join(', '));
                                                      }
                                                      setAddCategoryInput('');
                                                    }
                                                  }}
                                                  placeholder="Add category and press Enter"
                                                  className={styles.chipInput}
                                                  aria-label="Add category"
                                                />
                                              </div>
                                            </div>
                                            <input
                                              type="text"
                                              value={editTagsCsv}
                                              onChange={(e) => setEditTagsCsv(e.target.value)}
                                              placeholder="tags CSV"
                                              className={styles.searchInput}
                                              aria-label="Edit tags CSV"
                                              aria-describedby="editTagsCsvHelp"
                                            />
                                            <span id="editTagsCsvHelp" className={styles.visuallyHidden || ''}>Comma separated tags, press Save to apply</span>
                                            <input
                                              type="text"
                                              value={editCategoriesCsv}
                                              onChange={(e) => setEditCategoriesCsv(e.target.value)}
                                              placeholder="categories CSV"
                                              className={styles.searchInput}
                                              aria-label="Edit categories CSV"
                                              aria-describedby="editCategoriesCsvHelp"
                                            />
                                            <span id="editCategoriesCsvHelp" className={styles.visuallyHidden || ''}>Comma separated categories, press Save to apply</span>
                                            <div style={{display:'flex', gap:8}}>
                                              <button className={`${styles.iconButton} ${styles.iconButtonPrimary}`} disabled={savingMeta} onClick={() => saveEditMeta(article)}>{savingMeta ? 'Saving…' : 'Save'}</button>
                                              <button className={styles.iconButton} onClick={cancelEditMeta}>Cancel</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <Tooltip content="Preview">
                                              <Link href={`/admin/articles/preview/${encodeURIComponent(article.slug)}`} className={`${styles.actionIcon} ${styles.iconButton}`} title="Preview" aria-label="Preview">
                                                <Icon name="eye" title="Preview" />
                                              </Link>
                                            </Tooltip>
                                            <Tooltip content="Edit">
                                              <Link href={`/admin/articles/edit/${article._id}`} className={`${styles.actionIcon} ${styles.iconButton}`} title="Edit" aria-label="Edit">
                                                <Icon name="edit" title="Edit" />
                                              </Link>
                                            </Tooltip>
                                            <Tooltip content="Edit tags/categories">
                                              <button type="button" className={styles.iconButton} onClick={() => startEditMeta(article)} title="Edit tags/categories" aria-label="Edit tags/categories">
                                                <Icon name="tag" />
                                              </button>
                                            </Tooltip>
                                            <Tooltip content={article.pinned ? 'Unpin' : 'Pin'}>
                                                <button
                                                    type="button"
                                                    className={`${styles.iconButton} ${article.pinned ? styles.pinned : ''}`}
                                                    onClick={() => togglePin(article)}
                                                    title={article.pinned ? 'Unpin item' : 'Pin item'}
                                                    aria-label={article.pinned ? 'Unpin item' : 'Pin item'}
                                                    aria-pressed={article.pinned}
                                                >
                                                    <Icon name="pin" />
                                                </button>
                                            </Tooltip>
                                          </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                    </div>
                    {/* Pagination Controls */}
                    <div className={styles.pagination} aria-busy={loading}>
                        <Tooltip content="Previous page">
                        <button
                          className={styles.iconButton}
                          onClick={() => { const nextPage = pagination.page - 1; setAriaMsg(`Loading page ${nextPage} of ${pagination.totalPages}`); router.push(`/admin/articles?${new URLSearchParams({ ...router.query, page: nextPage })}`); }}
                          disabled={loading || pagination.page <= 1}
                          title="Previous"
                          aria-label="Previous page"
                        >
                          <Icon name="chevronLeft" title="Previous" />
                        </button>
                        </Tooltip>
                        <span>Page {pagination.page} of {pagination.totalPages}</span>
                        <Tooltip content="Next page">
                        <button
                          className={styles.iconButton}
                          onClick={() => { const nextPage = pagination.page + 1; setAriaMsg(`Loading page ${nextPage} of ${pagination.totalPages}`); router.push(`/admin/articles?${new URLSearchParams({ ...router.query, page: nextPage })}`); }}
                          disabled={loading || pagination.page >= pagination.totalPages}
                          title="Next"
                          aria-label="Next page"
                        >
                          <Icon name="chevronRight" title="Next" />
                        </button>
                        </Tooltip>
                    </div>
                </>
            )}
            {/* Confirm Dialog */}
            <Modal
              isOpen={confirmOpen}
              onClose={() => { setConfirmOpen(false); setAriaMsg('Action canceled'); }}
              title={confirmTitle}
              ariaDescribedBy="confirmDialogDesc"
            >
              <div id="confirmDialogDesc" style={{marginBottom:12}}>{confirmMessage}</div>
              <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                <button className={styles.iconButton} onClick={() => { setConfirmOpen(false); setAriaMsg('Action canceled'); }}>
                  Cancel
                </button>
                <button className={`${styles.iconButton} ${styles.iconButtonDanger || ''}`} onClick={handleConfirmAccept} aria-describedby="confirmDialogDesc">
                  Confirm
                </button>
              </div>
            </Modal>
            {/* Save/Rename Saved Search Name Modal */}
            <Modal
              isOpen={nameModalOpen}
              onClose={closeNameModal}
              title={nameModalMode === 'rename' ? 'Rename saved search' : 'Save current search'}
              ariaDescribedBy="nameModalDesc"
            >
              <form onSubmit={handleNameModalSubmit}>
                <div id="nameModalDesc" className={styles.visuallyHidden || ''}>
                  {nameModalMode === 'rename' ? 'Enter a new name for this saved search.' : 'Enter a name to save the current filters as a saved search.'}
                </div>
                <label htmlFor="savedSearchName" className={styles.srOnly || ''}>Saved search name</label>
                <input
                  id="savedSearchName"
                  type="text"
                  ref={nameInputRef}
                  value={nameModalValue}
                  onChange={(e) => { setNameModalValue(e.target.value); if (nameModalError) setNameModalError(''); }}
                  placeholder="e.g., Published with cover"
                  className={styles.searchInput}
                  aria-invalid={Boolean(nameModalError)}
                  aria-describedby="nameModalDesc nameModalError"
                />
                {nameModalError && (
                  <div id="nameModalError" role="alert" style={{ color: '#b91c1c', marginTop: 6 }}>
                    {nameModalError}
                  </div>
                )}
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:12 }}>
                  <button type="button" className={styles.iconButton} onClick={closeNameModal}>
                    Cancel
                  </button>
                  <button type="submit" className={`${styles.iconButton} ${styles.iconButtonPrimary || ''}`} disabled={nameModalMode === 'save' && savedSearches.length >= 8} aria-disabled={nameModalMode === 'save' && savedSearches.length >= 8}>
                    {nameModalMode === 'rename' ? 'Rename' : 'Save'}
                  </button>
                </div>
                {nameModalMode === 'save' && (
                  <div style={{ marginTop:8, fontSize:12, color:'#6b7280' }}>
                    {savedSearches.length >= 8 ? 'You have reached the maximum of 8 saved searches. Delete one to save a new search.' : 'You can save up to 8 searches.'}
                  </div>
                )}
              </form>
            </Modal>
            {/* Quick Create Floating Action Button */}
            {!confirmOpen && (
              <Tooltip content="Quick Create (n)">
                <Link
                  href="/admin/articles/new"
                  className={styles.fab}
                  aria-label="Quick create new article (shortcut: n)"
                  title="Quick Create (n)"
                  onClick={() => setAriaMsg('Opening new article form')}
                  aria-keyshortcuts="n"
                >
                  <span aria-hidden>+</span>
                </Link>
              </Tooltip>
            )}
        </AdminLayout>
    );
};

export default ArticlesPage;

