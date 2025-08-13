import styles from "./DashboardSkeleton.module.css";

const SkeletonBox = ({ width, height }) => (
  <div className={styles.skeletonBox} style={{ width, height }} />
);

const DashboardSkeleton = () => {
  return (
    <div>
      <SkeletonBox width="200px" height="36px" />
      <div className={styles.grid}>
        <SkeletonBox height="100px" />
        <SkeletonBox height="100px" />
        <SkeletonBox height="100px" />
      </div>
      <div className={styles.gridTwoCols}>
        <SkeletonBox height="300px" />
        <SkeletonBox height="300px" />
      </div>
      <div className={styles.gridThreeCols}>
        <div className={styles.colSpanTwo}>
          <SkeletonBox height="200px" />
        </div>
        <SkeletonBox height="200px" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
