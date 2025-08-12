import React, { useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import commonStyles from './Modal.module.css';
import lightStyles from './Modal.light.module.css';
import darkStyles from './Modal.dark.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={commonStyles.overlay} onClick={onClose}>
      <div
        className={`${commonStyles.modal} ${themeStyles.modal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${commonStyles.header} ${themeStyles.header}`}>
          <h2 className={commonStyles.title}>{title}</h2>
          <button className={`${commonStyles.closeButton} ${themeStyles.closeButton}`} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={commonStyles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
