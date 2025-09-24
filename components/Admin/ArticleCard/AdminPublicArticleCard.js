import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "../Icon/Icon";
import Tooltip from "../Tooltip/Tooltip";
import Spinner from "../../Spinner/Spinner";
import utilities from "../../../styles/utilities.module.css";
import PublicArticleCard from "../../Articles/ArticleCard";
import StatusPill from "../StatusPill/StatusPill";
import styles from "./AdminPublicArticleCard.module.css";

const AdminPublicArticleCard = ({
  article,
  isSelected,
  onSelect,
  onDelete,
  onPin,
  onFeatureToggle,
  pinning = false,
  featuring = false,
}) => {
  const id = article?._id || article?.id;
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const articleStatus = article?.published
    ? "published"
    : article?.publishAt && new Date(article.publishAt) > new Date()
    ? "scheduled"
    : "draft";

  return (
    <motion.div variants={variants} className={styles.articleCardWrapper}>
      <div className={styles.cardHeader}>
        <label className={styles.selectSection}>
          <input
            type="checkbox"
            aria-label={isSelected ? "Deselect article" : "Select article"}
            checked={!!isSelected}
            onChange={(e) => onSelect && onSelect(e, id)}
          />
          <span className={styles.selectLabel}>Select</span>
        </label>
        <div className={styles.actionsSection}>
          <Tooltip content="Edit">
            <Link href={`/admin/articles/edit/${id}`} className={styles.actionButton}>
              <Icon name="edit" size={16} />
            </Link>
          </Tooltip>
          <Tooltip content="Delete">
            <button onClick={() => onDelete && onDelete(id)} className={`${styles.actionButton} ${styles.actionButtonDanger}`}>
              <Icon name="trash" size={16} />
            </button>
          </Tooltip>
          <Tooltip text={article?.pinned ? "Unpin" : "Pin"}>
            <button
              onClick={() => onPin(article)}
              disabled={pinning}
              className={`${styles.actionButton} ${article?.pinned ? styles.actionButtonActive : ''}`}
            >
              <Icon name="pin" size={16} />
            </button>
          </Tooltip>
          <Tooltip text={article?.featuredOnHome ? "Remove from Home" : "Feature on Home"}>
            <button
              onClick={() => onFeatureToggle(article._id, !article.featuredOnHome)}
              disabled={featuring}
              className={`${styles.actionButton} ${article?.featuredOnHome ? styles.actionButtonActive : ''}`}
            >
              {featuring ? <Spinner size="sm" /> : <Icon name="home" size={16} />}
            </button>
          </Tooltip>
          <Tooltip content="View Live">
            <a
              href={`/articles/${article?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionButton}
            >
              <Icon name="externalLink" size={16} />
            </a>
          </Tooltip>
        </div>
      </div>
      {/* Status row */}
      <div className={styles.statusSection}>
        <StatusPill status={articleStatus} />
        {article?.featuredOnHome ? (
          <StatusPill variant="home" label="Home" status={articleStatus} />
        ) : (
          <StatusPill variant="nothome" label="Not on Home" status={articleStatus} />
        )}
        {article?.pinned && (
          <span className={styles.pinnedBadge}>
            Pinned
          </span>
        )}
      </div>
      {/* Public-facing visual card (non-interactive in admin list) */}
      <div className={styles.publicCardWrapper}>
        <PublicArticleCard article={article} />
      </div>
    </motion.div>
  );
};

export default AdminPublicArticleCard;