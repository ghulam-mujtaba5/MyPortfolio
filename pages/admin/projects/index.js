// pages/admin/projects/index.js
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import { useTheme } from "../../../context/ThemeContext";
import commonStyles from "../articles/articles.common.module.css";
import lightStyles from "../articles/articles.light.module.css";
import darkStyles from "../articles/articles.dark.module.css";
import AdminProjectCard from "../../../components/Admin/Projects/AdminProjectCard";
import gridStyles from "../../../styles/AdminGrid.module.css"; // Shared grid styles
import Icon from "../../../components/Admin/Icon/Icon";
import Tooltip from "../../../components/Admin/Tooltip/Tooltip";
import { ProjectListSkeleton } from "../../../components/Admin/Skeletons/Skeletons";
import Modal from "../../../components/Admin/Modal/Modal";
import projCommon from "./projects.common.module.css";
import projLight from "./projects.light.module.css";
import projDark from "./projects.dark.module.css";
import utilities from "../../../styles/utilities.module.css";
import Spinner from "../../../components/Spinner/Spinner";

const ProjectsPage = () => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const projTheme = theme === "dark" ? projDark : projLight;
  const styles = { ...commonStyles, ...themeStyles };
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [confirmState, setConfirmState] = useState({ open: false, type: null, payload: null });
  const confirmBtnRef = useRef(null);
  const [q, setQ] = useState("");

  const router = useRouter();
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search = "",
    published = "",
    featured = "",
  } = router.query;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      published,
      featured,
    }).toString();
    try {
      const response = await fetch(`/api/admin/projects?${query}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to fetch projects.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching projects.");
    }
    setLoading(false);
  }, [page, limit, sortBy, sortOrder, search, published, featured]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Keep local state in sync if query changes externally (e.g., back/forward)
  useEffect(() => {
    setQ(String(search || ""));
  }, [search]);

  // Debounce search query updates to the URL to avoid excessive reloads
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams({
        ...router.query,
        search: q,
        page: 1,
      }).toString();
      router.push(`/admin/projects?${next}`, undefined, { shallow: true });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleEdit = (id) => {
    router.push(`/admin/projects/edit/${id}`);
  };

  const handleDelete = async (id) => {
    setConfirmState({ open: true, type: "single-delete", payload: { id } });
  };

  const handleBulkAction = async (action) => {
    if (selectedProjects.length === 0)
      return toast.error("No projects selected.");
    setConfirmState({ open: true, type: "bulk-action", payload: { action } });
  };

  const onConfirm = async () => {
    const { type, payload } = confirmState;
    try {
      if (type === "single-delete") {
        const id = payload.id;
        const original = [...projects];
        setProjects(projects.filter((p) => (p._id || p.id) !== id));
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to delete project");
        }
        toast.success("Project deleted successfully.");
      } else if (type === "bulk-action") {
        const action = payload.action;
        const res = await fetch("/api/projects/bulk-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectIds: selectedProjects, action }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to perform bulk action");
        toast.success(data.message);
        setSelectedProjects([]);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || "Action failed");
      // Best effort refresh
      fetchData();
    } finally {
      setConfirmState({ open: false, type: null, payload: null });
    }
  };

  const togglePin = async (project) => {
    try {
      const res = await fetch("/api/admin/pin-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project._id || project.id, type: "project" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle pin");
      toast.success(data.data.pinned ? "Project pinned" : "Project unpinned");
      fetchData();
    } catch (e) {
      toast.error(e.message || "Failed to update pin status");
    }
  };

  return (
    <AdminLayout title="Manage Projects">
      <div className={styles.header}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Projects
          {loading && (
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <Spinner size="sm" label="Loading projects" />
            </span>
          )}
        </h1>
        <Link href="/admin/projects/new" className={`${utilities.btn} ${utilities.btnPrimary}`}>
          New Project
        </Link>
      </div>

      {/* Filters and Bulk Actions */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by title..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={styles.searchInput}
          role="searchbox"
          aria-label="Search projects by title"
        />
        {q ? (
          <button
            type="button"
            className={`${utilities.btn} ${utilities.btnIcon}`}
            onClick={() => setQ("")}
            aria-label="Clear search"
            title="Clear"
          >
            Clear
          </button>
        ) : null}
        <div className={styles.quickFilters}>
          <button
            className={`${styles.filterChip} ${!published && !featured ? styles.activeChip : ""}`}
            aria-pressed={!published && !featured}
            onClick={() =>
              router.push(
                `/admin/projects?${new URLSearchParams({ ...router.query, published: "", featured: "", page: 1 })}`,
              )
            }
          >
            All
          </button>
          <button
            className={`${styles.filterChip} ${published === "true" ? styles.activeChip : ""}`}
            aria-pressed={published === "true"}
            onClick={() =>
              router.push(
                `/admin/projects?${new URLSearchParams({ ...router.query, published: "true", featured: "", page: 1 })}`,
              )
            }
          >
            Published
          </button>
          <button
            className={`${styles.filterChip} ${published === "false" ? styles.activeChip : ""}`}
            aria-pressed={published === "false"}
            onClick={() =>
              router.push(
                `/admin/projects?${new URLSearchParams({ ...router.query, published: "false", featured: "", page: 1 })}`,
              )
            }
          >
            Draft
          </button>
          <button
            className={`${styles.filterChip} ${featured === "true" ? styles.activeChip : ""}`}
            aria-pressed={featured === "true"}
            onClick={() =>
              router.push(
                `/admin/projects?${new URLSearchParams({ ...router.query, featured: "true", published: "", page: 1 })}`,
              )
            }
          >
            Featured
          </button>
        </div>
        {selectedProjects.length > 0 && (
          <div className={styles.bulkActions}>
            <button className={`${utilities.btn} ${utilities.btnPrimary}`} onClick={() => handleBulkAction("publish")}>
              Publish Selected
            </button>
            <button className={`${utilities.btn} ${utilities.btnSecondary}`} onClick={() => handleBulkAction("draft")}>
              Set to Draft
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className={`${utilities.btn} ${utilities.btnDanger}`}
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <ProjectListSkeleton />
      ) : (
        <>
          <div className={gridStyles.gridContainer}>
            {projects.map((project) => (
              <AdminProjectCard
                key={project._id || project.id}
                project={project}
                onEdit={() => handleEdit(project._id || project.id)}
                onDelete={() => handleDelete(project._id || project.id)}
                onPin={() => togglePin(project)}
                isSelected={selectedProjects.includes(project._id || project.id)}
                onSelect={() => {
                  setSelectedProjects((prev) =>
                    prev.includes(project._id || project.id)
                      ? prev.filter((id) => id !== (project._id || project.id))
                      : [...prev, (project._id || project.id)],
                  );
                }}
              />
            ))}
          </div>
          {/* Pagination Controls */}
          <div className={styles.pagination}>
            <button
              onClick={() =>
                router.push(
                  `/admin/projects?${new URLSearchParams({ ...router.query, page: pagination.page - 1 })}`,
                )
              }
              disabled={pagination.page <= 1}
              className={`${utilities.btn} ${utilities.btnSecondary}`}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                router.push(
                  `/admin/projects?${new URLSearchParams({ ...router.query, page: pagination.page + 1 })}`,
                )
              }
              disabled={pagination.page >= pagination.totalPages}
              className={`${utilities.btn} ${utilities.btnSecondary}`}
            >
              Next
            </button>
          </div>
        </>
      )}
      <Modal
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ open: false, type: null, payload: null })}
        title={confirmState.type === "bulk-action" ? "Confirm Bulk Action" : "Delete Project"}
        onConfirm={onConfirm}
        initialFocusRef={confirmBtnRef}
        confirmText={confirmState.type === "bulk-action" ? "Confirm" : "Delete"}
        cancelText="Cancel"
      >
        {confirmState.type === "bulk-action" ? (
          <p>
            Are you sure you want to {confirmState.payload?.action} {selectedProjects.length} project(s)?
          </p>
        ) : (
          <p>
            This action will permanently delete this project and cannot be undone.
          </p>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default ProjectsPage;
