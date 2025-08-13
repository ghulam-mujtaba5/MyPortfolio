import React from "react";
import styles from "./NewArticleCard.module.css";

// Reusable Icon component for actions
const ActionIcon = ({ icon, label }) => (
  <div className={styles.actionIcon} title={label}>
    {icon}
  </div>
);

const NewArticleCard = ({ article }) => {
  const { title, author, date, status, imageUrl } = article;

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "published":
        return styles.statusPublished;
      case "draft":
        return styles.statusDraft;
      case "pending review":
        return styles.statusPending;
      default:
        return "";
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={imageUrl || "https://via.placeholder.com/400x200"}
          alt={title}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.meta}>
          By {author} on {new Date(date).toLocaleDateString()}
        </p>
        <div className={styles.footer}>
          <span className={`${styles.status} ${getStatusClass(status)}`}>
            {status}
          </span>
          <div className={styles.actions}>
            <ActionIcon icon="✏️" label="Edit" />
            <ActionIcon icon="🗑️" label="Delete" />
            <ActionIcon icon="👁️" label="View" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArticleCard;
