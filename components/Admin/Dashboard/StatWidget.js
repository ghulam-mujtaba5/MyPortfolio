import { useTheme } from "../../../context/ThemeContext";
import commonStyles from "./StatWidget.module.css";
import lightStyles from "./StatWidget.light.module.css";
import darkStyles from "./StatWidget.dark.module.css";

const StatWidget = ({ icon, title, value }) => {
  const { theme } = useTheme();
  const styles = theme === "dark" ? darkStyles : lightStyles;

  return (
    <div
      className={`${commonStyles.widgetContainer} ${styles.widgetContainer}`}
    >
      <div className={`${commonStyles.iconContainer} ${styles.iconContainer}`}>
        {icon}
      </div>
      <div className={commonStyles.textContainer}>
        <p className={`${commonStyles.title} ${styles.title}`}>{title}</p>
        <p className={`${commonStyles.value} ${styles.value}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatWidget;
