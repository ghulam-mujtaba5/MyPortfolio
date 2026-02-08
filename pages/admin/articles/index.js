import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import Icon from "../../../components/Admin/Icon/Icon";
import Tooltip from "../../../components/Admin/Tooltip/Tooltip";
import Modal from "../../../components/Admin/Modal/Modal";
import { ArticleListSkeleton } from "../../../components/Admin/Skeletons/Skeletons";
import Chip from "../../../components/Admin/Chip/Chip";
import StatusPill from "../../../components/Admin/StatusPill/StatusPill";
import SearchInput from "../../../components/Admin/Form/SearchInput";
import Select from "../../../components/Admin/Form/Select";
import EmptyState from "../../../components/Admin/EmptyState/EmptyState";
import InlineSpinner from "../../../components/LoadingAnimation/InlineSpinner";
import LoadingAnimation from "../../../components/LoadingAnimation/LoadingAnimation";
import AdminPublicArticleCard from "../../../components/Admin/ArticleCard/AdminPublicArticleCard";
import SavedSearches from "../../../components/Admin/SavedSearches/SavedSearches";
import EnhancedFilterSection from "../../../components/Admin/Articles/EnhancedFilterSection";

import commonStyles from "./articles.common.module.css";
import styles from "./articles.premium.module.css";
import utilities from "../../../styles/utilities.module.css";

