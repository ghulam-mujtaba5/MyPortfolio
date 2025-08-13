// pages/admin/projects/index.js
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import { useTheme } from "next-themes";
import commonStyles from "../articles/articles.common.module.css";
import lightStyles from "../articles/articles.light.module.css";
import darkStyles from "../articles/articles.dark.module.css";
import AdminProjectCard from "../../../components/Admin/Projects/AdminProjectCard";
import gridStyles from "../../../styles/AdminGrid.module.css"; // Shared grid styles
import Icon from "../../../components/Admin/Icon/Icon";
import Tooltip from "../../../components/Admin/Tooltip/Tooltip";
import { ProjectListSkeleton } from "../../../components/Admin/Skeletons/Skeletons";

const ProjectsPage = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === "dark" ? darkStyles : lightStyles),
  };
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState([]);

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

  const handleEdit = (id) => {
    router.push(`/admin/projects/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    const originalProjects = [...projects];
    const newProjects = projects.filter((p) => p._id !== id);
    setProjects(newProjects);

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete project");
      }
      toast.success("Project deleted successfully.");
      // No need to fetchData, UI is already updated
    } catch (error) {
      toast.error(error.message);
      setProjects(originalProjects); // Revert on error
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProjects.length === 0)
      return toast.error("No projects selected.");
    if (
      !window.confirm(
        `Are you sure you want to ${action} ${selectedProjects.length} projects?`,
      )
    )
      return;

    try {
      const res = await fetch("/api/projects/bulk-action", {
        // Assumes this endpoint exists
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: selectedProjects, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setSelectedProjects([]);
        fetchData();
      } else {
        throw new Error(data.message || "Failed to perform bulk action");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const togglePin = async (project) => {
    try {
      const res = await fetch("/api/admin/pin-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project._id, type: "project" }),
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
        <h1>Projects</h1>
        <Link href="/admin/projects/new" className={styles.newButton}>
          New Project
        </Link>
      </div>

      {/* Filters and Bulk Actions */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by title..."
          defaultValue={search}
          onChange={(e) =>
            router.push(
              `/admin/projects?${new URLSearchParams({ ...router.query, search: e.target.value, page: 1 })}`,
            )
          }
        />
        <div className={styles.quickFilters}>
          <button
            className={`${styles.filterChip} ${!published && !featured ? styles.activeChip : ""}`}
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
            <button onClick={() => handleBulkAction("publish")}>
              Publish Selected
            </button>
            <button onClick={() => handleBulkAction("draft")}>
              Set to Draft
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className={styles.bulkDeleteButton}
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
                key={project._id}
                project={project}
                onEdit={() => handleEdit(project._id)}
                onDelete={() => handleDelete(project._id)}
                onPin={() => togglePin(project)}
                isSelected={selectedProjects.includes(project._id)}
                onSelect={() => {
                  setSelectedProjects((prev) =>
                    prev.includes(project._id)
                      ? prev.filter((id) => id !== project._id)
                      : [...prev, project._id],
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
            >
              Next
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default ProjectsPage;
