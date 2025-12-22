import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Icon from '../Icon/Icon';
import StatusPill from '../StatusPill/StatusPill';
import Tooltip from '../Tooltip/Tooltip';
import { formatDateConsistent } from '../../../utils/dateUtils';
import styles from './ArticleCard.premium.module.css';
import Chip from '../Chip/Chip';
import { FiHelpCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import utilities from '../../../styles/utilities.module.css';
import Spinner from '../../Spinner/Spinner';

const ArticleCard = ({ article, isSelected, onSelect, onDelete, onPin, pinning = false }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const id = article?._id || article?.id;
  const safeId = id;

  const handleCheckExistence = async () => {
    if (!safeId) {
      toast.error("No ID available to check.");
      return;
    }
    const toastId = toast.loading(`Checking ID: ${safeId}`);
    try {
      const response = await fetch('/api/admin/check-existence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: safeId, type: 'article' }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.exists) {
          toast.success(`ID exists in the database.`, { id: toastId });
        } else {
          toast.error(`ID does NOT exist in the database. This is why it 404s.`, { id: toastId });
        }
      } else {
        throw new Error(data.message || 'Failed to check existence');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
    >
      <div className={styles.selectionOverlay}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e, id)}
          className={styles.checkbox}
        />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.coverImage}>
          {article.coverImage ? (
            <img src={article.coverImage} alt={article.title} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Icon name="image" size={48} />
            </div>
          )}
          <div className={styles.coverImageOverlay}></div>
          <div className={styles.metaTop}>
            <StatusPill status={article.status} />
          </div>
        </div>
        <div className={styles.info}>
          <div className={styles.tags}>
            {Array.isArray(article.categories) && article.categories.map((category) => {
              const key = String(category || "");
              const normalized = key.toLowerCase();
              let catClass = styles.catOthers;
              if (normalized.includes("academic") || normalized.includes("learning")) catClass = styles.catAcademics;
              else if (normalized.includes("project") || normalized.includes("career")) catClass = styles.catProjects;
              else if (normalized.includes("engineer") || normalized.includes("development")) catClass = styles.catEngineering;
              else if (normalized.includes("tech") || normalized.includes("trend")) catClass = styles.catTech;
              return (
                <Chip key={key} label={key} className={`${styles.categoryBadge} ${catClass}`} />
              );
            })}
            {Array.isArray(article.tags) && article.tags.slice(0, 2).map((tag) => (
              <Chip key={tag} label={`#${tag}`} className={styles.tagBadge} />
            ))}
          </div>
          <h3 className={styles.title}>
            <Link href={`/admin/articles/edit/${id}`}>
              {article.title}
            </Link>
          </h3>
          {article.excerpt && (
            <p className={styles.excerpt} title={article.excerpt}>
              {article.excerpt}
            </p>
          )}
          <div className={styles.metaBottom}>
            <span>
              <Icon name="eye" size={14} /> {article.views || 0}
            </span>
            <span>
              <Icon name="calendar" size={14} />{' '}
              {formatDateConsistent(article.createdAt)}
            </span>
            {article.readingTime && (
              <span>
                <Icon name="clock" size={14} /> {article.readingTime}
              </span>
            )}
          </div>
        </div>
                {process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true' && (
          <div className={styles.debugInfo}>
            <small>ID: {safeId || 'N/A'}</small>
            <button onClick={handleCheckExistence} className={styles.debugButton} title="Check if this ID exists in the DB">
              <FiHelpCircle /> Check ID
            </button>
          </div>
        )}
        <div className={styles.actions}>
          <Tooltip content="Edit">
            <Link
              href={`/admin/articles/edit/${id}`}
              className={`${utilities.btnIcon}`}
            >
              <Icon name="edit" />
            </Link>
          </Tooltip>
          <Tooltip content="Delete">
            <button
              onClick={() => onDelete(id)}
              className={`${utilities.btnIcon} ${utilities.btnDanger}`}
            >
              <Icon name="trash" />
            </button>
          </Tooltip>
          <Tooltip content={article.pinned ? 'Unpin' : 'Pin'}>
            <button
              onClick={() => onPin && onPin(article)}
              className={`${utilities.btnIcon}`}
              aria-pressed={!!article.pinned}
              aria-label={article.pinned ? 'Unpin article' : 'Pin article'}
              disabled={pinning}
            >
              {pinning ? (
                <Spinner size="sm" label="Updating pin" />
              ) : (
                <Icon name="pin" />
              )}
            </button>
          </Tooltip>
          <Tooltip content="View Live">
            <a
              href={`/articles/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${utilities.btnIcon}`}
            >
              <Icon name="externalLink" />
            </a>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;
