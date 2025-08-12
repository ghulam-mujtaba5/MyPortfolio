// pages/admin/projects/index.js
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import styles from '../articles/articles.module.css'; // Reusing styles
import AdminProjectCard from '../../../components/Admin/Projects/AdminProjectCard';
import gridStyles from '../../../styles/AdminGrid.module.css'; // Shared grid styles

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedProjects, setSelectedProjects] = useState([]);
    
    const router = useRouter();
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '', status = '' } = router.query;

    const fetchData = useCallback(async () => {
        setLoading(true);
        const query = new URLSearchParams({ page, limit, sortBy, sortOrder, search, status }).toString();
        try {
            const response = await fetch(`/api/admin/projects?${query}`);
            const data = await response.json();
            if (data.success) {
                setProjects(data.data);
                setPagination(data.pagination);
            } else {
                toast.error('Failed to fetch projects.');
            }
        } catch (error) {
            toast.error('An error occurred while fetching projects.');
        }
        setLoading(false);
    }, [page, limit, sortBy, sortOrder, search, status]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

        const handleEdit = (id) => {
        router.push(`/admin/projects/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                toast.success('Project deleted successfully.');
                fetchData(); // Refresh data
            } else {
                throw new Error(data.message || 'Failed to delete project');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedProjects.length === 0) return toast.error('No projects selected.');
        if (!window.confirm(`Are you sure you want to ${action} ${selectedProjects.length} projects?`)) return;

        try {
            const res = await fetch('/api/projects/bulk-action', { // Assumes this endpoint exists
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectIds: selectedProjects, action }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setSelectedProjects([]);
                fetchData();
            } else {
                throw new Error(data.message || 'Failed to perform bulk action');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <AdminLayout title="Manage Projects">
            <div className={styles.header}>
                <h1>Projects</h1>
                <Link href="/admin/projects/new" className={styles.newButton}>New Project</Link>
            </div>

            {/* Filters and Bulk Actions */}
            <div className={styles.filters}>
                <input 
                    type="text" 
                    placeholder="Search by title..."
                    defaultValue={search}
                    onChange={(e) => router.push(`/admin/projects?${new URLSearchParams({ ...router.query, search: e.target.value, page: 1 })}`)}
                />
                <select 
                    value={status}
                    onChange={(e) => router.push(`/admin/projects?${new URLSearchParams({ ...router.query, status: e.target.value, page: 1 })}`)}
                >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
                {selectedProjects.length > 0 && (
                    <div className={styles.bulkActions}>
                        <button onClick={() => handleBulkAction('publish')}>Publish Selected</button>
                        <button onClick={() => handleBulkAction('draft')}>Set to Draft</button>
                        <button onClick={() => handleBulkAction('delete')} className={styles.bulkDeleteButton}>Delete Selected</button>
                    </div>
                )}
            </div>

            {loading ? <p>Loading...</p> : (
                <>
                    <div className={gridStyles.gridContainer}>
                        {projects.map(project => (
                            <AdminProjectCard 
                                key={project._id} 
                                project={project}
                                onEdit={() => handleEdit(project._id)}
                                onDelete={() => handleDelete(project._id)}
                                isSelected={selectedProjects.includes(project._id)}
                                onSelect={() => {
                                    setSelectedProjects(prev => 
                                        prev.includes(project._id) 
                                            ? prev.filter(id => id !== project._id) 
                                            : [...prev, project._id]
                                    );
                                }}
                            />
                        ))}
                    </div>
                    {/* Pagination Controls */}
                    <div className={styles.pagination}>
                        <button onClick={() => router.push(`/admin/projects?${new URLSearchParams({ ...router.query, page: pagination.page - 1 })}`)} disabled={pagination.page <= 1}>Previous</button>
                        <span>Page {pagination.page} of {pagination.totalPages}</span>
                        <button onClick={() => router.push(`/admin/projects?${new URLSearchParams({ ...router.query, page: pagination.page + 1 })}`)} disabled={pagination.page >= pagination.totalPages}>Next</button>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default ProjectsPage;

