import React from "react";
import { motion } from "framer-motion";
import styles from "./Chip.module.css";
import Icon from "../Icon/Icon";

const Chip = ({ label, isActive, onClick, onRemove, ...props }) => {
  const chipVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.button
      type="button"
      className={`${styles.chip} ${isActive ? styles.active : ""}`}
      onClick={onClick}
      variants={chipVariants}
      layout
      {...props}
    >
      {label}
      {onRemove && (
        <span
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation(); // Prevent chip's main onClick
            onRemove();
          }}
          aria-label={`Remove ${label}`}
        >
          <Icon name="close" size={14} />
        </span>
      )}
    </motion.button>
  );
};

export default Chip;
