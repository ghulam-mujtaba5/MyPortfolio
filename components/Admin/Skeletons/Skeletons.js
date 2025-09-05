import { useTheme } from "next-themes";
import styles from "./Skeletons.module.css";

export const SkeletonBox = ({ className = "" }) => (
  <div className={`${styles.skeletonBox} ${className}`} />
);

export const ArticleListSkeleton = () => {
  const { theme } = useTheme();
  return (
    <div className={`${styles.gridContainer} ${theme === "dark" ? styles.dark : ""}`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.imageContainer}>
            <SkeletonBox className={styles.image} />
          </div>
          <div className={styles.content}>
            <SkeletonBox className={`${styles.w80p} ${styles.h20}`} />
            <SkeletonBox className={`${styles.w60p} ${styles.h16}`} />
            <div className={styles.tags}>
              <SkeletonBox className={`${styles.w50} ${styles.h20}`} />
              <SkeletonBox className={`${styles.w70} ${styles.h20}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProjectListSkeleton = () => {
  return (
    <div className={styles.gridContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.card}>
          <SkeletonBox className={styles.image} />
          <div className={styles.content}>
            <SkeletonBox className={`${styles.w80p} ${styles.h20}`} />
            <div className={styles.badges}>
              <SkeletonBox className={`${styles.w60p} ${styles.h20}`} />
              <SkeletonBox className={`${styles.w80p} ${styles.h20}`} />
            </div>
            <div className={styles.tags}>
              <SkeletonBox className={`${styles.w50} ${styles.h20}`} />
              <SkeletonBox className={`${styles.w70} ${styles.h20}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
