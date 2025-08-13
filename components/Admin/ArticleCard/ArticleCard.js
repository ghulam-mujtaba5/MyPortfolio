import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Icon from '../Icon/Icon';
import StatusPill from '../StatusPill/StatusPill';
import Tooltip from '../Tooltip/Tooltip';
import styles from './ArticleCard.module.css';
import Chip from '../Chip/Chip';

const ArticleCard = ({ article, isSelected, onSelect, onDelete }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
          onChange={(e) => onSelect(e, article._id)}
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
            <Link href={`/admin/articles/editor/${article._id}`}>
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
        <div className={styles.actions}>
          <Tooltip content="Edit">
            <Link
              href={`/admin/articles/editor/${article._id}`}
              className="button ghost icon-only"
            >
              <Icon name="edit" />
            </Link>
          </Tooltip>
          <Tooltip content="Delete">
            <button
              onClick={() => onDelete(article._id)}
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
