import React from "react";
import Icon from "../Icon/Icon";
import styles from "./EnhancedFilterSection.module.css";

const EnhancedFilterSection = ({ 
  search, 
  setSearch, 
  published, 
  featured, 
  router,
  selectedProjects,
  handleBulkAction
}) => {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterHeader}>
        <h2 className={styles.filterTitle}>
          <Icon name="filter" size={20} />
          Filter Projects
        </h2>
        <p className={styles.filterDescription}>
          Refine your project list with the filters below
        </p>
      </div>
      
      <div className={styles.filterControls}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <Icon name="search" size={16} />
              Search
            </label>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              role="searchbox"
              aria-label="Search projects by title"
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <Icon name="tag" size={16} />
              Status
            </label>
            <div className={styles.chipContainer}>
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
          </div>
        </div>
      </div>
      
      {selectedProjects.length > 0 && (
        <div className={styles.bulkActionsContainer}>
          <div className={styles.bulkActionsHeader}>
            <span className={styles.bulkActionsCount}>
              {selectedProjects.length} selected
            </span>
          </div>
          <div className={styles.bulkActionsButtons}>
            <button 
              className={`${styles.bulkActionButton} ${styles.bulkActionButtonPrimary}`} 
              onClick={() => handleBulkAction("publish")}
            >
              <Icon name="check" size={16} />
              Publish Selected
            </button>
            <button 
              className={`${styles.bulkActionButton} ${styles.bulkActionButtonSecondary}`} 
              onClick={() => handleBulkAction("draft")}
            >
              <Icon name="file" size={16} />
              Set to Draft
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className={`${styles.bulkActionButton} ${styles.bulkActionButtonDanger}`}
            >
              <Icon name="trash" size={16} />
              Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFilterSection;