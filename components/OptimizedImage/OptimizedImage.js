import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

/**
 * OptimizedImage — A resilient wrapper around next/image that:
 * - Shows a gradient placeholder while loading
 * - Retries up to `maxRetries` times on error with exponential back-off
 * - Falls back to a visually-clean SVG placeholder when all retries fail
 * - Handles external/internal/data/blob URLs automatically
 * - Never breaks the page layout (always renders *something*)
 */

const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect fill='%23e2e8f0' width='400' height='250'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,sans-serif' font-size='14' fill='%2394a3b8'%3EImage unavailable%3C/text%3E%3C/svg%3E";

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7XTvhRakHcMm3+hPM4cBDBj5SJ2H+pD7bFaRKTXuMhNB1O8Dq3wA8QRnKLi5TlwT5WbUZrJeCPmvdVuKldJVEHPMCgw4wnTrA7cY1x5Vt7U2kJQqGDVGnGv4u5h7PF5vhT46wJwNBJLQCuNq8AV/9k=";

/**
 * Resolves a raw image source string to a usable src for next/image.
 * @param {string} raw
 * @returns {{ src: string, isExternal: boolean }}
 */
export function resolveImageSrc(raw) {
  const s = String(raw || "").trim();
  if (!s) return { src: PLACEHOLDER_SVG, isExternal: false };

  const isExternal =
    /^https?:\/\//i.test(s) ||
    /^\/\//.test(s) ||
    /^data:image\//i.test(s) ||
    /^blob:/.test(s);

  const src = isExternal ? s : s.startsWith("/") ? s : `/${s}`;
  return { src, isExternal };
}

const OptimizedImage = ({
  src: rawSrc,
  alt = "Image",
  width = 400,
  height = 250,
  className = "",
  style = {},
  priority = false,
  sizes,
  fill = false,
  quality = 75,
  maxRetries = 2,
  onLoad: externalOnLoad,
  onError: externalOnError,
  ...rest
}) => {
  const { src: resolvedSrc, isExternal } = resolveImageSrc(rawSrc);

  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasErrored, setHasErrored] = useState(false);
  const retriesRef = useRef(0);
  const timerRef = useRef(null);

  // Sync when rawSrc prop changes
  useEffect(() => {
    const { src: newSrc } = resolveImageSrc(rawSrc);
    setCurrentSrc(newSrc);
    setHasErrored(false);
    setIsLoading(true);
    retriesRef.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [rawSrc]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleLoad = useCallback(
    (e) => {
      setIsLoading(false);
      setHasErrored(false);
      externalOnLoad?.(e);
    },
    [externalOnLoad],
  );

  const handleError = useCallback(
    (e) => {
      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        // Exponential back-off: 1s, 2s, 4s …
        const delay = Math.pow(2, retriesRef.current - 1) * 1000;
        timerRef.current = setTimeout(() => {
          // Bust cache by appending a retry param (external only)
          const separator = resolvedSrc.includes("?") ? "&" : "?";
          const bustSrc = isExternal
            ? `${resolvedSrc}${separator}_retry=${retriesRef.current}`
            : resolvedSrc;
          setCurrentSrc(bustSrc);
          setIsLoading(true);
        }, delay);
      } else {
        // All retries exhausted — show placeholder
        setCurrentSrc(PLACEHOLDER_SVG);
        setIsLoading(false);
        setHasErrored(true);
        externalOnError?.(e);
      }
    },
    [maxRetries, resolvedSrc, isExternal, externalOnError],
  );

  // If src was empty from the start, render placeholder immediately
  if (!rawSrc || !String(rawSrc).trim()) {
    return (
      <div
        className={className}
        style={{
          width: fill ? "100%" : width,
          height: fill ? "100%" : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
          borderRadius: 8,
          color: "#94a3b8",
          fontSize: 13,
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        Image unavailable
      </div>
    );
  }

  // Is the *current* src external? (retries may have modified it)
  const currentIsExternal =
    /^https?:\/\//i.test(currentSrc) ||
    /^\/\//.test(currentSrc) ||
    /^data:image\//i.test(currentSrc) ||
    /^blob:/.test(currentSrc);

  return (
    <div style={{ position: "relative", display: "inline-block", ...(!fill ? { width, height } : {}) }}>
      {/* Loading shimmer overlay */}
      {isLoading && !hasErrored && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)",
            backgroundSize: "200% 200%",
            animation: "shimmer 1.5s ease-in-out infinite",
            borderRadius: 8,
          }}
          aria-hidden="true"
        />
      )}
      <Image
        src={currentSrc}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        className={className}
        style={{
          opacity: isLoading && !hasErrored ? 0 : 1,
          transition: "opacity 0.3s ease",
          ...style,
        }}
        quality={quality}
        priority={priority}
        sizes={sizes}
        loading={priority ? undefined : "lazy"}
        unoptimized={currentIsExternal}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
      {/* Inline shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(OptimizedImage);
