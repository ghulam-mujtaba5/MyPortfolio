import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../Icon/Icon';
import styles from './EmptyState.module.css';
import utilities from '../../../styles/utilities.module.css';

const EmptyState = ({ title, message, icon, actions }) => {
  return (
    <motion.div
      className={styles.emptyStateWrapper}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {icon && <div className={styles.iconWrapper}><Icon name={icon} size={48} /></div>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action, index) => {
            const variant = action.variant || 'primary';
            const variantClass =
              variant === 'primary' ? utilities.btnPrimary :
              variant === 'secondary' ? utilities.btnSecondary :
              variant === 'danger' ? utilities.btnDanger :
              utilities.btnGhost;
            return (
            <button
              key={index}
              onClick={action.onClick}
              className={`${utilities.btn} ${variantClass}`}
            >
              {action.icon && <Icon name={action.icon} size={16} />}
              <span>{action.label}</span>
            </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
