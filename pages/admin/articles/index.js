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
import Spinner from "../../../components/Spinner/Spinner";
import LoadingAnimation from "../../../components/LoadingAnimation/LoadingAnimation";
import ArticleCard from "../../../components/Admin/ArticleCard/ArticleCard";
import SavedSearches from "../../../components/Admin/SavedSearches/SavedSearches";

import commonStyles from "./articles.common.module.css";
import lightStyles from "./articles.light.module.css";
import darkStyles from "./articles.dark.module.css";
import utilities from "../../../styles/utilities.module.css";

const ArticlesPage = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === "dark" ? darkStyles : lightStyles),
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
  const onConfirmRef = useRef(null);
  const selectAllRef = useRef(null);
  const router = useRouter();
  const [applyingBulk, setApplyingBulk] = useState(false);

  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    hasCover = "",
    tag = "",
    category = "",
  } = router.query;

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
            Articles
            {loading && (
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <Spinner size="sm" label="Loading articles" />
              </span>
            )}
          </h1>
          <Link href="/admin/articles/new" className={`${utilities.btn} ${utilities.btnPrimary}`}>
            <Icon name="plus" size={16} />
            <span>Create Article</span>
          </Link>
        </header>

        <div className={styles.filterBar}>
          <SearchInput
            value={search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search by title..."
          />
          <Select
            value={status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </Select>
          <Select
            value={hasCover}
            onChange={(e) => handleFilterChange("hasCover", e.target.value)}
          >
            <option value="">All Covers</option>
            <option value="true">With Cover</option>
            <option value="false">No Cover</option>
          </Select>
          <Select
            value={limit}
            onChange={(e) => handleFilterChange("limit", e.target.value)}
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </Select>
          <SavedSearches scope="articles" />
        </div>

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
                <ArticleCard
                  key={article._id || article.id}
                  article={article}
                  isSelected={selectedArticles.includes(article._id || article.id)}
                  onSelect={handleSelectSingle}
                  onDelete={handleDelete}
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
