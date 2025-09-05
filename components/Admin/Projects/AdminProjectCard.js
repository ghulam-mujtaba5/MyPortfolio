import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";
import adminStyles from "./AdminProjectCard.module.css"; // Admin-specific styles
import Icon from "../Icon/Icon";
import Tooltip from "../Tooltip/Tooltip";
import toast from "react-hot-toast";
import { FiHelpCircle } from "react-icons/fi";
import utilities from "../../../styles/utilities.module.css";
import Spinner from "../../Spinner/Spinner";

const AdminProjectCard = ({
  project,
  onEdit,
  onDelete,
  onPin,
  isSelected,
  onSelect,
  deleting = false,
  pinning = false,
}) => {
  const { theme } = useTheme();

  const safeId = project._id || project.id;

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
        body: JSON.stringify({ id: safeId, type: 'project' }),
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
    <div
      className={`${adminStyles.card} ${theme === "dark" ? adminStyles.dark : ""} ${isSelected ? adminStyles.selected : ""}`}
    >
      <input
        type="checkbox"
        className={adminStyles.checkbox}
        checked={isSelected}
        onChange={onSelect}
        onClick={(e) => e.stopPropagation()} // Prevent card click-through
      />
      <div className={adminStyles.imageContainer}>
        {project.image && (
          <Image
            src={project.image}
            alt={`${project.title} preview`}
            className={adminStyles.image}
            fill
            style={{ objectFit: project?.imageFit || 'cover' }}
          />
        )}
      </div>
      <div className={adminStyles.content}>
        <h3 className={adminStyles.title}>{project.title}</h3>
        <div className={adminStyles.badges}>
          {project.published ? (
            <span className={adminStyles.badgeSuccess}>Published</span>
          ) : (
            <span className={adminStyles.badgeMuted}>Draft</span>
          )}
          {project.featuredOnHome && (
            <span className={adminStyles.badgeInfo}>Featured</span>
          )}
          {project.status && (
            <span
              className={`${adminStyles.badge} ${adminStyles[`status${project.status.replace(/\s+/g, "")}`]}`}
            >
              {project.status}
            </span>
          )}
        </div>
        <div className={adminStyles.debugInfo}>
          <small>ID: {safeId || 'N/A'}</small>
          <button onClick={handleCheckExistence} className={`${utilities.btn} ${utilities.btnIcon} ${utilities.btnSecondary}`} title="Check if this ID exists in the DB" aria-label="Check if this ID exists in the DB">
            <FiHelpCircle /> Check ID
          </button>
        </div>
        <div className={adminStyles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={adminStyles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={adminStyles.links}>
          <button
            onClick={() => onEdit(project._id || project.id)}
            className={`${utilities.btn} ${utilities.btnSecondary}`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(project._id || project.id)}
            className={`${utilities.btn} ${utilities.btnDanger}`}
            disabled={deleting}
          >
            {deleting ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Spinner size="sm" label="Deleting" />
                Deleting…
              </span>
            ) : (
              "Delete"
            )}
          </button>
          <Tooltip content={project.pinned ? "Unpin" : "Pin"}>
            <button
              onClick={() => onPin && onPin(project)}
              className={`${utilities.btn} ${utilities.btnIcon} ${utilities.btnSecondary}`}
              aria-pressed={project.pinned}
              aria-label={project.pinned ? "Unpin project" : "Pin project"}
              disabled={pinning}
            >
              {pinning ? (
                <Spinner size="sm" label="Updating pin" />
              ) : (
                <Icon name="pin" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectCard;
