import { useEffect } from "react";

/**
 * Cursor-reactive hero depth (plan §2.1, "cheap version" — no 3D library).
 *
 * Attaches ONE rAF-throttled pointermove listener to the hero section and
 * writes normalized cursor coordinates (--hx/--hy, each -1..1) as CSS custom
 * properties on it. The hero's layers (welcome text, portrait, proof chips)
 * read those vars in their own CSS modules and drift on separate planes via
 * the independent `translate` property, so existing transforms are untouched.
 *
 * Desktop fine-pointer only; inert on touch, below 981px, and under
 * reduced motion. Renders nothing.
 */
const HeroDepth = ({ targetId = "home-section" }) => {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return undefined;

    let raf = 0;

    const onPointerMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (window.innerWidth <= 980) return;
      if (raf) return;
      const { clientX, clientY } = e;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const hx = ((clientX - rect.left) / rect.width - 0.5) * 2;
        const hy = ((clientY - rect.top) / rect.height - 0.5) * 2;
        el.style.setProperty("--hx", Math.max(-1, Math.min(1, hx)).toFixed(3));
        el.style.setProperty("--hy", Math.max(-1, Math.min(1, hy)).toFixed(3));
      });
    };

    const onPointerLeave = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      el.style.setProperty("--hx", "0");
      el.style.setProperty("--hy", "0");
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.removeProperty("--hx");
      el.style.removeProperty("--hy");
    };
  }, [targetId]);

  return null;
};

export default HeroDepth;
