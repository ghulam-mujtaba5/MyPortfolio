import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import withAdminAuth from '../../lib/withAdminAuth';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const Filters = ({ filters, setFilters, onApply }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300">Search</label>
        <input
          className="px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          placeholder="user, details, entityId"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300">Action</label>
        <select
          className="px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          value={filters.action}
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
        >
          <option value="">All</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="bulk_delete">Bulk Delete</option>
          <option value="login_success">Login Success</option>
          <option value="login_fail">Login Fail</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300">Entity</label>
        <select
          className="px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          value={filters.entity}
          onChange={(e) => setFilters((f) => ({ ...f, entity: e.target.value }))}
        >
          <option value="">All</option>
          <option value="Article">Article</option>
          <option value="Project">Project</option>
          <option value="User">User</option>
          <option value="Auth">Auth</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300">From</label>
        <input
          type="date"
          className="px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300">To</label>
        <input
          type="date"
          className="px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
        />
      </div>
      <button
        onClick={onApply}
        className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Apply
      </button>
    </div>
  );
};

const Table = ({ items }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entity</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entity ID</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((log) => (
            <tr key={log._id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(log.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{log.userName}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{log.action.replace('_', ' ')}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{log.entity}</td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{log.entityId || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{log.details || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        className="px-3 py-2 rounded border dark:border-gray-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page <= 1}
      >
        Previous
      </button>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Page {page} of {totalPages}
      </div>
      <button
        className="px-3 py-2 rounded border dark:border-gray-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

const AuditLogsPage = () => {
  const [filters, setFilters] = useState({ q: '', action: '', entity: '', from: '', to: '' });
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    if (filters.q) params.set('q', filters.q);
    if (filters.action) params.set('action', filters.action);
    if (filters.entity) params.set('entity', filters.entity);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    return params.toString();
  }, [filters, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit-logs?${queryString}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Audit Logs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track admin actions across Articles, Projects, and Users.</p>

        <div className="mt-6">
          <Filters filters={filters} setFilters={setFilters} onApply={() => { setPage(1); fetchLogs(); }} />
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <Table items={items} />
              <Pagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AuditLogsPage, { requiredRole: 'admin' });