const ArticlesPage = () => {
  // Removed theme-based style selection in favor of premium styles


  const handleFeatureToggle = async (id, featured) => {
    setFeaturingId(id);
    try {
      const res = await fetch('/api/admin/feature-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'article', featured }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update feature status.');
      }
      toast.success(featured ? 'Article featured on home.' : 'Article removed from home.');
      setArticles(prevArticles =>
        prevArticles.map(a =>
          (a._id || a.id) === id ? { ...a, featuredOnHome: featured } : a
        )
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFeaturingId(null);
    }
  };

  const togglePin = async (article) => {
    try {
      const id = article._id || article.id;
      setPinningId(id);
      const res = await fetch('/api/admin/pin-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'article' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to toggle pin');
      toast.success(data.data?.pinned ? 'Article pinned' : 'Article unpinned');
      fetchArticles();
    } catch (e) {
      toast.error(e.message || 'Failed to update pin status');
    } finally {
      setPinningId(null);
    }
  };

  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [ariaMsg, setAriaMsg] = useState("Page loaded.");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("Confirm action");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    quickFilters: true,
    articles: true
  });
  const onConfirmRef = useRef(null);
  const selectAllRef = useRef(null);
  const router = useRouter();
  const [applyingBulk, setApplyingBulk] = useState(false);
  const [pinningId, setPinningId] = useState(null);
  const [featuringId, setFeaturingId] = useState(null);

  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    hasCover = "",
    tag = "",
    category = "",
  } = router.query;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(router.query);
      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch articles");
      const data = await res.json();
      setArticles(data.articles || []);
      setPagination(data.pagination || {});
      setTopTags(data.topTags || []);
      setTopCategories(data.topCategories || []);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
    setLoading(false);
  }, [router.query]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleFilterChange = (key, value) => {
    const newQuery = { ...router.query, [key]: value, page: 1 };
    if (!value) delete newQuery[key];
    router.push({ pathname: "/admin/articles", query: newQuery });
  };

  const handleChipClick = (type, value) => {
    handleFilterChange(type, value);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedArticles(articles.map((a) => a._id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectSingle = (e, id) => {
    if (e.target.checked) {
      setSelectedArticles((prev) => [...prev, id]);
    } else {
      setSelectedArticles((prev) =>
        prev.filter((articleId) => articleId !== id),
      );
    }
  };

  useEffect(() => {
    if (selectAllRef.current) {
      const allSelected =
        selectedArticles.length === articles.length && articles.length > 0;
      selectAllRef.current.checked = allSelected;
      selectAllRef.current.indeterminate =
        selectedArticles.length > 0 && !allSelected;
    }
  }, [selectedArticles, articles]);

  const handleDelete = (id) => {
    onConfirmRef.current = () => deleteArticles(id ? [id] : selectedArticles);
    setConfirmTitle("Confirm Deletion");
    setConfirmMessage(
      `Are you sure you want to delete ${id ? "this article" : `${selectedArticles.length} articles`}? This action cannot be undone.`,
    );
    setConfirmOpen(true);
  };

  const deleteArticles = async (ids) => {
    setApplyingBulk(true);
    try {
      await toast.promise(
        fetch("/api/admin/articles/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleIds: ids }),
        }).then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to delete articles");
          }
          return res.json();
        }),
        {
          loading: "Deleting articles...",
          success: () => {
            fetchArticles();
            setSelectedArticles([]);
            return "Articles deleted successfully!";
          },
          error: (err) => err.message,
        },
      );
    } finally {
      setApplyingBulk(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <AdminLayout>
      <motion.div
        className={styles.pageWrapper}
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <header className={styles.header}>
          <h1 className={styles.title} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="file-text" size={28} style={{ color: "var(--admin-primary)" }} />
            Articles
            {loading && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <InlineSpinner sizePx={16} />
                <span className={styles.muted}>Loading…</span>
              </span>
            )}
          </h1>
          <Link href="/admin/articles/new" className={`${utilities.btn} ${utilities.btnSm} ${utilities.btnPrimary}`}>
            <Icon name="plus" size={16} />
            <span>Create Article</span>
          </Link>
        </header>

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
              search={search}
              status={status}
              hasCover={hasCover}
              limit={limit}
              handleFilterChange={handleFilterChange}
            />
          </motion.div>
        )}

        {/* Quick Filters Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Icon name="zap" size={20} />
            Quick Filters
          </h2>
          <button 
            className={styles.toggleButton}
            onClick={() => toggleSection('quickFilters')}
          >
            <Icon name={expandedSections.quickFilters ? "chevron-up" : "chevron-down"} size={20} />
          </button>
        </div>
        
        {expandedSections.quickFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {(topTags.length > 0 || topCategories.length > 0) && (
              <div className={styles.quickFiltersContainer}>
                {topTags.length > 0 && (
                  <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Top Tags:</span>
                    {topTags.map((t) => (
                      <Chip
                        key={t}
                        label={`#${t}`}
                        onClick={() => handleChipClick("tag", t)}
                        isActive={tag === t}
                      />
                    ))}
                  </div>
                )}
                {topCategories.length > 0 && (
                  <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Top Categories:</span>
                    {topCategories.map((c) => (
                      <Chip
                        key={c}
                        label={c}
                        onClick={() => handleChipClick("category", c)}
                        isActive={category === c}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {selectedArticles.length > 0 && (
          <motion.div
            className={styles.selectionBar}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.selectionText}>
              {selectedArticles.length} selected
            </span>
            <Tooltip content="Delete Selected">
              <button
                onClick={() => handleDelete()}
                className={`${utilities.btn} ${utilities.btnIcon} ${utilities.btnDanger}`}
              >
                <Icon name="trash" />
              </button>
            </Tooltip>
          </motion.div>
        )}

        {/* Articles Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Icon name="file-text" size={20} />
            Articles
          </h2>
          <button 
            className={styles.toggleButton}
            onClick={() => toggleSection('articles')}
          >
            <Icon name={expandedSections.articles ? "chevron-up" : "chevron-down"} size={20} />
          </button>
        </div>
        
        {expandedSections.articles && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.tableWrapper}>
              {loading ? (
                <ArticleListSkeleton />
              ) : articles.length > 0 ? (
                <motion.div
                  className={styles.articleGrid}
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {articles.map((article) => (
                    <AdminPublicArticleCard
                      key={article._id || article.id}
                      article={article}
                      isSelected={selectedArticles.includes(article._id || article.id)}
                      onSelect={handleSelectSingle}
                      onDelete={handleDelete}
                      onPin={togglePin}
                      onFeatureToggle={handleFeatureToggle}
                      pinning={pinningId === (article._id || article.id)}
                      featuring={featuringId === (article._id || article.id)}
                    />
                  ))}
                </motion.div>
              ) : (
                <EmptyState
                  title="No articles found"
                  message="Try adjusting your search or filters, or create a new article."
                  actions={[
                    {
                      label: "Create Article",
                      onClick: () => router.push("/admin/articles/new"),
                      icon: "plus",
                    },
                    {
                      label: "Clear Filters",
                      onClick: () => router.push("/admin/articles"),
                      variant: "ghost",
                    },
                  ]}
                />
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={`${utilities.btn} ${utilities.btnSecondary}`}
                  onClick={() => handleFilterChange("page", pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </button>
                <span className={styles.paginationText}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className={`${utilities.btn} ${utilities.btnSecondary}`}
                  onClick={() => handleFilterChange("page", pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        )}

        <Modal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={confirmTitle}
          onConfirm={() => {
            onConfirmRef.current();
            setConfirmOpen(false);
          }}
        >
          <p>{confirmMessage}</p>
        </Modal>

        <div className="screen-reader-only" aria-live="polite">
          {ariaMsg}
        </div>
      </motion.div>
      {applyingBulk && (
        <LoadingAnimation visible={true} size="sm" showStars={false} backdropOpacity={0.3} />
      )}
    </AdminLayout>
  );
};

export default ArticlesPage;