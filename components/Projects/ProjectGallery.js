import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import styles from "./ProjectGallery.module.css";

const ProjectGallery = ({ 
  mainImage, 
  gallery = [], 
  title = "Project",
  imageFit = "contain",
  isMobileApp = false 
}) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const lightboxRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Combine main image with gallery images
  const allImages = React.useMemo(() => {
    const images = [];
    
    // Add main image first if it exists
    if (mainImage) {
      images.push({
        url: mainImage,
        caption: `${title} - Main Preview`,
        alt: `${title} main preview`,
        order: -1
      });
    }
    
    // Add gallery images sorted by order
    if (gallery && gallery.length > 0) {
      const sortedGallery = [...gallery].sort((a, b) => (a.order || 0) - (b.order || 0));
      images.push(...sortedGallery);
    }
    
    return images;
  }, [mainImage, gallery, title]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          closeLightbox();
          break;
        case "+":
        case "=":
          setZoomLevel(prev => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
          break;
        case "0":
          setZoomLevel(1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, currentIndex, allImages.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && allImages.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % allImages.length);
      }, 4000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, allImages.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToNext = useCallback(() => {
    if (allImages.length <= 1) return;
    setIsLoading(true);
    setCurrentIndex(prev => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goToPrevious = useCallback(() => {
    if (allImages.length <= 1) return;
    setIsLoading(true);
    setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const goToSlide = (index) => {
    if (index === currentIndex) return;
    setIsLoading(true);
    setCurrentIndex(index);
  };

  const openLightbox = (index = currentIndex) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    setZoomLevel(1);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setIsAutoPlaying(false);
    setZoomLevel(1);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(prev => !prev);
  };

  // Get image source with proper handling
  const getImageSrc = (img) => {
    const src = String(img?.url || "").trim();
    const isExternal = /^https?:\/\//i.test(src) || /^\/\//.test(src) || /^data:image\//i.test(src) || /^blob:/.test(src);
    return isExternal ? src : (src.startsWith("/") ? src : `/${src}`);
  };

  const isExternalImage = (img) => {
    const src = String(img?.url || "").trim();
    return /^https?:\/\//i.test(src) || /^\/\//.test(src) || /^data:image\//i.test(src) || /^blob:/.test(src);
  };

  // If no images, don't render
  if (allImages.length === 0) {
    return null;
  }

  const currentImage = allImages[currentIndex];
  const hasMultipleImages = allImages.length > 1;

  return (
    <div className={`${styles.galleryWrapper} ${theme === "dark" ? styles.dark : styles.light}`}>
      {/* Main Gallery Display */}
      <div 
        className={`${styles.mainDisplay} ${isMobileApp ? styles.mobileApp : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image Counter Badge */}
        {hasMultipleImages && (
          <div className={styles.counterBadge}>
            <span className={styles.currentNum}>{currentIndex + 1}</span>
            <span className={styles.separator}>/</span>
            <span className={styles.totalNum}>{allImages.length}</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={goToNext}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Main Image */}
        <div 
          className={styles.imageWrapper}
          onClick={() => openLightbox()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox()}
          aria-label="Click to open fullscreen gallery"
        >
          <div className={`${styles.imageLoader} ${isLoading ? styles.loading : ""}`}>
            <div className={styles.spinner} />
          </div>
          <Image
            src={getImageSrc(currentImage)}
            alt={currentImage?.alt || `${title} - Image ${currentIndex + 1}`}
            width={isMobileApp ? 400 : 900}
            height={isMobileApp ? 700 : 500}
            className={`${styles.mainImage} ${isLoading ? styles.hidden : ""}`}
            style={{ objectFit: imageFit }}
            priority={currentIndex === 0}
            unoptimized={isExternalImage(currentImage)}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7XTvhRakHcMm3+hPM4cBDBj5SJ2H+pD7bFaRKTXuMhNB1O8Dq3wA8QRnKLi5TlwT5WbUZrJeCPmvdVuKldJVEHPMCgw4wnTrA7cY1x5Vt7U2kJQqGDVGnGv4u5h7PF5vhT46wJwNBJLQCuNq8AV/9k="
          />
          
          {/* Zoom indicator on hover */}
          <div className={styles.zoomIndicator}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>Click to expand</span>
          </div>
        </div>

        {/* Caption */}
        {currentImage?.caption && (
          <div className={styles.caption}>
            <p>{currentImage.caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultipleImages && (
        <div className={styles.thumbnailContainer}>
          <div className={styles.thumbnailStrip}>
            {allImages.map((img, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ""}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              >
                <Image
                  src={getImageSrc(img)}
                  alt={img?.alt || `Thumbnail ${index + 1}`}
                  width={80}
                  height={60}
                  className={styles.thumbImage}
                  style={{ objectFit: "cover" }}
                  unoptimized={isExternalImage(img)}
                />
                <div className={styles.thumbOverlay} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dot Indicators (Mobile) */}
      {hasMultipleImages && (
        <div className={styles.dotIndicators}>
          {allImages.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className={styles.lightbox}
          ref={lightboxRef}
          onClick={(e) => e.target === lightboxRef.current && closeLightbox()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Lightbox Header */}
          <div className={styles.lightboxHeader}>
            <div className={styles.lightboxTitle}>
              <h3>{title}</h3>
              {hasMultipleImages && (
                <span className={styles.lightboxCounter}>
                  {currentIndex + 1} / {allImages.length}
                </span>
              )}
            </div>
            
            <div className={styles.lightboxControls}>
              {/* Zoom Controls */}
              <div className={styles.zoomControls}>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                  aria-label="Zoom out"
                  disabled={zoomLevel <= 0.5}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                  aria-label="Zoom in"
                  disabled={zoomLevel >= 3}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  aria-label="Reset zoom"
                  className={styles.resetZoom}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
              </div>

              {/* Auto-play Toggle */}
              {hasMultipleImages && (
                <button
                  className={`${styles.autoPlayBtn} ${isAutoPlaying ? styles.playing : ""}`}
                  onClick={toggleAutoPlay}
                  aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
                >
                  {isAutoPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
              )}

              {/* Close Button */}
              <button
                className={styles.closeBtn}
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Lightbox Navigation */}
          {hasMultipleImages && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={goToPrevious}
                aria-label="Previous image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={goToNext}
                aria-label="Next image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Lightbox Image */}
          <div className={styles.lightboxImageContainer}>
            <div 
              className={styles.lightboxImageWrapper}
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <Image
                src={getImageSrc(currentImage)}
                alt={currentImage?.alt || `${title} - Image ${currentIndex + 1}`}
                width={1200}
                height={800}
                className={styles.lightboxImage}
                style={{ objectFit: "contain" }}
                unoptimized={isExternalImage(currentImage)}
                priority
              />
            </div>
          </div>

          {/* Lightbox Caption */}
          {currentImage?.caption && (
            <div className={styles.lightboxCaption}>
              <p>{currentImage.caption}</p>
            </div>
          )}

          {/* Lightbox Thumbnails */}
          {hasMultipleImages && (
            <div className={styles.lightboxThumbnails}>
              {allImages.map((img, index) => (
                <button
                  key={index}
                  className={`${styles.lightboxThumb} ${index === currentIndex ? styles.activeThumb : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={getImageSrc(img)}
                    alt={img?.alt || `Thumbnail ${index + 1}`}
                    width={60}
                    height={45}
                    style={{ objectFit: "cover" }}
                    unoptimized={isExternalImage(img)}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard Shortcuts Help */}
          <div className={styles.keyboardHelp}>
            <span>←→ Navigate</span>
            <span>+/- Zoom</span>
            <span>0 Reset</span>
            <span>ESC Close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
