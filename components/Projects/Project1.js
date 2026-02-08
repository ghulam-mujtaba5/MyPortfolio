import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";
import { resolveImageSrc } from "../OptimizedImage/OptimizedImage";
import styles from "./projectLight.module.css";
import darkStyles from "./ProjectDark.module.css";
import commonStyles from "./ProjectCommon.module.css";

const ProjectCard = React.memo(({ project, frameStyles, theme }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true); // Start visible to prevent flash
  const router = useRouter();

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "100px 0px", // preload images before they enter viewport
      },
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCardClick = useCallback(
    (e) => {
      // Don't trigger card click if clicking on links
      if (e.target.closest("a")) return;
      // Always navigate to detail page
      const slug = project?.slug || project?.slug?.toString?.();
      if (slug) router.push(`/projects/${slug}`);
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

  // Safely generate a unique title-id (no spaces, lowercase)
  const titleId = `project-title-${(project?.title || "untitled").replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <article
      className={`${commonStyles.projectCard1} ${frameStyles.projectCard1} ${isVisible ? styles.animate : ""}`}
      role="article"
      aria-labelledby={titleId}
      ref={cardRef}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex="0"
      style={{
        // Ensure card is visible even before observer fires
        opacity: 1,
        visibility: "visible",
      }}
    >
      <div
        className={`${commonStyles.projectCard1Child} ${frameStyles.projectCard1Child}`}
      />
      <div
        className={`${commonStyles.actions}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={commonStyles.leftAction}>
          {(() => {
            const live = String(project?.links?.live || "").trim();
            return live && live !== "#";
          })() && (
            <a
              className={`${commonStyles.livePreview} ${frameStyles.livePreview}`}
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Live Preview of ${project.title}`}
            >
              Live Preview
            </a>
          )}
        </div>
        <div className={commonStyles.rightAction}>
          {(() => {
            const gh = String(project?.links?.github || "").trim();
            return gh && gh !== "#";
          })() && (
            <a
              className={`${commonStyles.viewCode} ${frameStyles.viewCode}`}
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View Code of ${project.title}`}
            >
              View Code
            </a>
          )}
        </div>
      </div>
      {/* Project image with automatic retry & fallback */}
      {project?.showImage !== false && project?.image ? (() => {
        const { src, isExternal } = resolveImageSrc(project.image);
        const fit = project?.imageFit || "cover";
        return (
          <Image
            className={`${commonStyles.projectImg1} ${frameStyles.projectImg1}`}
            alt={`${project.title || "Project"} screenshot`}
            src={src}
            width={400}
            height={250}
            loading="lazy"
            unoptimized={isExternal}
            style={{ objectFit: fit }}
          />
        );
      })() : null}
      <h3
        className={`${commonStyles.projectTileGoes} ${frameStyles.projectTileGoes}`}
        id={titleId}
      >
        {project.title || "Untitled"}
      </h3>
      <div
        className={`${commonStyles.thisIsSample} ${frameStyles.thisIsSample}`}
        // Render rich text HTML from editor for accurate live preview
        dangerouslySetInnerHTML={{ __html: project?.description || "" }}
      />
      <div
        className={`${commonStyles.techStackContainer} ${frameStyles.techStackContainer}`}
      >
        <span
          className={`${commonStyles.techStackContainer1} ${frameStyles.techStackContainer1}`}
        >
          <span>Tech stack :</span>
          <span
            className={`${commonStyles.javaJavaFxMavenSpring} ${frameStyles.javaJavaFxMavenSpring}`}
          >
            <span className={commonStyles.span}>{` `}</span>
            <span>
              {Array.isArray(project?.tags) ? project.tags.join(", ") : ""}
            </span>
          </span>
        </span>
      </div>
      <Image
        className={`${commonStyles.githubIcon} ${frameStyles.githubIcon}`}
        alt="GitHub icon"
        src={theme === "dark" ? "/GithubDark.svg" : "/github_icon.svg"}
        width={24}
        height={24}
        loading="lazy"
      />
      <Image
        className={`${commonStyles.previewIcon1} ${frameStyles.previewIcon1}`}
        alt="Preview icon"
        src={theme === "dark" ? "/PreviewDark.svg" : "/preview_icon1.svg"}
        width={24}
        height={24}
        loading="lazy"
      />
    </article>
  );
});

// Add display name to satisfy react/display-name rule
ProjectCard.displayName = "ProjectCard";

// Accepts either props.projectOverride or falls back to props.project (for compatibility)
const Project1 = ({ projectOverride, project }) => {
  const { theme } = useTheme();
  const frameStyles = theme === "dark" ? darkStyles : styles;
  const cardProject = projectOverride || project;
  if (!cardProject) return null;
  return (
    <ProjectCard
      project={cardProject}
      frameStyles={frameStyles}
      theme={theme}
    />
  );
};

export default Project1;
