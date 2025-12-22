import React from "react";
import Link from "next/link";
import Tooltip from "../Tooltip/Tooltip";
import Icon from "../Icon/Icon";
import Spinner from "../../Spinner/Spinner";
import utilities from "../../../styles/utilities.module.css";
import ProjectPublicCard from "../../Projects/Project1";
import StatusPill from "../StatusPill/StatusPill";
import styles from "./AdminPublicProjectCard.module.css";

const AdminPublicProjectCard = ({
  project,
  onEdit,
  onDelete,
  onPin,
  onFeatureToggle,
  isSelected,
  onSelect,
  deleting = false,
  pinning = false,
  featuring = false,
}) => {
  const id = project?._id || project?.id;

  const liveUrl = project?.links?.live || null;
  const projectStatus = project?.published
    ? "published"
    : project?.scheduledAt && new Date(project.scheduledAt) > new Date()
    ? "scheduled"
    : "draft";

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <label className={styles.selectSection}>
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={(e) => onSelect && onSelect(e)}
          />
          <span className={styles.selectLabel}>Select</span>
        </label>
        <div className={styles.actionsSection}>
          <Tooltip content="Edit">
            <button onClick={() => onEdit && onEdit(id)} className={styles.actionButton}>
              <Icon name="edit" size={16} />
            </button>
          </Tooltip>
          <Tooltip content="Delete">
            <button
              onClick={() => onDelete && onDelete(id)}
              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
              disabled={deleting}
            >
              {deleting ? <Spinner size="sm" label="Deleting" /> : <Icon name="trash" size={16} />}
            </button>
          </Tooltip>
          <Tooltip content={project?.pinned ? "Unpin" : "Pin"}>
            <button
              onClick={() => onPin && onPin(project)}
              className={styles.actionButton}
              aria-pressed={!!project?.pinned}
              aria-label={project?.pinned ? "Unpin project" : "Pin project"}
              disabled={pinning}
            >
              {pinning ? <Spinner size="sm" label="Updating pin" /> : <Icon name="pin" size={16} />}
            </button>
          </Tooltip>
          <Tooltip content={project.featuredOnHome ? "Remove from Home" : "Feature on Home"}>
            <button
              onClick={() => onFeatureToggle(project._id, !project.featuredOnHome)}
              disabled={featuring}
              className={`${styles.actionButton} ${project.featuredOnHome ? styles.actionButtonActive : ''}`}
            >
              {featuring ? <Spinner size="sm" /> : <Icon name="home" size={16} />}
            </button>
          </Tooltip>
          {liveUrl && (
            <Tooltip content="View Live">
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionButton}
              >
                <Icon name="externalLink" size={16} />
              </a>
            </Tooltip>
          )}
        </div>
      </div>
      {/* Status row */}
      <div className={styles.statusSection}>
        <StatusPill status={projectStatus} />
        {project?.featuredOnHome ? (
          <StatusPill variant="home" label="Home" status={projectStatus} />
        ) : (
          <StatusPill variant="nothome" label="Not on Home" status={projectStatus} />
        )}
        {project?.pinned && (
          <span className={styles.pinnedBadge}>
            Pinned
          </span>
        )}
      </div>
      {/* Public-facing project card UI (non-interactive in admin list) */}
      <div className={styles.publicCardWrapper}>
        <ProjectPublicCard project={project} />
      </div>
    </div>
  );
};

export default AdminPublicProjectCard;