import React, { useEffect, useRef, useState } from "react";
import styles from "./Modal.premium.module.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  ariaDescribedBy,
  initialFocusRef,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  const modalRef = useRef(null);
  const prevFocusRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set visibility for animation
      setIsVisible(true);
      
      // Remember the element that had focus before opening
      try {
        prevFocusRef.current = document.activeElement;
      } catch {}
      
      // Handle ESC key
      const handleEsc = (event) => {
        if (event.key === "Escape") onClose();
      };
      
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      
      // Move focus into the dialog
      const focusTimer = setTimeout(() => {
        try {
          const node = modalRef.current;
          if (!node) return;
          
          // If provided, focus the caller-provided element first
          if (initialFocusRef?.current && typeof initialFocusRef.current.focus === "function") {
            return initialFocusRef.current.focus();
          }
          
          // If we have a confirm button, prefer it as initial focus
          if (onConfirm && confirmBtnRef.current && typeof confirmBtnRef.current.focus === "function") {
            return confirmBtnRef.current.focus();
          }
          
          // Try close button first, else first focusable
          const closeBtn = node.querySelector("button");
          if (closeBtn && typeof closeBtn.focus === "function")
            return closeBtn.focus();
            
          const focusables = node.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (
            focusables &&
            focusables[0] &&
            typeof focusables[0].focus === "function"
          )
            focusables[0].focus();
        } catch {}
      }, 100);
      
      // Basic focus trap
      const trap = (e) => {
        if (e.key !== "Tab") return;
        const node = modalRef.current;
        if (!node) return;
        const focusables = Array.from(
          node.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      
      window.addEventListener("keydown", trap);
      
      return () => {
        window.removeEventListener("keydown", handleEsc);
        window.removeEventListener("keydown", trap);
        clearTimeout(focusTimer);
      };
    } else {
      // When closing, wait for animation to finish before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
      // Restore focus back to the previously focused element
      try {
        const el = prevFocusRef.current;
        if (el && typeof el.focus === "function") {
          el.focus();
        }
      } catch {}
    };
  }, []);

  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`} 
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${isOpen ? styles.open : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={ariaDescribedBy}
        ref={modalRef}
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className={styles.content}>{children}</div>
        {onConfirm && (
          <div className={styles.footer}>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
              {cancelText}
            </button>
            <button 
              ref={confirmBtnRef} 
              className={`${styles.btn} ${styles.btnPrimary}`} 
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;