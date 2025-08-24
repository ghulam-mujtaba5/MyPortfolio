import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Icon from '../Icon/Icon';
import StatusPill from '../StatusPill/StatusPill';
import Tooltip from '../Tooltip/Tooltip';
import commonStyles from './ArticleCard.module.css';
import lightStyles from './ArticleCard.light.module.css';
import darkStyles from './ArticleCard.dark.module.css';
import Chip from '../Chip/Chip';
import { FiTrash2, FiEdit, FiEye, FiCopy, FiCheckCircle, FiXCircle, FiHelpCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { useTheme } from '../../../context/ThemeContext';
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

  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <motion.div
      variants={cardVariants}
      className={`${commonStyles.card} ${themeStyles.card} ${isSelected ? `${commonStyles.selected} ${themeStyles.selected}` : ''}`}
    >
      <div className={`${commonStyles.selectionOverlay} ${themeStyles.selectionOverlay}`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e, id)}
          className={`${commonStyles.checkbox} ${themeStyles.checkbox}`}
        />
      </div>
      <div className={`${commonStyles.cardContent} ${themeStyles.cardContent}`}>
        <div className={`${commonStyles.coverImage} ${themeStyles.coverImage}`}>
          {article.coverImage ? (
            <img src={article.coverImage} alt={article.title} />
          ) : (
            <div className={`${commonStyles.imagePlaceholder} ${themeStyles.imagePlaceholder}`}>
              <Icon name="image" size={48} />
            </div>
          )}
          <div className={`${commonStyles.coverImageOverlay} ${themeStyles.coverImageOverlay}`}></div>
          <div className={`${commonStyles.metaTop} ${themeStyles.metaTop}`}>
            <StatusPill status={article.status} />
          </div>
        </div>
        <div className={`${commonStyles.info} ${themeStyles.info}`}>
          <div className={`${commonStyles.tags} ${themeStyles.tags}`}>
            {article.categories?.slice(0, 1).map((category) => (
              <Chip key={category} label={category} size="sm" variant="primary" />
            ))}
            {article.tags?.slice(0, 2).map((tag) => (
              <Chip key={tag} label={`#${tag}`} size="sm" />
            ))}
          </div>
          <h3 className={`${commonStyles.title} ${themeStyles.title}`}>
            <Link href={`/admin/articles/edit/${id}`}>
              {article.title}
            </Link>
          </h3>
          {article.excerpt && (
            <p className={`${commonStyles.excerpt} ${themeStyles.excerpt}`} title={article.excerpt}>
              {article.excerpt}
            </p>
          )}
          <div className={`${commonStyles.metaBottom} ${themeStyles.metaBottom}`}>
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
                <div className={`${commonStyles.debugInfo} ${themeStyles.debugInfo}`}>
          <small>ID: {safeId || 'N/A'}</small>
          <button onClick={handleCheckExistence} className={`${commonStyles.debugButton} ${themeStyles.debugButton}`} title="Check if this ID exists in the DB">
            <FiHelpCircle /> Check ID
          </button>
        </div>
        <div className={`${commonStyles.actions} ${themeStyles.actions}`}>
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
