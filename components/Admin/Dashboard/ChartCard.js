import { useTheme } from "../../../context/ThemeContext";
import commonStyles from "./ChartCard.module.css";
import lightStyles from "./ChartCard.light.module.css";
import darkStyles from "./ChartCard.dark.module.css";

const ChartCard = ({ title, children, hasData }) => {
  const { theme } = useTheme();
  const styles = theme === "dark" ? darkStyles : lightStyles;

  return (
    <div className={`${commonStyles.cardContainer} ${styles.cardContainer}`}>
      <h2 className={`${commonStyles.title} ${styles.title}`}>{title}</h2>
      <div className={commonStyles.chartWrapper}>
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
