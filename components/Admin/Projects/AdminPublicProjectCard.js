import React from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";
import Tooltip from "../Tooltip/Tooltip";
import Icon from "../Icon/Icon";
import Spinner from "../../Spinner/Spinner";
import utilities from "../../../styles/utilities.module.css";
import ProjectPublicCard from "../../Projects/Project1";

const AdminPublicProjectCard = ({
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
  const id = project?._id || project?.id;

  const liveUrl = project?.links?.live || null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={(e) => onSelect && onSelect(e)}
          />
          <span style={{ fontSize: 12, opacity: 0.8 }}>Select</span>
        </label>
        <div style={{ display: "inline-flex", gap: 8 }}>
          <Tooltip content="Edit">
            <button onClick={() => onEdit && onEdit(id)} className={`${utilities.btnIcon}`}>
              <Icon name="edit" />
            </button>
          </Tooltip>
          <Tooltip content="Delete">
            <button
              onClick={() => onDelete && onDelete(id)}
              className={`${utilities.btnIcon} ${utilities.btnDanger}`}
              disabled={deleting}
            >
              {deleting ? <Spinner size="sm" label="Deleting" /> : <Icon name="trash" />}
            </button>
          </Tooltip>
          <Tooltip content={project?.pinned ? "Unpin" : "Pin"}>
            <button
              onClick={() => onPin && onPin(project)}
              className={`${utilities.btnIcon}`}
              aria-pressed={!!project?.pinned}
              aria-label={project?.pinned ? "Unpin project" : "Pin project"}
              disabled={pinning}
            >
              {pinning ? <Spinner size="sm" label="Updating pin" /> : <Icon name="pin" />}
            </button>
          </Tooltip>
          {liveUrl && (
            <Tooltip content="View Live">
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${utilities.btnIcon}`}
              >
                <Icon name="externalLink" />
              </a>
            </Tooltip>
          )}
        </div>
      </div>
      {/* Public-facing project card UI (non-interactive in admin list) */}
      <div style={{ pointerEvents: "none" }}>
        <ProjectPublicCard project={project} />
      </div>
    </div>
  );
};

export default AdminPublicProjectCard;
