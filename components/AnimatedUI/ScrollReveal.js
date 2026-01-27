import React from "react";
import { useScrollTrigger } from "../../hooks/useScrollAnimation";

/**
 * ScrollReveal component
 * Wraps content and animates it when it enters the viewport
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.animation - Animation class name (default: 'fadeInUp')
 * @param {string} props.className - Additional classes
 * @param {number} props.delay - Delay in ms
 * @param {number} props.threshold - Intersection threshold (0-1)
 * @param {string} props.width - Width of container (default: '100%')
 * @param {React.ElementType} props.as - Component to render as (default: 'div')
 */
const ScrollReveal = ({
  children,
  animation = "fadeInUp",
  className = "",
  delay = 0,
  threshold = 0.1,
  width = "100%",
  as: Component = "div",
  style: propStyle,
  ...props
}) => {
  const { ref, hasEntered } = useScrollTrigger({ threshold });

  // Use visibility instead of opacity to prevent layout shift
  // and ensure content is accessible even before animation
  const baseStyle = {
    width,
    // Start with content visible but ready for animation
    // This prevents content flash/flicker on initial load
    visibility: "visible",
    // Use transform for GPU acceleration
    willChange: hasEntered ? "auto" : "transform, opacity",
  };

  // Animation styles applied only after intersection
  const animatedStyle = hasEntered
    ? {
        animation: `${animation} var(--duration-normal, 0.3s) var(--ease-out, ease-out) both`,
        animationDelay: `${delay}ms`,
        opacity: 1,
      }
    : {
        // Pre-animation state - subtle opacity reduction instead of 0
        // This prevents the "flash" effect while still allowing animation
        opacity: 0.01,
        // Apply initial transform state for animation
        transform:
          animation === "fadeInUp"
            ? "translateY(24px)"
            : animation === "fadeInDown"
              ? "translateY(-24px)"
              : animation === "fadeInLeft"
                ? "translateX(-24px)"
                : animation === "fadeInRight"
                  ? "translateX(24px)"
                  : animation === "scaleIn" || animation === "scaleInCenter"
                    ? "scale(0.95)"
                    : "none",
        // Smooth transition when animation hasn't triggered yet
        transition: "opacity 0.1s ease-out",
      };

  const combinedStyle = {
    ...baseStyle,
    ...animatedStyle,
    ...propStyle,
  };

  // Only add animation class when animation should play
  const combinedClassName =
    `${className}${hasEntered ? ` ${animation}` : ""}`.trim();

  return (
    <Component
      ref={ref}
      className={combinedClassName || undefined}
      style={combinedStyle}
      {...props}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;
