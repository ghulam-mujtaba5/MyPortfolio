import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import adminStyles from './AdminProjectCard.module.css'; // Admin-specific styles
import Icon from '../Icon/Icon';
import Tooltip from '../Tooltip/Tooltip';

const AdminProjectCard = ({ project, onEdit, onDelete, onPin, isSelected, onSelect }) => {
  const { theme } = useTheme();

  return (
    <div className={`${adminStyles.card} ${theme === 'dark' ? adminStyles.dark : ''} ${isSelected ? adminStyles.selected : ''}`}>
      <input 
        type="checkbox" 
        className={adminStyles.checkbox}
        checked={isSelected}
        onChange={onSelect}
        onClick={(e) => e.stopPropagation()} // Prevent card click-through
      />
      <div className={adminStyles.imageContainer}>
        {project.image && (
          <Image src={project.image} alt={`${project.title} preview`} className={adminStyles.image} fill style={{ objectFit: 'cover' }} />
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
          {project.featuredOnHome && <span className={adminStyles.badgeInfo}>Featured</span>}
          {project.status && (
            <span className={`${adminStyles.badge} ${adminStyles[`status${project.status.replace(/\s+/g, '')}`]}`}>
              {project.status}
            </span>
          )}
        </div>
        <div className={adminStyles.tags}>
          {project.tags.map(tag => (
            <span key={tag} className={adminStyles.tag}>{tag}</span>
          ))}
        </div>
        <div className={adminStyles.links}>
          <button onClick={() => onEdit(project._id)} className={`${adminStyles.button} ${adminStyles.editButton}`}>Edit</button>
          <button onClick={() => onDelete(project._id)} className={`${adminStyles.button} ${adminStyles.deleteButton}`}>Delete</button>
          <Tooltip content={project.pinned ? 'Unpin' : 'Pin'}>
            <button
                onClick={() => onPin && onPin(project)}
                className={`${adminStyles.button} ${project.pinned ? adminStyles.pinned : ''}`}
                aria-pressed={project.pinned}
            >
                <Icon name="pin" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectCard;
