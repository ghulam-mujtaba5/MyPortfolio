import React, { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./CaseCard.module.css";

/**
 * Case-study project card.
 * Projects are presented as proof of capability, not a portfolio grid:
 * browser-chrome framed screenshot, mono eyebrow, role/outcome proof rows,
 * stack pills, and a "View case study" action.
 *
 * Theme-aware via [data-theme] overrides inside CaseCard.module.css —
 * no separate light/dark module files needed.
 */

// Derive a display URL for the browser-chrome bar
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

const resolveImage = (project) => {
  const img = String(project?.image || "").trim();
  if (!img || project?.showImage === false) return null;
  const isExternal =
    /^https?:\/\//i.test(img) ||
    /^\/\//.test(img) ||
    /^data:image\//i.test(img) ||
    /^blob:/.test(img);
  const isLocalMedia = /^\/api\/media\//i.test(img);
  return {
    src: isExternal ? img : img.startsWith("/") ? img : `/${img}`,
    unoptimized: isExternal || isLocalMedia,
    fit: project?.imageFit || "cover",
  };
};

const ProjectCard = React.memo(({ project, featured = false }) => {
  const router = useRouter();

  const handleCardClick = useCallback(
    (e) => {
      // Don't hijack clicks on real links inside the card
      if (e.target.closest("a")) return;
      if (project?.slug) router.push(`/projects/${project.slug}`);
    },
    [project?.slug, router],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick(e);
      }
    },
    [handleCardClick],
  );

  const titleId = `project-title-${(project?.title || "untitled")
    .replace(/\s+/g, "-")
    .toLowerCase()}`;

  const image = resolveImage(project);
  const live = String(project?.links?.live || "").trim();
  const github = String(project?.links?.github || "").trim();
  const hasLive = live && live !== "#";
  const hasGithub = github && github !== "#";
  const category =
    project?.category && project.category !== "Others"
      ? project.category
      : null;
  const inProgress = project?.status === "In Progress";

  return (
    <article
      className={`${styles.card} ${featured ? styles.cardFeatured : ""}`}
      aria-labelledby={titleId}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      {/* Browser chrome — reads as a real, shipped product */}
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.chromeDots}>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.chromeUrl}>{displayUrl(project)}</span>
      </div>

      {image && (
        <div className={styles.shot}>
          <Image
            className={styles.shotImg}
            alt={`${project.title || "Project"} screenshot`}
            src={image.src}
            width={640}
            height={400}
            loading="lazy"
            unoptimized={image.unoptimized}
            style={{ objectFit: image.fit }}
          />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrow}>
            Case study{category ? ` · ${category}` : ""}
          </span>
          {inProgress && <span className={styles.statusChip}>In build</span>}
        </div>

        <h3 className={styles.title} id={titleId}>
          <Link
            href={`/projects/${project.slug}`}
            onClick={(e) => e.stopPropagation()}
            className={styles.titleLink}
          >
            {project.title || "Untitled"}
          </Link>
        </h3>

        <div
          className={styles.desc}
          // Rich text HTML from the admin editor
          dangerouslySetInnerHTML={{ __html: project?.description || "" }}
        />

        {(project?.role || project?.outcome) && (
          <div className={styles.proofRows}>
            {project?.role && (
              <div className={styles.proofRow}>
                <span className={styles.proofKey}>Role</span>
                <span>{project.role}</span>
              </div>
            )}
            {project?.outcome && (
              <div className={`${styles.proofRow} ${styles.proofOutcome}`}>
                <span className={styles.proofKey}>Outcome</span>
                <span>{project.outcome}</span>
              </div>
            )}
          </div>
        )}

        {Array.isArray(project?.tags) && project.tags.length > 0 && (
          <div className={styles.pills}>
            {project.tags.slice(0, 4).map((tag) => (
              <span key={tag} className={styles.pill}>
                {tag}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span className={`${styles.pill} ${styles.pillMore}`}>
                +{project.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Link
          href={`/projects/${project.slug}`}
          className={styles.caseLink}
          onClick={(e) => e.stopPropagation()}
          aria-label={`View case study of ${project.title}`}
        >
          View case study
          <span className={styles.caseArrow} aria-hidden="true">
            →
          </span>
        </Link>
        <div className={styles.extLinks} onClick={(e) => e.stopPropagation()}>
          {hasLive && (
            <a
              className={styles.extLink}
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Live site of ${project.title}`}
            >
              Live ↗
            </a>
          )}
          {hasGithub && (
            <a
              className={styles.extLink}
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Source code of ${project.title}`}
            >
              Code ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
});

// Add display name to satisfy react/display-name rule
ProjectCard.displayName = "ProjectCard";

// Accepts either props.projectOverride or falls back to props.project (for compatibility)
const Project1 = ({ projectOverride, project, featured = false }) => {
  const cardProject = projectOverride || project;
  if (!cardProject) return null;
  return <ProjectCard project={cardProject} featured={featured} />;
};

export default Project1;
