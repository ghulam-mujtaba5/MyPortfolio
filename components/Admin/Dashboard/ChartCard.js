import styles from "./ChartCard.premium.module.css";

const ChartCard = ({ title, children, hasData }) => {
  return (
    <div className={styles.cardContainer}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.chartWrapper}>
        {hasData ? (
          children
        ) : (
          <p className={styles.noDataText}>
            No data available to display chart.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
