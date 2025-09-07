import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../../context/ThemeContext";
import styles from "./ProjectDetail.module.css";

const ProjectDetail = ({ project }) => {
  const { theme } = useTheme();

  if (!project) return <p>Project not found.</p>;

  const {
    title,
    description,
    image,
    imageFit,
    showImage,
    tags = [],
    category,
    status,
    links = {},
    createdAt,
    updatedAt,
    views,
    slug,
  } = project;

  const created = useMemo(() => (createdAt ? new Date(createdAt) : null), [createdAt]);
  const updated = useMemo(() => (updatedAt ? new Date(updatedAt) : null), [updatedAt]);
  const hasLive = !!(links?.live && String(links.live).trim() && String(links.live).trim() !== "#");
  const hasGithub = !!(links?.github && String(links.github).trim() && String(links.github).trim() !== "#");

  return (
    <div className={`${styles.page} ${theme === "dark" ? styles.dark : ""}`}>
      {/* Hero header */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link href="/" className={styles.crumb}>Home</Link>
            <span className={styles.crumbSep}>/</span>
            <Link href="/projects" className={styles.crumb}>Projects</Link>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>{title}</span>
          </div>
          <h1 className={styles.title}>
            <span className={styles.gradientTitle}>{title}</span>
          </h1>
          <div className={styles.metaRow}>
            {category ? <span className={`${styles.badge} ${styles.badgePrimary}`}>{category}</span> : null}
            {status ? <span className={`${styles.badge} ${styles.badgeSoft}`}>{status}</span> : null}
            {typeof views === "number" ? (
              <span className={`${styles.badge} ${styles.badgeGhost}`}>{views.toLocaleString()} views</span>
            ) : null}
          </div>
          {(hasLive || hasGithub) && (
            <div className={styles.actions} style={{marginTop: '1.6rem', justifyContent: 'center'}}>
              {hasLive && (
                <a
                  href={links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{fontSize: '1.08rem', padding: '0 22px', minWidth: 140, boxShadow: '0 8px 32px rgba(37,99,235,0.13)'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden style={{marginRight: 8}}>
                    <path d="M14 3h7v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 14v7h-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Live Preview</span>
                </a>
              )}
              {hasGithub && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  style={{fontSize: '1.08rem', padding: '0 22px', minWidth: 140, boxShadow: '0 8px 32px rgba(34,34,59,0.10)'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden style={{marginRight: 8}}>
                    <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.31 6.84 9.65.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.16-1.11-1.47-1.11-1.47-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.13-4.56-5.05 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.31 9.31 0 0 1 12 6.84c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.93-2.34 4.78-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" fill="currentColor"/>
                  </svg>
                  <span>Source Code</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main content */}
      <div className={styles.container}>
        <div className={styles.layout}>
          <article className={styles.content}>
            {showImage && image ? (
              <div className={styles.imageContainer}>
                {(() => {
                  const img = String(image || "").trim();
                  const isExternal = /^https?:\/\//i.test(img) || /^\/\//.test(img) || /^data:image\//i.test(img) || /^blob:/.test(img);
                  const src = isExternal ? img : (img.startsWith("/") ? img : `/${img}`);
                  const fit = imageFit || "cover";
                  return (
                    <Image
                      src={src}
                      alt={`${title} preview`}
                      width={1600}
                      height={900}
                      sizes="(max-width: 768px) 100vw, 900px"
                      style={{ objectFit: fit, width: "100%", height: "auto" }}
                      priority
                      unoptimized={isExternal}
                    />
                  );
                })()}
              </div>
            ) : null}

            {Array.isArray(tags) && tags.length > 0 ? (
              <div className={styles.tagsRow}>
                {tags.map((t) => (
                  <span key={t} className={styles.tagChip}>{t}</span>
                ))}
              </div>
            ) : null}

            <div className={styles.prose} dangerouslySetInnerHTML={{ __html: description }} />

            {(hasLive || hasGithub) && (
              <div className={styles.ctaFooter}>
                {hasLive && (
                  <a href={links.live} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnPrimary}`}>
                    Visit Live
                  </a>
                )}
                {hasGithub && (
                  <a href={links.github} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnGhost}`}>
                    View on GitHub
                  </a>
                )}
              </div>
            )}
          </article>

          <aside className={styles.sidebar} aria-label="Project quick facts">
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Overview</h2>
              <ul className={styles.facts}>
                {category ? (
                  <li><span className={styles.factLabel}>Category</span><span className={styles.factValue}>{category}</span></li>
                ) : null}
                {status ? (
                  <li><span className={styles.factLabel}>Status</span><span className={styles.factValue}>{status}</span></li>
                ) : null}
                {created ? (
                  <li><span className={styles.factLabel}>Published</span><span className={styles.factValue}>{created.toISOString().slice(0, 10)}</span></li>
                ) : null}
                {updated ? (
                  <li><span className={styles.factLabel}>Updated</span><span className={styles.factValue}>{updated.toISOString().slice(0, 10)}</span></li>
                ) : null}
                {typeof views === "number" ? (
                  <li><span className={styles.factLabel}>Views</span><span className={styles.factValue}>{views.toLocaleString()}</span></li>
                ) : null}
              </ul>
              {(hasLive || hasGithub) && (
                <div className={styles.quickLinks}>
                  {hasLive && (
                    <a href={links.live} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnBlock} ${styles.btnPrimary}`}>Live Preview</a>
                  )}
                  {hasGithub && (
                    <a href={links.github} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnBlock} ${styles.btnGhost}`}>Source Code</a>
                  )}
                </div>
              )}
            </div>

            {Array.isArray(tags) && tags.length > 0 ? (
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Tech stack</h3>
                <div className={styles.tagCloud}>
                  {tags.map((t) => (
                    <span key={t} className={styles.tagPill}>{t}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
