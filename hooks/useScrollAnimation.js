// useScrollAnimation.js
// Custom hooks for scroll-driven animations and scroll triggers

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

/**
 * Hook to trigger animations when element enters viewport
 * Uses Intersection Observer API for performance
 * @param {Object} options - Intersection Observer options
 * @returns {Object} { ref, isVisible, hasEntered }
 */
export const useScrollTrigger = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  // Memoize options to prevent infinite re-renders
  const threshold = options.threshold ?? 0.1;
  const rootMargin = options.rootMargin ?? "0px 0px -50px 0px";

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasEntered(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { ref, isVisible, hasEntered };
};

/**
 * Hook for scroll-driven animations using ScrollTimeline API
 * Provides animation properties that sync with scroll position
 * @param {Object} config - Animation configuration
 * @returns {Object} Animation properties and state
 */
export const useScrollAnimation = (config = {}) => {
  const ref = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [animationState, setAnimationState] = useState({
    opacity: 1,
    transform: "translateY(0)",
    scale: 1,
  });

  const {
    type = "fade", // 'fade', 'slide', 'scale', 'rotate'
    direction = "up", // 'up', 'down', 'left', 'right'
  } = config;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let rafId = null;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;

        // Calculate scroll progress (0 to 1)
        let progress = 0;
        if (elementTop < windowHeight) {
          progress = Math.min(
            1,
            (windowHeight - elementTop) / (windowHeight + rect.height),
          );
        }

        setScrollProgress(progress);

        // Calculate animation based on type
        let newState = { opacity: 1, transform: "translateY(0)", scale: 1 };

        if (type === "fade") {
          newState.opacity = progress;
        } else if (type === "slide") {
          const offset = (1 - progress) * 30;
          if (direction === "up") {
            newState.transform = `translateY(${offset}px)`;
          } else if (direction === "down") {
            newState.transform = `translateY(-${offset}px)`;
          } else if (direction === "left") {
            newState.transform = `translateX(${offset}px)`;
          } else if (direction === "right") {
            newState.transform = `translateX(-${offset}px)`;
          }
          newState.opacity = progress;
        } else if (type === "scale") {
          newState.scale = 0.95 + progress * 0.05;
          newState.opacity = progress;
        } else if (type === "rotate") {
          const rotation = (1 - progress) * -12;
          newState.transform = `rotate(${rotation}deg) scale(${0.95 + progress * 0.05})`;
          newState.opacity = progress;
        }

        setAnimationState(newState);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [type, direction]);

  return {
    ref,
    scrollProgress,
    animationState,
    style: {
      opacity: animationState.opacity,
      transform: animationState.transform,
      transition: "all 0.05s ease-out", // Smooth transitions between scroll events
    },
  };
};

/**
 * Hook for parallax scrolling effect
 * @param {number} speed - Parallax speed multiplier (0.5 to 1.5)
 * @returns {Object} { ref, style }
 */
export const useParallax = (speed = 0.5) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let rafId = null;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const elementTop = element.offsetTop;

        // Calculate parallax offset
        const distance = scrollTop - (elementTop - window.innerHeight / 2);
        setOffset(distance * speed * 0.1);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [speed]);

  return {
    ref,
    style: {
      transform: `translateY(${offset}px)`,
    },
  };
};

/**
 * Hook to detect when user is near bottom of page
 * Useful for infinite scroll or load more triggers
 * @param {number} threshold - Distance from bottom in pixels
 * @returns {Object} { ref, isNearBottom }
 */
export const useNearBottom = (threshold = 500) => {
  const ref = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    let rafId = null;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        const distanceToBottom = documentHeight - (scrollTop + windowHeight);
        setIsNearBottom(distanceToBottom < threshold);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [threshold]);

  return { ref, isNearBottom };
};

/**
 * Hook for staggered animations on multiple elements
 * @param {number} delayMs - Delay between each element animation in milliseconds
 * @returns {Function} Function to get delay class for nth child
 */
export const useStaggerAnimation = (delayMs = 100) => {
  const getDelayClass = useCallback(
    (index) => {
      return {
        animation: "fadeInUp",
        animationDelay: `${index * delayMs}ms`,
        animationFillMode: "both",
        animationDuration: "0.6s",
      };
    },
    [delayMs],
  );

  return getDelayClass;
};

/**
 * Hook to handle smooth scrolling to elements
 * @returns {Object} { scrollToElement }
 */
export const useSmoothScroll = () => {
  const scrollToElement = useCallback((elementId, options = {}) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const behavior = options.behavior || "smooth";
    const block = options.block || "start";
    const inline = options.inline || "nearest";

    element.scrollIntoView({
      behavior,
      block,
      inline,
    });
  }, []);

  return { scrollToElement };
};

/**
 * Hook to detect scroll direction (up or down)
 * @returns {Object} { scrollDirection }
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState("up");
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    // Initialize with current scroll position
    lastScrollYRef.current = window.scrollY;

    let rafId = null;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const lastScrollY = lastScrollYRef.current;

        if (currentScrollY > lastScrollY + 5) {
          setScrollDirection("down");
        } else if (currentScrollY < lastScrollY - 5) {
          setScrollDirection("up");
        }

        lastScrollYRef.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return { scrollDirection };
};

export default useScrollTrigger;
