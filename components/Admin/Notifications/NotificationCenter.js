import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import styles from "./NotificationCenter.module.css";

// Icons
const Icons = {
  bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  warning: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  error: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  close: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  checkAll: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8L9 17l-5-5"/><path d="M22 4L11 15l-1.5-1.5"/></svg>,
};

const STORAGE_KEY = 'admin:notifications:v1';
const MAX_NOTIFICATIONS = 50;

// Sample notification types for the system
const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return Icons.check;
    case 'warning': return Icons.warning;
    case 'error': return Icons.error;
    default: return Icons.info;
  }
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Load notifications from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
          setUnreadCount(parsed.filter(n => !n.read).length);
        }
      } catch {}
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback((newNotifications) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
    } catch {}
  }, []);

  // Add new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount(prev => prev + 1);
  }, [saveNotifications]);

  // Listen for notification events
  useEffect(() => {
    const handleNotification = (e) => {
      const { type = 'info', message, title, action } = e.detail || {};
      if (message) {
        addNotification({ type, message, title, action });
      }
    };

    window.addEventListener('admin:notification', handleNotification);
    return () => window.removeEventListener('admin:notification', handleNotification);
  }, [addNotification]);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [saveNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
    setUnreadCount(0);
  }, [saveNotifications]);

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return updated;
    });
  }, [saveNotifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    saveNotifications([]);
  }, [saveNotifications]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className={styles.container}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Icons.bell />
        {unreadCount > 0 && (
          <motion.span
            className={styles.badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={unreadCount}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            className={styles.panel}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className={styles.header}>
              <h3 className={styles.title}>Notifications</h3>
              <div className={styles.headerActions}>
                {unreadCount > 0 && (
                  <button
                    className={styles.headerButton}
                    onClick={markAllAsRead}
                    title="Mark all as read"
                  >
                    <Icons.checkAll />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    className={styles.headerButton}
                    onClick={clearAll}
                    title="Clear all"
                  >
                    <Icons.trash />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className={styles.list}>
              {notifications.length === 0 ? (
                <div className={styles.empty}>
                  <Icons.bell />
                  <p>No notifications yet</p>
                  <span>You're all caught up!</span>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      className={`${styles.notification} ${styles[notification.type]} ${notification.read ? styles.read : ''}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                    >
                      <div className={styles.notificationIcon}>
                        <Icon />
                      </div>
                      <div className={styles.notificationContent}>
                        {notification.title && (
                          <span className={styles.notificationTitle}>
                            {notification.title}
                          </span>
                        )}
                        <span className={styles.notificationMessage}>
                          {notification.message}
                        </span>
                        <span className={styles.notificationTime}>
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        aria-label="Delete notification"
                      >
                        <Icons.close />
                      </button>
                      {!notification.read && (
                        <div className={styles.unreadDot} />
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={styles.footer}>
                <span className={styles.footerText}>
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Toast-style notification for immediate feedback
export function NotificationToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotification = (e) => {
      const { type = 'info', message, duration = 4000 } = e.detail || {};
      if (message) {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => [...prev, { id, type, message }]);
        
        // Auto-remove after duration
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }
    };

    window.addEventListener('admin:notification', handleNotification);
    return () => window.removeEventListener('admin:notification', handleNotification);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className={styles.toastContainer}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = getNotificationIcon(toast.type);
          return (
            <motion.div
              key={toast.id}
              className={`${styles.toast} ${styles[toast.type]}`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.toastIcon}>
                <Icon />
              </div>
              <span className={styles.toastMessage}>{toast.message}</span>
              <button
                className={styles.toastClose}
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss"
              >
                <Icons.close />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
