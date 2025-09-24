import React from "react";
import SearchInput from "../Form/SearchInput";
import Select from "../Form/Select";
import SavedSearches from "../SavedSearches/SavedSearches";
import Icon from "../Icon/Icon";
import styles from "./EnhancedFilterSection.module.css";

const EnhancedFilterSection = ({ 
  search, 
  status, 
  hasCover, 
  limit, 
  handleFilterChange 
}) => {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterHeader}>
        <h2 className={styles.filterTitle}>
          <Icon name="filter" size={20} />
          Filter Articles
        </h2>
        <p className={styles.filterDescription}>
          Refine your article list with the filters below
        </p>
      </div>
      
      <div className={styles.filterControls}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <Icon name="search" size={16} />
              Search
            </label>
            <SearchInput
              value={search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by title, tags, or content..."
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <Icon name="tag" size={16} />
              Status
            </label>
            <Select
              value={status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </Select>
          </div>
        </div>
        
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <Icon name="image" size={16} />
              Cover Image
            </label>
            <Select
              value={hasCover}
              onChange={(e) => handleFilterChange("hasCover", e.target.value)}
            >
              <option value="">All Covers</option>
              <option value="true">With Cover</option>
              <option value="false">No Cover</option>
            </Select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <Icon name="layers" size={16} />
              Items per page
            </label>
            <Select
              value={limit}
              onChange={(e) => handleFilterChange("limit", e.target.value)}
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </Select>
          </div>
        </div>
      </div>
      
      <div className={styles.savedSearchesContainer}>
        <SavedSearches scope="articles" />
      </div>
    </div>
  );
};

export default EnhancedFilterSection;