// pages/admin/articles/index.js
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import styles from './articles.module.css';

const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedArticles, setSelectedArticles] = useState([]);
    
    const router = useRouter();
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '', status = '' } = router.query;

    const fetchData = useCallback(async () => {
        setLoading(true);
        const query = new URLSearchParams({ page, limit, sortBy, sortOrder, search, status }).toString();
        try {
            const response = await fetch(`/api/admin/articles?${query}`);
            const data = await response.json();
            if (data.success) {
                setArticles(data.data);
                setPagination(data.pagination);
            } else {
                toast.error('Failed to fetch articles.');
            }
        } catch (error) {
            toast.error('An error occurred while fetching articles.');
        }
        setLoading(false);
    }, [page, limit, sortBy, sortOrder, search, status]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSort = (newSortBy) => {
        const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
        router.push(`/admin/articles?${new URLSearchParams({ ...router.query, sortBy: newSortBy, sortOrder: newSortOrder, page: 1 })}`);
    };

    const handleBulkAction = async (action) => {
        if (selectedArticles.length === 0) return toast.error('No articles selected.');
        if (!window.confirm(`Are you sure you want to ${action} ${selectedArticles.length} articles?`)) return;

        try {
            const res = await fetch('/api/articles/bulk-action', { // Assumes this endpoint exists
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleIds: selectedArticles, action }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setSelectedArticles([]);
                fetchData();
            } else {
                throw new Error(data.message || 'Failed to perform bulk action');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <AdminLayout title="Manage Articles">
            <div className={styles.header}>
                <h1>Articles</h1>
                <Link href="/admin/articles/new" className={styles.newButton}>New Article</Link>
            </div>

            {/* Filters and Bulk Actions */}
            <div className={styles.filters}>
                <input 
                    type="text" 
                    placeholder="Search by title..."
                    defaultValue={search}
                    onChange={(e) => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, search: e.target.value, page: 1 })}`)}
                />
                <select 
                    value={status}
                    onChange={(e) => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, status: e.target.value, page: 1 })}`)}
                >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
                {selectedArticles.length > 0 && (
                    <div className={styles.bulkActions}>
                        <button onClick={() => handleBulkAction('publish')}>Publish Selected</button>
                        <button onClick={() => handleBulkAction('draft')}>Set to Draft</button>
                        <button onClick={() => handleBulkAction('delete')} className={styles.bulkDeleteButton}>Delete Selected</button>
                    </div>
                )}
            </div>

            {loading ? <p>Loading...</p> : (
                <>
                    <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th><input type="checkbox" onChange={(e) => setSelectedArticles(e.target.checked ? articles.map(a => a._id) : [])} /></th>
                                <th onClick={() => handleSort('title')}>Title</th>
                                <th onClick={() => handleSort('createdAt')}>Created At</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article._id}>
                                    <td><input type="checkbox" checked={selectedArticles.includes(article._id)} onChange={() => {
                                        setSelectedArticles(prev => prev.includes(article._id) ? prev.filter(id => id !== article._id) : [...prev, article._id])
                                    }} /></td>
                                    <td>{article.title}</td>
                                    <td>{new Date(article.createdAt).toLocaleDateString()}</td>
                                    <td>{article.published ? 'Published' : 'Draft'}</td>
                                    <td>
                                        <Link href={`/admin/articles/edit/${article._id}`} className={styles.editButton}>Edit</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className={styles.pagination}>
                        <button onClick={() => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, page: pagination.page - 1 })}`)} disabled={pagination.page <= 1}>Previous</button>
                        <span>Page {pagination.page} of {pagination.totalPages}</span>
                        <button onClick={() => router.push(`/admin/articles?${new URLSearchParams({ ...router.query, page: pagination.page + 1 })}`)} disabled={pagination.page >= pagination.totalPages}>Next</button>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default ArticlesPage;

