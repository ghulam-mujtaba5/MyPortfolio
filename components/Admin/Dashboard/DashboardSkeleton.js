import styles from "./DashboardSkeleton.module.css";

const SkeletonBox = ({ className = "" }) => (
  <div className={`${styles.skeletonBox} ${className}`} />
);

const DashboardSkeleton = () => {
  return (
    <div>
      <SkeletonBox className={`${styles.w200} ${styles.h36}`} />
      <div className={styles.grid}>
        <SkeletonBox className={styles.h100} />
        <SkeletonBox className={styles.h100} />
        <SkeletonBox className={styles.h100} />
      </div>
      <div className={styles.gridTwoCols}>
        <SkeletonBox className={styles.h300} />
        <SkeletonBox className={styles.h300} />
      </div>
      <div className={styles.gridThreeCols}>
        <div className={styles.colSpanTwo}>
          <SkeletonBox className={styles.h200} />
        </div>
        <SkeletonBox className={styles.h200} />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
