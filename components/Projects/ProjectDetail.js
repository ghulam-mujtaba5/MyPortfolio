import React, { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggleIcon from "../Icon/gmicon";
import ProjectGallery from "./ProjectGallery";
import styles from "./CaseStudy.module.css";

/**
 * Project detail — case-study template.
 * Brand system: mono eyebrows, ink-navy display type, browser-chrome frame,
 * Role/Problem/Built/Outcome facts, one orange conversion moment at the end.
 * Single CSS module (CaseStudy.module.css), themed via [data-theme].
 */

// Host shown in the browser-chrome bar (falls back to the canonical page URL)
const displayUrl = (project) => {
  const live = String(project?.links?.live || "").trim();
  if (live && live !== "#") {
    try {
      return new URL(live).host.replace(/^www\./, "");
    } catch {
      /* fall through */
    }
  }
  return project?.slug ? `ghulammujtaba.com/projects/${project.slug}` : "";
};

const ProjectDetail = ({ project }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!project) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Project not found</h1>
        <p className={styles.notFoundText}>
          The project you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/projects" className={`${styles.btn} ${styles.btnGhost}`}>
          Browse all projects
        </Link>
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
    problem,
    solution,
    outcome,
    status,
  } = project;

  // Case-study facts — render only what actually exists (plan §5.3)
  const caseFacts = [
    { key: "Problem", value: problem },
    { key: "Built", value: solution },
    { key: "Outcome", value: outcome, outcome: true },
  ].filter((f) => typeof f.value === "string" && f.value.trim());
  const inProgress = status === "In Progress";

  const live = String(links?.live || "").trim();
  const github = String(links?.github || "").trim();
  const hasLive = live && live !== "#";
  const hasGithub = github && github !== "#";

  const isMobileApp =
    category?.toLowerCase().includes("mobile") ||
    tags?.some((tag) => tag.toLowerCase().includes("mobile")) ||
    tags?.some((tag) => tag.toLowerCase().includes("app")) ||
    title?.toLowerCase().includes("mobile") ||
    title?.toLowerCase().includes("app");

  const hasGalleryImages = gallery && gallery.length > 0;
  const shouldShowGallery =
    showGallery !== false && (hasGalleryImages || (showImage && image));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className={styles.page}>
      {/* Theme toggle GM icon */}
      <div className={styles.gmIcon}>
        <ThemeToggleIcon />
      </div>

      {/* Reading progress */}
      <div
        className={styles.scrollProgress}
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Reading progress"
      />

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          Portfolio
        </Link>
        <span className={styles.breadcrumbSeparator} aria-hidden="true">
          ›
        </span>
        <Link href="/projects" className={styles.breadcrumbLink}>
          Projects
        </Link>
        <span className={styles.breadcrumbSeparator} aria-hidden="true">
          ›
        </span>
        <span className={styles.breadcrumbCurrent} aria-current="page">
          {title}
        </span>
      </nav>

      {/* ── Case header ── */}
      <header className={styles.header}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrow}>
            Case study{category ? ` · ${category}` : ""}
          </span>
          {inProgress && <span className={styles.statusChip}>In build</span>}
        </div>

        <h1 className={styles.title}>{title}</h1>

        {Array.isArray(tags) && tags.length > 0 && (
          <div className={styles.pills} role="list" aria-label="Built with">
            {tags.map((tag, index) => (
              <span key={`${tag}-${index}`} className={styles.pill} role="listitem">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {hasLive && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnPrimary}`}
              aria-label={`Open live site of ${title} (opens in new tab)`}
            >
              <svg
                className={styles.btnIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Live Preview
            </a>
          )}
          {hasGithub && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnGhost}`}
              aria-label={`View source code of ${title} on GitHub (opens in new tab)`}
            >
              <svg
                className={styles.btnIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              Source Code
            </a>
          )}
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={handleShare}
            aria-label="Share this case study"
          >
            <svg
              className={styles.btnIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line
                x1="8.59"
                y1="13.51"
                x2="15.42"
                y2="17.49"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="15.41"
                y1="6.51"
                x2="8.59"
                y2="10.49"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Share
          </button>
        </div>
      </header>

      {/* ── Screenshot(s) in browser-chrome frame ── */}
      {shouldShowGallery && (
        <figure className={styles.frame}>
          <div className={styles.chromeBar} aria-hidden="true">
            <span className={styles.chromeDots}>
              <span />
              <span />
              <span />
            </span>
            <span className={styles.chromeUrl}>{displayUrl(project)}</span>
          </div>
          <div className={styles.frameBody}>
            <ProjectGallery
              mainImage={showImage ? image : null}
              gallery={hasGalleryImages ? gallery : []}
              title={title}
              imageFit={project?.imageFit || "contain"}
              isMobileApp={isMobileApp}
            />
          </div>
        </figure>
      )}

      {/* ── Case facts ── */}
      {caseFacts.length > 0 && (
        <dl className={styles.facts} aria-label="Case study summary">
          {caseFacts.map((f) => (
            <div
              key={f.key}
              className={`${styles.fact} ${f.outcome ? styles.factOutcome : ""}`}
            >
              <dt className={styles.factKey}>{f.key}</dt>
              <dd className={styles.factValue}>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* ── Overview ── */}
      {description && (
        <section className={styles.overview} aria-labelledby="overview-heading">
          <p className={styles.sectionEyebrow} id="overview-heading">
            Overview
          </p>
          <div
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </section>
      )}

      {/* ── Conversion band ── */}
      <section className={styles.ctaBand} aria-labelledby="cta-heading">
        <h2 className={styles.ctaTitle} id="cta-heading">
          Want something like this built?
        </h2>
        <p className={styles.ctaDesc}>
          I take on serious projects through Megicode — from scope to shipped
          product. Or browse the rest of the proof first.
        </p>
        <div className={styles.ctaActions}>
          <Link href="/contact" className={`${styles.btn} ${styles.btnCta}`}>
            Start a Project
          </Link>
          <Link href="/projects" className={`${styles.btn} ${styles.btnGhost}`}>
            View all projects
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetail;
