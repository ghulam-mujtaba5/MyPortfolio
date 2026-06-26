import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";
import { openCalendlyPopup } from "../../lib/calendly";
import common from "./WorkWithMeModalCommon.module.css";
import light from "./WorkWithMeModalLight.module.css";
import dark from "./WorkWithMeModalDark.module.css";

// Outward-facing destinations — change these in one place.
const CALENDLY_URL = "https://calendly.com/ghulammujtaba/30min";
const RESUME_PDF = "/Resume.pdf";
const ROLE_EMAIL = "hello@ghulammujtaba.com";
const ROLE_MAILTO = `mailto:${ROLE_EMAIL}?subject=${encodeURIComponent(
  "Role opportunity for Ghulam Mujtaba",
)}&body=${encodeURIComponent(
  "Hi Ghulam,\n\nWe'd like to talk to you about a role. Here are the details:\n\n",
)}`;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const WorkWithMeModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const t = theme === "dark" ? dark : light;

  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const prevFocusRef = useRef(null);

  const [mounted, setMounted] = useState(false); // portal target ready (client only)
  const [render, setRender] = useState(false); // keep in DOM during exit animation
  const [animateIn, setAnimateIn] = useState(false); // drives the .open class

  useEffect(() => setMounted(true), []);

  // Open / close lifecycle: mount, animate in, lock scroll, trap focus.
  useEffect(() => {
    if (isOpen) {
      try {
        prevFocusRef.current = document.activeElement;
      } catch {}
      setRender(true);
      const raf = requestAnimationFrame(() => setAnimateIn(true));

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const onKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }
        if (e.key === "Tab") {
          const node = modalRef.current;
          if (!node) return;
          const items = Array.from(node.querySelectorAll(FOCUSABLE));
          if (items.length === 0) return;
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener("keydown", onKeyDown);

      const focusTimer = setTimeout(() => {
        const node = modalRef.current;
        node?.querySelector(FOCUSABLE)?.focus();
      }, 60);

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        clearTimeout(focusTimer);
        cancelAnimationFrame(raf);
        document.body.style.overflow = prevOverflow;
        // Restore focus to the trigger
        try {
          prevFocusRef.current?.focus?.();
        } catch {}
      };
    } else if (render) {
      // Animate out, then unmount
      setAnimateIn(false);
      const timer = setTimeout(() => setRender(false), 240);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, render]);

  const handleBookCall = () => {
    openCalendlyPopup(CALENDLY_URL);
    onClose();
  };

  if (!mounted || !render) return null;

  const cls = (name) => `${common[name]} ${t[name] || ""}`.trim();

  return createPortal(
    <div
      ref={overlayRef}
      className={`${cls("overlay")} ${animateIn ? common.open : ""}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`${cls("modal")} ${animateIn ? common.open : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wwm-title"
      >
        <button
          type="button"
          className={cls("closeButton")}
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>

        <div className={common.header}>
          <h2 id="wwm-title" className={cls("title")}>
            How would you like to work together?
          </h2>
          <p className={cls("subtitle")}>
            Pick the path that fits — I build products for clients and I&apos;m
            open to senior engineering roles.
          </p>
        </div>

        <div className={common.options}>
          {/* Option 1 — Start a Project (clients) */}
          <div className={cls("card")}>
            <div className={common.cardHead}>
              <span className={cls("cardIcon")} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </span>
              <div>
                <p className={cls("cardAudience")}>For clients &amp; startups</p>
                <h3 className={cls("cardTitle")}>Start a Project</h3>
              </div>
            </div>
            <p className={cls("cardText")}>
              Have an idea, product, or AI solution to build? Book a short call
              and let&apos;s discuss scope, timeline, and execution.
            </p>
            <div className={common.cardActions}>
              <button
                type="button"
                className={`${common.btn} ${common.btnPrimary}`}
                onClick={handleBookCall}
              >
                Book a Project Call
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Option 2 — Hire for a Role (recruiters) */}
          <div className={cls("card")}>
            <div className={common.cardHead}>
              <span className={cls("cardIcon")} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </span>
              <div>
                <p className={cls("cardAudience")}>For recruiters &amp; teams</p>
                <h3 className={cls("cardTitle")}>Hire for a Role</h3>
              </div>
            </div>
            <p className={cls("cardText")}>
              Looking for an AI, full-stack, or product-minded engineer? View my
              resume and get in touch for relevant roles.
            </p>
            <div className={common.cardActions}>
              <a
                className={`${common.btn} ${cls("btnGhost")}`}
                href={RESUME_PDF}
                download
                onClick={onClose}
              >
                Download Resume
              </a>
              <a
                className={`${common.btn} ${common.btnPrimary}`}
                href={ROLE_MAILTO}
                onClick={onClose}
              >
                Email About a Role
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default WorkWithMeModal;
