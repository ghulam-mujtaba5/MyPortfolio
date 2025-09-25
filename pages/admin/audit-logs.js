import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import withAdminAuth from "../../lib/withAdminAuth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Table from "../../components/Admin/Table/Table";
import commonStyles from "./audit-logs.module.css";
import lightStyles from "./audit-logs.light.module.css";
import darkStyles from "./audit-logs.dark.module.css";
import utilities from "../../styles/utilities.module.css";
import { useTheme } from "../../context/ThemeContext";
import { formatDistanceToNow } from "date-fns";
import InlineSpinner from "../../components/LoadingAnimation/InlineSpinner";
import Icon from "../../components/Admin/Icon/Icon";

const PAGE_SIZE = 20;

const Filters = ({ filters, setFilters, onApply, themeStyles, common }) => {
  return (
    <div className={`${common.filterBar} ${themeStyles.filterBar || ""}`}>
      <div className={`${common.filtersGrid} ${themeStyles.filtersGrid || ""}`}>
        <div
          className={`${common.fieldGroup} ${common.span4} ${themeStyles.fieldGroup || ""}`}
        >
          <label className={`${common.label} ${themeStyles.label || ""}`}>
            <Icon name="search" size={16} />
            Search
          </label>
          <input
            className={`${common.formControl} ${themeStyles.formControl}`}
            placeholder="user, details, entityId"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
        </div>
        <div
          className={`${common.fieldGroup} ${common.span2} ${themeStyles.fieldGroup || ""}`}
        >
          <label className={`${common.label} ${themeStyles.label || ""}`}>
            <Icon name="activity" size={16} />
            Action
          </label>
          <select
            className={`${common.formControl} ${common.select} ${themeStyles.formControl} ${themeStyles.select}`}
            value={filters.action}
            onChange={(e) =>
              setFilters((f) => ({ ...f, action: e.target.value }))
            }
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
        <div
          className={`${common.fieldGroup} ${common.span2} ${themeStyles.fieldGroup || ""}`}
        >
          <label className={`${common.label} ${themeStyles.label || ""}`}>
            <Icon name="database" size={16} />
            Entity
          </label>
          <select
            className={`${common.formControl} ${common.select} ${themeStyles.formControl} ${themeStyles.select}`}
            value={filters.entity}
            onChange={(e) =>
              setFilters((f) => ({ ...f, entity: e.target.value }))
            }
          >
            <option value="">All</option>
            <option value="Article">Article</option>
            <option value="Project">Project</option>
            <option value="User">User</option>
            <option value="Auth">Auth</option>
          </select>
        </div>
        <div
          className={`${common.fieldGroup} ${common.span2} ${themeStyles.fieldGroup || ""}`}
        >
          <label className={`${common.label} ${themeStyles.label || ""}`}>
            <Icon name="calendar" size={16} />
            From
          </label>
          <input
            type="date"
            className={`${common.formControl} ${themeStyles.formControl}`}
            value={filters.from}
            onChange={(e) =>
              setFilters((f) => ({ ...f, from: e.target.value }))
            }
          />
        </div>
        <div
          className={`${common.fieldGroup} ${common.span2} ${themeStyles.fieldGroup || ""}`}
        >
          <label className={`${common.label} ${themeStyles.label || ""}`}>
            <Icon name="calendar" size={16} />
            To
          </label>
          <input
            type="date"
            className={`${common.formControl} ${themeStyles.formControl}`}
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          />
        </div>
        <div
          className={`${common.actionsRight} ${themeStyles.actionsRight || ""}`}
        >
          <button
            onClick={onApply}
            className={`${utilities.btn} ${utilities.btnPrimary}`}
          >
            <Icon name="filter" size={16} />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Columns are defined inside the component to access themeStyles

const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  return (
    <div className={commonStyles.pagination}>
      <button
        className={`${utilities.btn} ${utilities.btnSecondary}`}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page <= 1}
      >
        Previous
      </button>
      <div className={`${commonStyles.pagerMeta} ${themeStyles.pagerMeta}`}>
        Page {page} of {totalPages}
      </div>
      <button
        className={`${utilities.btn} ${utilities.btnSecondary}`}
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

const AuditLogsPage = () => {
  const [filters, setFilters] = useState({
    q: "",
    action: "",
    entity: "",
    from: "",
    to: "",
  });
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    if (filters.q) params.set("q", filters.q);
    if (filters.action) params.set("action", filters.action);
    if (filters.entity) params.set("entity", filters.entity);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    return params.toString();
  }, [filters, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit-logs?${queryString}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch audit logs");
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

  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const columns = [
    {
      header: "Time",
      key: "createdAt",
      render: (row) =>
        formatDistanceToNow(new Date(row.createdAt), { addSuffix: true }),
    },
    { header: "User", key: "userName" },
    {
      header: "Action",
      key: "action",
      render: (row) => {
        const a = row.action || "";
        const label = a.replace("_", " ");
        const tone =
          a.startsWith("delete") || a.includes("fail")
            ? "danger"
            : a.includes("create")
              ? "success"
              : "warning";
        return (
          <span
            className={`${commonStyles.badge} ${themeStyles.badge || ""} ${themeStyles["badge_" + tone]}`}
          >
            {label}
          </span>
        );
      },
    },
    { header: "Entity", key: "entity" },
    {
      header: "Entity ID",
      key: "entityId",
      render: (row) => (
        <code className={`${commonStyles.code} ${themeStyles.code || ""}`}>
          {row.entityId || "-"}
        </code>
      ),
    },
    { header: "Details", key: "details" },
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${commonStyles.pageWrap} ${themeStyles.pageWrap || ""}`}
      >
        <motion.header
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${commonStyles.pageHeader} ${themeStyles.pageHeader || ""}`}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`${commonStyles.pageTitle} ${themeStyles.pageTitle}`}
          >
            Audit Logs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className={`${commonStyles.pageSubtitle} ${themeStyles.pageSubtitle}`}
          >
            Track admin actions across Articles, Projects, and Users.
          </motion.p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Filters
            filters={filters}
            setFilters={setFilters}
            onApply={() => {
              setPage(1);
              fetchLogs();
            }}
            themeStyles={themeStyles}
            common={commonStyles}
          />
        </motion.div>

        <motion.div
          className={`${commonStyles.card} ${themeStyles.card}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.5 }}
        >
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${commonStyles.loading} ${themeStyles.loading || ""}`} 
              style={{ padding: 16, display: "flex", alignItems: "center", gap: 8 }}
            >
              <InlineSpinner sizePx={18} />
              <span>Loading logs…</span>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Table columns={columns} data={items} />
              </motion.div>
              <motion.div
                className={`${commonStyles.paginationWrap} ${themeStyles.paginationWrap || ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Pagination
                  page={page}
                  total={total}
                  limit={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default withAdminAuth(AuditLogsPage, { requiredRole: "admin" });