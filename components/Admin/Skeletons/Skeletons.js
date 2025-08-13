import { useTheme } from "next-themes";
import styles from "./Skeletons.module.css";

export const SkeletonBox = ({ width, height, className = "" }) => (
  <div
    className={`${styles.skeletonBox} ${className}`}
    style={{ width, height }}
  />
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
            <SkeletonBox width="80%" height="20px" />
            <SkeletonBox width="60%" height="16px" />
            <div className={styles.tags}>
              <SkeletonBox width="50px" height="20px" />
              <SkeletonBox width="70px" height="20px" />
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
            <SkeletonBox width="80%" height="20px" />
            <div className={styles.badges}>
              <SkeletonBox width="60px" height="20px" />
              <SkeletonBox width="80px" height="20px" />
            </div>
            <div className={styles.tags}>
              <SkeletonBox width="50px" height="20px" />
              <SkeletonBox width="70px" height="20px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
