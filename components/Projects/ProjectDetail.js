import React from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import styles from "./ProjectDetail.module.css";

const ProjectDetail = ({ project }) => {
  const { theme } = useTheme();

  if (!project) {
    return <p>Project not found.</p>;
  }

  const { title, description, image, showImage, tags, category, links } =
    project;

  return (
    <div
      className={`${styles.container} ${theme === "dark" ? styles.dark : ""}`}
    >
      <h1 className={styles.title}>{title}</h1>
      {showImage && image && (
        <div className={styles.imageContainer}>
          {/* Use explicit width/height for responsive images (Next 13+ compatible) */}
          <Image
            src={image}
            alt={`${title} preview`}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ objectFit: "cover", width: "100%", height: "auto" }}
            priority
          />
        </div>
      )}
      <div className={styles.meta}>
        {category && <span className={styles.category}>{category}</span>}
        {Array.isArray(tags) && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {(links?.live || links?.github) && (
        <div className={styles.links}>
          {links?.live && (
            <a
              href={links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Live Preview
            </a>
          )}
          {links?.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Source Code
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
