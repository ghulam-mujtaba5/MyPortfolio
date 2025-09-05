import React, { useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import commonStyles from "./Modal.module.css";
import lightStyles from "./Modal.light.module.css";
import darkStyles from "./Modal.dark.module.css";
import utilities from "../../../styles/utilities.module.css";

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
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const modalRef = React.useRef(null);
  const prevFocusRef = React.useRef(null);
  const confirmBtnRef = React.useRef(null);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    if (isOpen) {
      // Remember the element that had focus before opening
      try {
        prevFocusRef.current = document.activeElement;
      } catch {}
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      // Move focus into the dialog
      try {
        setTimeout(() => {
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
        }, 0);
      } catch {}
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
        window.removeEventListener("keydown", trap);
      };
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
      // Restore focus back to the previously focused element
      try {
        const el = prevFocusRef.current;
        if (el && typeof el.focus === "function") {
          el.focus();
        }
      } catch {}
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={commonStyles.overlay} onClick={onClose}>
      <div
        className={`${commonStyles.modal} ${themeStyles.modal}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={ariaDescribedBy}
        ref={modalRef}
      >
        <div className={`${commonStyles.header} ${themeStyles.header}`}>
          <h2 id="modal-title" className={commonStyles.title}>
            {title}
          </h2>
          <button
            className={`${commonStyles.closeButton} ${themeStyles.closeButton}`}
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>
        <div className={commonStyles.content}>{children}</div>
        {onConfirm && (
          <div className={commonStyles.footer}>
            <button className={`${utilities.btn} ${utilities.btnSecondary}`} onClick={onClose}>
              {cancelText}
            </button>
            <button ref={confirmBtnRef} className={`${utilities.btn} ${utilities.btnPrimary}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
