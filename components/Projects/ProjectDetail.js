import React from 'react';
import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext';
import styles from './ProjectDetail.module.css';

const ProjectDetail = ({ project }) => {
  const { theme } = useTheme();

  if (!project) {
    return <p>Project not found.</p>;
  }

  const { title, description, image, showImage, tags, category, links } = project;

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
      <h1 className={styles.title}>{title}</h1>
      {showImage && image && (
        <div className={styles.imageContainer}>
          <Image src={image} alt={`${title} preview`} layout="responsive" width={16} height={9} objectFit="cover" />
        </div>
      )}
      <div className={styles.meta}>
        <span className={styles.category}>{category}</span>
        <div className={styles.tags}>
          {tags.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />
      <div className={styles.links}>
        {links.live && <a href={links.live} target="_blank" rel="noopener noreferrer" className={styles.link}>Live Preview</a>}
        {links.github && <a href={links.github} target="_blank" rel="noopener noreferrer" className={styles.link}>Source Code</a>}
      </div>
    </div>
  );
};

export default ProjectDetail;
