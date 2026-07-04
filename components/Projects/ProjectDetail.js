import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggleIcon from "../Icon/gmicon";
import ProjectGallery from "./ProjectGallery";
import baseStyles from "./ProjectDetailBaseCommon.module.css";
import lightStyles from "./ProjectDetail.light.module.css";
import darkStyles from "./ProjectDetail.dark.module.css";
import caseStyles from "./CaseFacts.module.css";

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

  // Body background styles are managed by the parent page template to prevent style leaks during page transitions

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
            The project you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    image,
    showImage,
    showGallery,
    gallery,
    tags,
    category,
    links,
    role,
    problem,
    solution,
    outcome,
    status,
  } = project;

  // Case-study facts — render only what actually exists (plan §5.3)
  const caseFacts = [
    { key: "Role", value: role },
    { key: "Problem", value: problem },
    { key: "Built", value: solution },
    { key: "Outcome", value: outcome, outcome: true },
  ].filter((f) => typeof f.value === "string" && f.value.trim());
  const inProgress = status === "In Progress";

  // Combine styles based on theme
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const styles = { ...baseStyles, ...themeStyles };

  // Detect if this is a mobile app project
  const isMobileApp = category?.toLowerCase().includes('mobile') || 
                     tags?.some(tag => tag.toLowerCase().includes('mobile')) ||
                     tags?.some(tag => tag.toLowerCase().includes('app')) ||
                     title?.toLowerCase().includes('mobile') ||
                     title?.toLowerCase().includes('app');

  // Determine if we should show gallery (has gallery images) or single image
  const hasGalleryImages = gallery && gallery.length > 0;
  const shouldShowGallery = showGallery !== false && (hasGalleryImages || (showImage && image));

  return (
    <div className={`${baseStyles.container} ${themeStyles.container || ""} ${theme === "dark" ? baseStyles.dark : baseStyles.light}`}>
      {/* GM Icon */}
      <div className={`${baseStyles.gmIcon} ${themeStyles.gmIcon || ""} ${theme === "light" ? "light" : "dark"}`}>
        <ThemeToggleIcon />
      </div>

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
        <Link href="/" className={baseStyles.breadcrumbLink}>
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

      {/* Case-study eyebrow + build status */}
      <div className={caseStyles.eyebrowRow}>
        <span className={caseStyles.eyebrow}>
          Case study{category ? ` · ${category}` : ""}
        </span>
        {inProgress && <span className={caseStyles.statusChip}>In build</span>}
      </div>

      {/* Project Title */}
      <h1 className={`${baseStyles.title} ${themeStyles.title || ""}`}>
        {title}
        <div className={`${baseStyles.titleUnderline} ${themeStyles.titleUnderline || ""}`} />
      </h1>

      {/* Project Gallery/Image Showcase */}
      {shouldShowGallery && (
        <ProjectGallery
          mainImage={showImage ? image : null}
          gallery={hasGalleryImages ? gallery : []}
          title={title}
          imageFit={project?.imageFit || "contain"}
          isMobileApp={isMobileApp}
        />
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

      {/* Case-study facts — Role / Problem / Built / Outcome */}
      {caseFacts.length > 0 && (
        <dl className={caseStyles.facts} aria-label="Case study summary">
          {caseFacts.map((f) => (
            <div
              key={f.key}
              className={`${caseStyles.factRow} ${f.outcome ? caseStyles.factOutcome : ""}`}
            >
              <dt className={caseStyles.factKey}>{f.key}</dt>
              <dd>
                <span>{f.value}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={baseStyles.linkIcon} aria-hidden="true" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'text-bottom' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={baseStyles.linkIcon} aria-hidden="true" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'text-bottom' }}>
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
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
