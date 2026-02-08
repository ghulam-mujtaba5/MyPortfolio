// pages/admin/projects/index.js
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import { useTheme } from "../../../context/ThemeContext";
import AdminPublicProjectCard from "../../../components/Admin/Projects/AdminPublicProjectCard";
import gridStyles from "../../../styles/AdminGrid.module.css"; // Shared grid styles

import Icon from "../../../components/Admin/Icon/Icon";
import Tooltip from "../../../components/Admin/Tooltip/Tooltip";
import { ProjectListSkeleton } from "../../../components/Admin/Skeletons/Skeletons";
import Modal from "../../../components/Admin/Modal/Modal";
import styles from "./projects.premium.module.css";
import utilities from "../../../styles/utilities.module.css";
import LoadingAnimation from "../../../components/LoadingAnimation/LoadingAnimation";
import InlineSpinner from "../../../components/LoadingAnimation/InlineSpinner";
import EnhancedFilterSection from "../../../components/Admin/Projects/EnhancedFilterSection";

const ProjectsPage = () => {
  const { theme } = useTheme();
  // Removed legacy theme styles

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [pinningId, setPinningId] = useState(null);
  const [featuringId, setFeaturingId] = useState(null);
  const [applyingBulk, setApplyingBulk] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, type: null, payload: null });
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    projects: true
  });
  const confirmBtnRef = useRef(null);
  const [q, setQ] = useState("");

  const router = useRouter();
  const {
    page = 1,
    limit = 10,
    sortBy = "displayOrder",
    sortOrder = "asc",
    search = "",
    published = "",
    featured = "",
  } = router.query;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
        setDeletingId(id);
        setProjects(projects.filter((p) => (p._id || p.id) !== id));
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to delete project");
        }
        toast.success("Project deleted successfully.");
      } else if (type === "bulk-action") {
        const action = payload.action;
        setApplyingBulk(true);
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
      setDeletingId(null);
      setApplyingBulk(false);
      setConfirmState({ open: false, type: null, payload: null });
    }
  };

  const handleFeatureToggle = async (id, featured) => {
    setFeaturingId(id);
    try {
      const res = await fetch('/api/admin/feature-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'project', featured }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update feature status.');
      }
      toast.success(featured ? 'Project featured on home.' : 'Project removed from home.');
      setProjects(prevProjects =>
        prevProjects.map(p =>
          (p._id || p.id) === id ? { ...p, featuredOnHome: featured } : p
        )
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFeaturingId(null);
    }
  };

  const togglePin = async (project) => {
    try {
      const id = project._id || project.id;
      setPinningId(id);
      const res = await fetch("/api/admin/pin-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "project" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle pin");
      toast.success(data.data.pinned ? "Project pinned" : "Project unpinned");
      fetchData();
    } catch (e) {
      toast.error(e.message || "Failed to update pin status");
    } finally {
      setPinningId(null);
    }
  };

  // --- Auto-scroll during drag ---
  const scrollFrameRef = useRef(null);
  const scrollThreshold = 80; // px from edge to trigger scroll
  const scrollSpeed = 12; // px per frame

  const autoScroll = useCallback((clientY) => {
    // Cancel any pending frame
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
    const viewportH = window.innerHeight;
    let direction = 0;
    if (clientY < scrollThreshold) {
      direction = -1; // scroll up
    } else if (clientY > viewportH - scrollThreshold) {
      direction = 1; // scroll down
    }
    if (direction !== 0) {
      const step = () => {
        window.scrollBy(0, direction * scrollSpeed);
        scrollFrameRef.current = requestAnimationFrame(step);
      };
      scrollFrameRef.current = requestAnimationFrame(step);
    }
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
  }, []);

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => stopAutoScroll();
  }, [stopAutoScroll]);

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Store index for Firefox compatibility
    e.dataTransfer.setData("text/plain", index.toString());
    // Slightly delay to let the browser create the drag image
    requestAnimationFrame(() => {
      // Add a class to body to indicate dragging
      document.body.style.cursor = 'grabbing';
    });
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
    // Auto-scroll when dragging near edges
    autoScroll(e.clientY);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    stopAutoScroll();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...projects];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);
    setProjects(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    stopAutoScroll();
    document.body.style.cursor = '';
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const orderedIds = projects.map((p) => p._id || p.id);
      const res = await fetch("/api/admin/reorder-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save order");
      toast.success("Project order saved! This order will be reflected on the public page.");
      setReorderMode(false);
      // Re-fetch to confirm the saved order from the server
      await fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <AdminLayout title="Manage Projects">
      <div className={styles.pageWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="briefcase" size={28} style={{ color: "var(--admin-primary)" }} />
          Projects
          {loading && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <InlineSpinner sizePx={16} />
              <span className={styles.muted}>Loading…</span>
            </span>
          )}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/admin/projects/new" className={`${utilities.btn} ${utilities.btnPrimary}`}>
              <Icon name="plus" size={16} />
              New Project
            </Link>
            <button
              className={`${utilities.btn} ${reorderMode ? utilities.btnDanger : utilities.btnSecondary}`}
              onClick={() => {
                if (reorderMode) {
                  // Cancel reorder mode
                  setReorderMode(false);
                  fetchData(); // Reset to original order
                } else {
                  setReorderMode(true);
                }
              }}
            >
              <Icon name={reorderMode ? "x" : "move"} size={16} />
              {reorderMode ? "Cancel" : "Reorder"}
            </button>
            {reorderMode && (
              <button
                className={`${utilities.btn} ${utilities.btnPrimary}`}
                onClick={saveOrder}
                disabled={savingOrder}
              >
                {savingOrder ? (
                  <><InlineSpinner sizePx={14} /> Saving…</>
                ) : (
                  <><Icon name="check" size={16} /> Save Order</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Reorder Mode Banner */}
        {reorderMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.12))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              color: 'var(--text, #e0e0e0)',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icon name="move" size={18} />
            <strong>Reorder Mode:</strong> Drag and drop project cards to rearrange their order on the public page. Click &quot;Save Order&quot; when done.
          </motion.div>
        )}

        {/* Filters Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Icon name="filter" size={20} />
            Filters & Search
          </h2>
          <button 
            className={styles.toggleButton}
            onClick={() => toggleSection('filters')}
          >
            <Icon name={expandedSections.filters ? "chevron-up" : "chevron-down"} size={20} />
          </button>
        </div>
        
        {expandedSections.filters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedFilterSection
              search={q}
              setSearch={setQ}
              published={published}
              featured={featured}
              router={router}
              selectedProjects={selectedProjects}
              handleBulkAction={handleBulkAction}
            />
          </motion.div>
        )}

        {/* Projects Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Icon name="briefcase" size={20} />
            Projects
          </h2>
          <button 
            className={styles.toggleButton}
            onClick={() => toggleSection('projects')}
          >
            <Icon name={expandedSections.projects ? "chevron-up" : "chevron-down"} size={20} />
          </button>
        </div>
        
        {expandedSections.projects && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <ProjectListSkeleton />
            ) : (
              <>
                <motion.div
                  className={gridStyles.gridContainer}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.06, delayChildren: 0.02 },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {projects.map((project, index) => (
                    <motion.div
                      key={project._id || project.id}
                      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                      draggable={reorderMode}
                      onDragStart={reorderMode ? (e) => handleDragStart(e, index) : undefined}
                      onDragOver={reorderMode ? (e) => handleDragOver(e, index) : undefined}
                      onDragLeave={reorderMode ? handleDragLeave : undefined}
                      onDrop={reorderMode ? (e) => handleDrop(e, index) : undefined}
                      onDragEnd={reorderMode ? handleDragEnd : undefined}
                      style={{
                        cursor: reorderMode ? 'grab' : 'default',
                        opacity: draggedIndex === index ? 0.4 : 1,
                        transition: 'all 0.2s ease',
                        border: dragOverIndex === index ? '2px dashed var(--primary, #3b82f6)' : '2px dashed transparent',
                        borderRadius: 'var(--admin-card-radius, 12px)',
                        padding: reorderMode ? '4px' : '0',
                        position: 'relative',
                      }}
                    >
                      {reorderMode && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          marginBottom: '4px',
                          background: 'var(--bg-elev-2, #23272f)',
                          borderRadius: '8px 8px 0 0',
                          color: 'var(--text-muted, #888)',
                          fontSize: '13px',
                          fontWeight: '500',
                          userSelect: 'none',
                          cursor: 'grab',
                        }}>
                          <Icon name="move" size={14} />
                          <span>#{index + 1} — Drag to reorder</span>
                        </div>
                      )}
                      <AdminPublicProjectCard
                        project={project}
                        onEdit={() => handleEdit(project._id || project.id)}
                        onDelete={() => handleDelete(project._id || project.id)}
                        onPin={() => togglePin(project)}
                        onFeatureToggle={handleFeatureToggle}
                        isSelected={selectedProjects.includes(project._id || project.id)}
                        deleting={deletingId === (project._id || project.id)}
                        pinning={pinningId === (project._id || project.id)}
                        featuring={featuringId === (project._id || project.id)}
                        onSelect={() => {
                          setSelectedProjects((prev) =>
                            prev.includes(project._id || project.id)
                              ? prev.filter((id) => id !== (project._id || project.id))
                              : [...prev, (project._id || project.id)],
                          );
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
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
          </motion.div>
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
        {applyingBulk && (
          <LoadingAnimation visible={true} showStars={false} size="sm" backdropOpacity={0.3} />
        )}
      </div>
    </AdminLayout>
  );
};

export default ProjectsPage;