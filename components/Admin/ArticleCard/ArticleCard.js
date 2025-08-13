import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Icon from '../Icon/Icon';
import StatusPill from '../StatusPill/StatusPill';
import Tooltip from '../Tooltip/Tooltip';
import styles from './ArticleCard.module.css';
import Chip from '../Chip/Chip';
import { FiTrash2, FiEdit, FiEye, FiCopy, FiCheckCircle, FiXCircle, FiHelpCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const ArticleCard = ({ article, isSelected, onSelect, onDelete }) => {
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
            {article.categories?.slice(0, 1).map((category) => (
              <Chip key={category} label={category} size="sm" variant="primary" />
            ))}
            {article.tags?.slice(0, 2).map((tag) => (
              <Chip key={tag} label={`#${tag}`} size="sm" />
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
              {new Date(article.createdAt).toLocaleDateString()}
            </span>
            {article.readingTime && (
              <span>
                <Icon name="clock" size={14} /> {article.readingTime}
              </span>
            )}
          </div>
        </div>
                <div className={styles.debugInfo}>
          <small>ID: {safeId || 'N/A'}</small>
          <button onClick={handleCheckExistence} className={styles.debugButton} title="Check if this ID exists in the DB">
            <FiHelpCircle /> Check ID
          </button>
        </div>
        <div className={styles.actions}>
          <Tooltip content="Edit">
            <Link
              href={`/admin/articles/edit/${id}`}
              className="button ghost icon-only"
            >
              <Icon name="edit" />
            </Link>
          </Tooltip>
          <Tooltip content="Delete">
            <button
              onClick={() => onDelete(id)}
              className="button danger-ghost icon-only"
            >
              <Icon name="trash" />
            </button>
          </Tooltip>
          <Tooltip content="View Live">
            <a
              href={`/blog/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button ghost icon-only"
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
