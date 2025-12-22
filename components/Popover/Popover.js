// components/Popover/Popover.js
// Native Web Popover API component with smooth animations

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './Popover.module.css';

/**
 * Popover Component using native Web Popover API
 * Supports tooltips, dropdowns, and contextual UI components
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content inside popover
 * @param {string} props.id - Unique identifier for the popover
 * @param {string} props.placement - Popover placement (auto, top, bottom, left, right)
 * @param {boolean} props.manual - Manual trigger mode instead of auto
 * @param {React.ReactNode} props.trigger - Trigger element
 * @param {boolean} props.autoHide - Auto hide when clicking outside
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onShow - Callback when popover shows
 * @param {Function} props.onHide - Callback when popover hides
 * @returns {JSX.Element}
 */
export const Popover = ({
  children,
  id = `popover-${Math.random().toString(36).substr(2, 9)}`,
  placement = 'auto',
  manual = false,
  trigger = null,
  autoHide = true,
  className = '',
  onShow = null,
  onHide = null,
}) => {
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const anchorName = `--anchor-${id.replace(/[^a-zA-Z0-9-]/g, '')}`; // Ensure valid CSS identifier

  // Toggle popover visibility
  const toggle = useCallback(() => {
    if (popoverRef.current) {
      if (popoverRef.current.matches(':popover-open')) {
        popoverRef.current.hidePopover();
        setIsOpen(false);
        if (onHide) onHide();
      } else {
        popoverRef.current.showPopover();
        setIsOpen(true);
        if (onShow) onShow();
      }
    }
  }, [onShow, onHide]);

  const show = useCallback(() => {
    if (popoverRef.current && !popoverRef.current.matches(':popover-open')) {
      popoverRef.current.showPopover();
      setIsOpen(true);
      if (onShow) onShow();
    }
  }, [onShow]);

  const hide = useCallback(() => {
    if (popoverRef.current && popoverRef.current.matches(':popover-open')) {
      popoverRef.current.hidePopover();
      setIsOpen(false);
      if (onHide) onHide();
    }
  }, [onHide]);

  // Set up trigger element event listeners
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !manual) return;

    trigger.addEventListener('click', toggle);

    return () => {
      trigger.removeEventListener('click', toggle);
    };
  }, [toggle, manual]);

  // Handle auto-hide on outside click
  useEffect(() => {
    if (!autoHide || !manual) return;

    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        hide();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [autoHide, manual, hide]);

  // Handle ESC key to close popover
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && popoverRef.current?.matches(':popover-open')) {
        hide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hide]);

  return (
    <>
      {trigger && (
        <div
          ref={triggerRef}
          className={styles.trigger}
          style={{ anchorName }}
          role="button"
          tabIndex={0}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
        >
          {trigger}
        </div>
      )}

      <div
        ref={popoverRef}
        id={id}
        popover={manual ? 'manual' : 'auto'}
        className={`${styles.popover} ${styles[`placement-${placement}`]} ${className}`}
        style={{ positionAnchor: anchorName }}
      >
        {children}
      </div>
    </>
  );
};

/**
 * Tooltip Component - lightweight popover for hints
 */
export const Tooltip = ({
  content,
  placement = 'top',
  trigger = null,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      placement={placement}
      manual={true}
      trigger={trigger}
      className={`${styles.tooltip} ${className}`}
      onShow={() => setIsOpen(true)}
      onHide={() => setIsOpen(false)}
    >
      {content}
    </Popover>
  );
};

/**
 * Dropdown Component - popover for menu items
 */
export const Dropdown = ({
  items = [],
  onSelect = null,
  trigger = null,
  className = '',
  children,
}) => {
  const popoverRef = useRef(null);

  const handleItemClick = useCallback(
    (item) => {
      if (onSelect) {
        onSelect(item);
      }
      if (popoverRef.current) {
        popoverRef.current.hidePopover();
      }
    },
    [onSelect]
  );

  return (
    <Popover
      placement="bottom"
      manual={true}
      trigger={trigger}
      className={`${styles.dropdown} ${className}`}
    >
      <div className={styles.dropdownContent}>
        {children ||
          items.map((item, index) => (
            <button
              key={index}
              className={styles.dropdownItem}
              onClick={() => handleItemClick(item)}
              type="button"
            >
              {typeof item === 'string' ? item : item.label}
            </button>
          ))}
      </div>
    </Popover>
  );
};

/**
 * ContextMenu Component - popover for context menus
 */
export const ContextMenu = ({
  items = [],
  onSelect = null,
  className = '',
  children,
}) => {
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      if (popoverRef.current) {
        popoverRef.current.showPopover();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div
      ref={popoverRef}
      popover="manual"
      className={`${styles.contextMenu} ${className}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className={styles.contextMenuContent}>
        {children ||
          items.map((item, index) => (
            <button
              key={index}
              className={styles.contextMenuItem}
              onClick={() => {
                if (onSelect) onSelect(item);
                popoverRef.current?.hidePopover();
              }}
              type="button"
            >
              {typeof item === 'string' ? item : item.label}
            </button>
          ))}
      </div>
    </div>
  );
};

export default Popover;
