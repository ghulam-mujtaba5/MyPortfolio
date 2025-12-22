// useViewTransition.js
// Hook to simplify View Transitions API usage for smooth page navigation

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/router';

/**
 * Custom hook to enable View Transitions API for smooth page navigation
 * @returns {Object} { isTransitioning, startTransition }
 */
export const useViewTransition = () => {
  const router = useRouter();
  const isTransitioningRef = useRef(false);

  const startTransition = useCallback(async (callback) => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      // Fallback for browsers that don't support View Transitions API
      if (callback) {
        await callback();
      }
      return;
    }

    isTransitioningRef.current = true;

    try {
      document.startViewTransition(async () => {
        if (callback) {
          await callback();
        }
      });
    } catch (error) {
      console.error('View Transition Error:', error);
      if (callback) {
        await callback();
      }
    } finally {
      isTransitioningRef.current = false;
    }
  }, []);

  return {
    isTransitioning: isTransitioningRef.current,
    startTransition,
  };
};

/**
 * Hook to handle view transitions on route changes
 * Usage: useViewTransitionOnRouteChange()
 */
export const useViewTransitionOnRouteChange = () => {
  const router = useRouter();
  const { startTransition } = useViewTransition();
  const pendingRouteRef = useRef(null);

  // Hook route changes to use view transitions
  const handleRouteChangeStart = useCallback((url) => {
    if (document.startViewTransition) {
      pendingRouteRef.current = url;
      // Transition will be handled by startViewTransition wrapper
    }
  }, []);

  const handleRouteChangeComplete = useCallback(() => {
    pendingRouteRef.current = null;
  }, []);

  // Attach listeners
  router.events.on('routeChangeStart', handleRouteChangeStart);
  router.events.on('routeChangeComplete', handleRouteChangeComplete);

  return () => {
    router.events.off('routeChangeStart', handleRouteChangeStart);
    router.events.off('routeChangeComplete', handleRouteChangeComplete);
  };
};

export default useViewTransition;
