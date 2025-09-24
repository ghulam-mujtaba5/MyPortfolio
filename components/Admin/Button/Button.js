import React from 'react';
import styles from './Button.module.css';
import utilities from '../../../styles/utilities.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Map variant to CSS classes
  const variantClass = 
    variant === 'primary' ? styles.btnPrimary :
    variant === 'secondary' ? styles.btnSecondary :
    variant === 'danger' ? styles.btnDanger :
    variant === 'success' ? styles.btnSuccess :
    variant === 'outline' ? styles.btnOutline :
    variant === 'ghost' ? styles.btnGhost :
    variant === 'icon' ? styles.btnIcon :
    styles.btnPrimary;

  // Map size to CSS classes
  const sizeClass = 
    size === 'sm' ? styles.btnSm :
    size === 'lg' ? styles.btnLg :
    '';

  // Combine all classes
  const buttonClasses = [
    utilities.btn,
    variantClass,
    sizeClass,
    loading ? styles.btnLoading : '',
    className
  ].filter(Boolean).join(' ');

  // Handle click with loading state
  const handleClick = (e) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} />
      )}
      {icon && iconPosition === 'left' && (
        <span className={styles.iconLeft}>{icon}</span>
      )}
      <span className={loading ? styles.loadingText : ''}>
        {children}
      </span>
      {icon && iconPosition === 'right' && (
        <span className={styles.iconRight}>{icon}</span>
      )}
    </button>
  );
};

export default Button;