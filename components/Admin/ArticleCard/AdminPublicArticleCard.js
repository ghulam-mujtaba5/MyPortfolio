import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "../Icon/Icon";
import Tooltip from "../Tooltip/Tooltip";
import Spinner from "../../Spinner/Spinner";
import utilities from "../../../styles/utilities.module.css";
import PublicArticleCard from "../../Articles/ArticleCard";

const AdminPublicArticleCard = ({
  article,
  isSelected,
  onSelect,
  onDelete,
  onPin,
  pinning = false,
}) => {
  const id = article?._id || article?.id;
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={variants}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 10,
          padding: "6px 8px",
          borderRadius: 10,
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
        }}
      >
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            aria-label={isSelected ? "Deselect article" : "Select article"}
            checked={!!isSelected}
            onChange={(e) => onSelect && onSelect(e, id)}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>Select</span>
        </label>
        <div style={{ display: "inline-flex", gap: 8 }}>
          <Tooltip content="Edit">
            <Link href={`/admin/articles/edit/${id}`} className={`${utilities.btnIcon}`}>
              <Icon name="edit" />
            </Link>
          </Tooltip>
          <Tooltip content="Delete">
            <button onClick={() => onDelete && onDelete(id)} className={`${utilities.btnIcon} ${utilities.btnDanger}`}>
              <Icon name="trash" />
            </button>
          </Tooltip>
          <Tooltip content={article?.pinned ? "Unpin" : "Pin"}>
            <button
              onClick={() => onPin && onPin(article)}
              className={`${utilities.btnIcon}`}
              aria-pressed={!!article?.pinned}
              aria-label={article?.pinned ? "Unpin article" : "Pin article"}
              disabled={pinning}
            >
              {pinning ? <Spinner size="sm" label="Updating pin" /> : <Icon name="pin" />}
            </button>
          </Tooltip>
          <Tooltip content="View Live">
            <a
              href={`/articles/${article?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${utilities.btnIcon}`}
            >
              <Icon name="externalLink" />
            </a>
          </Tooltip>
        </div>
      </div>
      {/* Public-facing visual card (non-interactive in admin list) */}
      <div style={{ pointerEvents: "none" }}>
        <PublicArticleCard article={article} />
      </div>
    </motion.div>
  );
};

export default AdminPublicArticleCard;
