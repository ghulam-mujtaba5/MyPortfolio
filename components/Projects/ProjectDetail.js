import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";
import baseStyles from "./ProjectDetailBaseCommon.module.css";
import lightStyles from "./ProjectDetail.light.module.css";
import darkStyles from "./ProjectDetail.dark.module.css";

const ProjectDetail = ({ project, relatedProjects = [] }) => {
  const { theme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply body background for dark mode
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    if (theme === "dark") {
      body.style.background = 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)';
      html.style.background = 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)';
      body.style.minHeight = '100vh';
      html.style.minHeight = '100vh';
    } else {
      body.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)';
      html.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)';
      body.style.minHeight = '100vh';
      html.style.minHeight = '100vh';
    }

    // Cleanup function
    return () => {
      body.style.background = '';
      html.style.background = '';
      body.style.minHeight = '';
      html.style.minHeight = '';
    };
  }, [theme]);

  if (!project) {
    return (
      <div className={`${baseStyles.container} ${theme === "dark" ? darkStyles.container : lightStyles.container}`}>
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          color: theme === "dark" ? "#e5e7eb" : "#374151"
        }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Project Not Found</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>
            The project you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const { title, description, image, showImage, tags, category, links } = project;

  // Combine styles based on theme
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const styles = { ...baseStyles, ...themeStyles };

  // Detect if this is a mobile app project
  const isMobileApp = category?.toLowerCase().includes('mobile') || 
                     tags?.some(tag => tag.toLowerCase().includes('mobile')) ||
                     tags?.some(tag => tag.toLowerCase().includes('app')) ||
                     title?.toLowerCase().includes('mobile') ||
                     title?.toLowerCase().includes('app');

  return (
    <div className={`${baseStyles.container} ${themeStyles.container || ""} ${theme === "dark" ? baseStyles.dark : baseStyles.light}`}>
      {/* Scroll Progress Indicator */}
      <div 
        className={`${baseStyles.scrollProgress} ${themeStyles.scrollProgress || ""}`}
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={scrollProgress}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Reading progress"
      />

      {/* Breadcrumb Navigation */}
      <nav className={`${baseStyles.breadcrumb} ${themeStyles.breadcrumb || ""}`} aria-label="Breadcrumb">
        <Link href="/portfolio" className={baseStyles.breadcrumbLink}>
          Portfolio
        </Link>
        <span className={baseStyles.breadcrumbSeparator} aria-hidden="true">›</span>
        <Link href="/projects" className={baseStyles.breadcrumbLink}>
          Projects
        </Link>
        <span className={baseStyles.breadcrumbSeparator} aria-hidden="true">›</span>
        <span className={baseStyles.breadcrumbCurrent} aria-current="page">
          {title}
        </span>
      </nav>

      {/* ...existing code... */}

      {/* Project Title */}
      <h1 className={`${baseStyles.title} ${themeStyles.title || ""}`}>
        {title}
        <div className={`${baseStyles.titleUnderline} ${themeStyles.titleUnderline || ""}`} />
      </h1>

      {/* Project Image */}
      {showImage && image && (
        <div className={`${baseStyles.imageContainer} ${themeStyles.imageContainer || ""} ${isMobileApp ? baseStyles.mobileApp : ""}`}>
          {(() => {
            const img = String(image || "").trim();
            const isExternal = /^https?:\/\//i.test(img) || /^\/\//.test(img) || /^data:image\//i.test(img) || /^blob:/.test(img);
            const src = isExternal ? img : (img.startsWith("/") ? img : `/${img}`);
            const fit = project?.imageFit || "cover";
            return (
              <Image
                src={src}
                alt={`${title} preview`}
                fill
                sizes={isMobileApp 
                  ? "(max-width: 768px) 300px, 400px" 
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 700px, 700px"
                }
                style={{ 
                  objectFit: fit
                }}
                priority
                placeholder="blur"
                unoptimized={isExternal}
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7XTvhRakHcMm3+hPM4cBDBj5SJ2H+pD7bFaRKTXuMhNB1O8Dq3wA8QRnKLi5TlwT5WbUZrJeCPmvdVuKldJVEHPMCgw4wnTrA7cY1x5Vt7U2kJQqGDVGnGv4u5h7PF5vhT46wJwNBJLQCuNq8AV/9k="
              />
            );
          })()}
        </div>
      )}

      {/* Meta Information */}
      <div className={`${baseStyles.meta} ${themeStyles.meta || ""}`}>
        {category && (
          <span 
            className={`${baseStyles.category} ${themeStyles.category || ""}`}
            role="badge"
            aria-label={`Category: ${category}`}
          >
            {category}
          </span>
        )}
        
        {Array.isArray(tags) && tags.length > 0 && (
          <div 
            className={`${baseStyles.tags} ${themeStyles.tags || ""}`}
            role="list"
            aria-label="Project technologies"
          >
            {tags.map((tag, index) => (
              <span 
                key={`${tag}-${index}`} 
                className={`${baseStyles.tag} ${themeStyles.tag || ""}`}
                role="listitem"
                tabIndex="0"
                aria-label={`Technology: ${tag}`}
              >
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Share Button - ONLY inline beside tags */}
        <div className={baseStyles.shareButtonInline}>
          <button
            className={baseStyles.shareButtonMeta}
            aria-label="Share this project"
            title="Share"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: title,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="18" cy="5" r="3" fill="currentColor"/>
              <circle cx="6" cy="12" r="3" fill="currentColor"/>
              <circle cx="18" cy="19" r="3" fill="currentColor"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Project Description */}
      {description && (
        <div 
          ref={contentRef}
          className={`${baseStyles.description} ${themeStyles.description || ""}`}
          dangerouslySetInnerHTML={{ __html: description }}
          role="article"
          aria-label="Project description"
        />
      )}


      {/* Action Links */}
      {(links?.live || links?.github) && (
        <div 
          className={`${baseStyles.links} ${themeStyles.links || ""}`}
          role="group"
          aria-label="Project links"
        >
          {links?.live && (
            <a
              href={links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseStyles.link} ${baseStyles.primaryLink} ${themeStyles.link || ""}`}
              aria-label={`View live demo of ${title} (opens in new tab)`}
            >
              <span className={baseStyles.linkIcon}>🚀</span>
              <span>Live Preview</span>
              <span className={baseStyles.linkArrow}>→</span>
            </a>
          )}
          {links?.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseStyles.link} ${baseStyles.secondaryLink} ${themeStyles.link || ""}`}
              aria-label={`View source code of ${title} on GitHub (opens in new tab)`}
            >
              <span className={baseStyles.linkIcon}>📂</span>
              <span>Source Code</span>
              <span className={baseStyles.linkArrow}>→</span>
            </a>
          )}
        </div>
      )}


      {/* Back to Projects */}
      <div className={`${baseStyles.backToProjects} ${themeStyles.backToProjects || ""}`}>
        <Link 
          href="/projects" 
          className={`${baseStyles.backLink} ${themeStyles.backLink || ""}`}
        >
          ← Back to All Projects
        </Link>
      </div>
    </div>
  );
};

export default ProjectDetail;
